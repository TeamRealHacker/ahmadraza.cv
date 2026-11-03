import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Server-only admin session handling. This module must never be imported by
 * client components — it is only used by the /api/admin and
 * /api/admin/unlock routes.
 *
 * A session token is `<expiryMillis>.<hmac>`, where the HMAC is keyed by
 * ADMIN_SESSION_SECRET when set, otherwise by a random secret generated once
 * per server process. No session secret is stored in the repo.
 */
export const ADMIN_SESSION_COOKIE = "ar_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 2 * 60 * 60; // 2 hours

let runtimeSecret: string | null = null;

function sessionSecret(): string {
  const env = process.env.ADMIN_SESSION_SECRET;
  if (env) return env;
  if (!runtimeSecret) runtimeSecret = randomBytes(32).toString("hex");
  return runtimeSecret;
}

function sign(expiry: number): string {
  return createHmac("sha256", sessionSecret()).update(String(expiry)).digest("hex");
}

export function createSessionToken(): { token: string; maxAge: number } {
  const expiry = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  return { token: `${expiry}.${sign(expiry)}`, maxAge: ADMIN_SESSION_MAX_AGE_SECONDS };
}

export function sessionCookieHeader(token: string, maxAge: number): string {
  return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookieHeader(): string {
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function parseSessionCookie(req: Request): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === ADMIN_SESSION_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function verifySessionToken(token: string | null): boolean {
  if (!token) return false;
  const [expiryRaw, signature] = token.split(".");
  const expiry = Number(expiryRaw);
  if (!expiryRaw || !signature || !Number.isFinite(expiry)) return false;
  if (expiry <= Date.now()) return false;
  return safeEqual(signature, sign(expiry));
}

export function isAdminRequest(req: Request): boolean {
  return verifySessionToken(parseSessionCookie(req));
}

/** Timing-safe string comparison for the optional second password. */
export function safeStringEqual(a: string, b: string): boolean {
  return safeEqual(a, b);
}
