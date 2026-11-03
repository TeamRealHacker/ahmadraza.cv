import { NextResponse } from "next/server";
import { applyReaction, readBoard } from "@/lib/board";

export const dynamic = "force-dynamic";

/** Compatibility endpoint for the original reaction widget. */
export async function GET() {
  const board = await readBoard();
  return NextResponse.json(board.counts);
}

export async function POST(req: Request) {
  const body = (await req.json()) as { postId?: string; emoji?: string; delta?: number };
  const state = await applyReaction(String(body.postId ?? ""), String(body.emoji ?? ""), Number(body.delta));
  if (!state) return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  return NextResponse.json({ count: state.counts[body.postId!]?.[body.emoji!] ?? 0 });
}
