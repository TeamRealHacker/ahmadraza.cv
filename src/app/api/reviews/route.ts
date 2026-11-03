import { NextResponse } from "next/server";
import { addReview, cleanText, deleteReview, readReviews } from "@/lib/reviews";
import { isAdminRequest } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/* Light per-IP rate limit: 3 reviews per 10 minutes per IP. */
const attempts = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 3) {
    attempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  attempts.set(ip, recent);
  return false;
}

export async function GET() {
  const list = await readReviews();
  return NextResponse.json({ reviews: list.slice(0, 50) }, { headers: NO_STORE });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE });
  }

  /* Admin delete (admin session cookie only). */
  if (body.action === "delete") {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Admin only" }, { status: 401, headers: NO_STORE });
    }
    const ok = await deleteReview(String(body.id ?? ""));
    return ok
      ? NextResponse.json({ ok: true }, { headers: NO_STORE })
      : NextResponse.json({ error: "Review not found" }, { status: 404, headers: NO_STORE });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many reviews — try again later" }, { status: 429, headers: NO_STORE });
  }

  const name = cleanText(String(body.name ?? ""), 80);
  const message = cleanText(String(body.message ?? ""), 500);
  const rating = Number(body.rating);
  if (!name || !message || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "A name, a 1–5 star rating, and a message are required" },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    const review = await addReview(name, rating, message);
    return NextResponse.json({ review }, { status: 201, headers: NO_STORE });
  } catch {
    /* e.g. read-only filesystem on a serverless host — see lib/reviews.ts. */
    return NextResponse.json({ error: "Reviews could not be saved right now" }, { status: 503, headers: NO_STORE });
  }
}
