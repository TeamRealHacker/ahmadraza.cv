import { NextResponse } from "next/server";
import { storageKind } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await storageKind();
  return NextResponse.json(
    { ok: true, service: "portfolio", database, d1: database === "cloudflare-d1" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
