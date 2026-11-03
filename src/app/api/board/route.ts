import { NextResponse } from "next/server";
import { addPost, applyReaction, readBoard, removePost } from "@/lib/board";
import { isAdminRequest } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readBoard(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "react") {
    const state = await applyReaction(String(body.postId ?? ""), String(body.emoji ?? ""), Number(body.delta));
    return state ? NextResponse.json(state) : NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }

  /* Posting and deleting moments is admin-only. The Life wall composer is
     hidden for visitors; this server gate is what actually enforces it —
     reactions above stay public. */
  if (body.action === "post" || body.action === "delete") {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Admin only" }, { status: 401 });
    }
  }

  if (body.action === "post") {
    const state = await addPost({
      caption: String(body.caption ?? ""),
      src: typeof body.src === "string" ? body.src : undefined,
      alt: typeof body.alt === "string" ? body.alt : undefined,
      width: Number(body.width) || undefined,
      height: Number(body.height) || undefined,
    });
    return state ? NextResponse.json(state) : NextResponse.json({ error: "A caption is required" }, { status: 400 });
  }

  if (body.action === "delete") {
    const state = await removePost(String(body.id ?? ""));
    return state ? NextResponse.json(state) : NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
