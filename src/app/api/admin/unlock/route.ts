import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  clearSessionCookieHeader, createSessionToken, safeStringEqual, sessionCookieHeader,
} from "@/lib/admin-session";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Server-only riddle-key check. This hash lives ONLY here — it is not
 * exported from any client-bundled module, and the answer is never sent to
 * the browser. The route only ever answers ok / unauthorised / locked-out.
 */
const RIDDLE_KEY_HASH = "ec04eb3905649ec576c54e85d99f00be7dbec3977a34cc86a2ee0646e0abbfd2";

const MAX_FAILED = 5;
const WINDOW_MS = 10 * 60 * 1000;

type Attempt = { fails: number; firstAt: number };
const attempts = new Map<string, Attempt>();

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function normaliseKey(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function lockedOut(ip: string): boolean {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return entry.fails >= MAX_FAILED;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(ip, { fails: 1, firstAt: now });
  } else {
    entry.fails += 1;
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (lockedOut(ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts — try again later" },
      { status: 429, headers: NO_STORE },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    recordFailure(ip);
    return NextResponse.json({ error: "Invalid request" }, { status: 401, headers: NO_STORE });
  }

  const key = normaliseKey(String(body.key ?? ""));
  const digest = createHash("sha256").update(key).digest("hex");
  const keyOk = digest === RIDDLE_KEY_HASH;

  const requiredPass = process.env.ADMIN_PASS;
  const passOk = !requiredPass || safeStringEqual(String(body.pass ?? ""), requiredPass);

  if (!key || !keyOk || !passOk) {
    recordFailure(ip);
    return NextResponse.json({ error: "Invalid key" }, { status: 401, headers: NO_STORE });
  }

  attempts.delete(ip);
  const { token, maxAge } = createSessionToken();
  const res = NextResponse.json({ ok: true }, { headers: NO_STORE });
  res.headers.set("Set-Cookie", sessionCookieHeader(token, maxAge));
  return res;
}

/** Lock again: clears the session cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true }, { headers: NO_STORE });
  res.headers.set("Set-Cookie", clearSessionCookieHeader());
  return res;
}
