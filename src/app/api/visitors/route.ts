import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nextVisitor } from "@/lib/board";

export const dynamic = "force-dynamic";

const COOKIE = "ar_visitor";

export async function POST() {
  const jar = await cookies();
  const existing = Number(jar.get(COOKIE)?.value);
  if (Number.isInteger(existing) && existing > 0) {
    return NextResponse.json({ count: existing });
  }
  const count = await nextVisitor();
  const res = NextResponse.json({ count });
  res.cookies.set(COOKIE, String(count), {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
