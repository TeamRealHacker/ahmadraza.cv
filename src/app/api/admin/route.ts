import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import {
  addPost, clearPosts, clearReactions, editPost, readBoard, readVisitorCount, removePost,
} from "@/lib/board";
import {
  deleteProject, getProjects, resetProjects, upsertProject,
} from "@/lib/projects-store";
import { API_ROUTES, HIDDEN_ROUTES, SITE_FACTS } from "@/data/audit";
import type { BoardState } from "@/lib/board";
import { storageKind } from "@/lib/storage";
import type { Project } from "@/data/projects";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
/* Authorised ONLY by the HttpOnly session cookie set by the unlock route. */
const authorised = (req: Request) => isAdminRequest(req);

function denied() {
  return NextResponse.json({ error: "No key" }, { status: 401, headers: NO_STORE });
}

async function payload(state: BoardState, visitors: number, list: Project[]) {
  const database = await storageKind();
  const reactions = Object.values(state.counts).reduce((sum, row) =>
    sum + Object.values(row).reduce((a, b) => a + b, 0), 0);
  return {
    board: state,
    visitors,
    reactions,
    posts: state.posts.length,
    generatedAt: new Date().toISOString(),
    projects: list,
    routes: {
      public: [
        { path: "/", label: "Home" },
        { path: "/about", label: "About" },
        { path: "/work", label: "Work" },
        { path: "/life", label: "Life" },
        ...list.map((p) => ({ path: `/work/${p.slug}`, label: p.title })),
      ],
      hidden: HIDDEN_ROUTES,
    },
    apis: API_ROUTES,
    facts: {
      ...SITE_FACTS,
      projectCount: list.length,
      projects: list.map((p) => ({ slug: p.slug, title: p.title, year: p.year, accent: p.accent })),
      storage: database,
    },
    health: { ok: true, service: "portfolio", database },
    storage: database,
  };
}

async function respond(state: BoardState) {
  return NextResponse.json(await payload(state, await readVisitorCount(), await getProjects()), { headers: NO_STORE });
}

export async function GET(req: Request) {
  if (!authorised(req)) return denied();
  return respond(await readBoard());
}

export async function POST(req: Request) {
  if (!authorised(req)) return denied();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE });
  }

  /* Project publishing — stored in D1 (or data/projects.json locally) and immediately
     appear on /work, /work/[slug], the sitemap and the admin audit. */
  if (body.action === "project-add" || body.action === "project-edit") {
    const input = (body.project ?? {}) as Record<string, unknown>;
    const list = await upsertProject(input);
    if (!list) return NextResponse.json({ error: "A valid title and slug are required" }, { status: 400, headers: NO_STORE });
    return respond(await readBoard());
  }
  if (body.action === "project-delete") {
    const list = await deleteProject(String(body.slug ?? ""));
    if (!list) return NextResponse.json({ error: "Project not found" }, { status: 404, headers: NO_STORE });
    return respond(await readBoard());
  }
  if (body.action === "project-reset") {
    await resetProjects();
    return respond(await readBoard());
  }

  let state: BoardState | null = null;
  switch (body.action) {
    case "add":
      state = await addPost({
        caption: String(body.caption ?? ""),
        src: typeof body.src === "string" ? body.src : undefined,
        alt: typeof body.alt === "string" ? body.alt : undefined,
        width: Number(body.width) || undefined,
        height: Number(body.height) || undefined,
      });
      break;
    case "edit":
      state = await editPost(String(body.id ?? ""), String(body.caption ?? ""));
      break;
    case "delete":
      state = await removePost(String(body.id ?? ""));
      break;
    case "clear-reactions":
      state = await clearReactions();
      break;
    case "clear-posts":
      state = await clearPosts();
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400, headers: NO_STORE });
  }
  if (!state) return NextResponse.json({ error: "Could not apply that change" }, { status: 400, headers: NO_STORE });
  return respond(state);
}
