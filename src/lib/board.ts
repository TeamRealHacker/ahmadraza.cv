import { reactionOptions, type LifePost, type ReactionKey } from "@/data/life";
import { getStore } from "@/lib/storage";

export type ReactionCounts = Record<string, Record<string, number>>;
export type BoardState = { posts: LifePost[]; counts: ReactionCounts };

/** The Life wall starts empty — no seed photos are shipped. */
const seed = (): BoardState => ({ posts: [], counts: {} });

export async function readBoard(): Promise<BoardState> {
  return (await getStore()).readBoard();
}

async function saveBoard(state: BoardState): Promise<void> {
  await (await getStore()).writeBoard(state);
}

const BUILT_IN = new Set<string>(reactionOptions.map((option) => option.key));
const isEmojiGlyph = (value: string) =>
  value.length > 0 &&
  value.length <= 24 &&
  /[\p{Extended_Pictographic}]/u.test(value) &&
  !/[A-Za-z<>`"'{}\[\]\\/]/.test(value);
/** Built-in keys plus any Unicode emoji a visitor added with the "+" button. */
const validEmoji = (value: string): value is ReactionKey => BUILT_IN.has(value) || isEmojiGlyph(value);

/** Only uploaded data-URIs, local assets or absolute https URLs are accepted. */
function safeSrc(value?: string): string {
  if (!value) return "";
  if (value.startsWith("data:image/") && value.length <= 3_000_000) return value;
  if (value.startsWith("/images/")) return value;
  if (value.startsWith("https://")) return value;
  return "";
}

export async function applyReaction(postId: string, emoji: string, delta: number): Promise<BoardState | null> {
  const state = await readBoard();
  if (!state.posts.some((p) => p.id === postId) || !validEmoji(emoji) || (delta !== 1 && delta !== -1)) return null;
  const current = state.counts[postId]?.[emoji] ?? 0;
  state.counts[postId] = { ...state.counts[postId], [emoji]: Math.max(0, current + delta) };
  await saveBoard(state);
  return state;
}

export async function addPost(input: {
  caption: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}): Promise<BoardState | null> {
  const caption = input.caption.trim().slice(0, 240);
  if (!caption) return null;
  const state = await readBoard();
  const id = `p${Date.now().toString(36)}`;
  state.posts.unshift({
    id,
    src: safeSrc(input.src),
    width: Math.min(2000, Math.max(320, Number(input.width) || 1200)),
    height: Math.min(2400, Math.max(320, Number(input.height) || 800)),
    alt: (input.alt || caption).slice(0, 140),
    caption,
    date: new Date().toISOString().slice(0, 10),
  });
  await saveBoard(state);
  return state;
}

export async function removePost(id: string): Promise<BoardState | null> {
  const state = await readBoard();
  if (!state.posts.some((p) => p.id === id)) return null;
  state.posts = state.posts.filter((p) => p.id !== id);
  delete state.counts[id];
  await saveBoard(state);
  return state;
}

/** Admin-only: rename a caption without touching the photo or reactions. */
export async function editPost(id: string, caption: string): Promise<BoardState | null> {
  const clean = caption.trim().slice(0, 240);
  if (!clean) return null;
  const state = await readBoard();
  const post = state.posts.find((p) => p.id === id);
  if (!post) return null;
  post.caption = clean;
  await saveBoard(state);
  return state;
}

/** Admin-only: wipe every reaction count, keep the posts. */
export async function clearReactions(): Promise<BoardState> {
  const state = await readBoard();
  state.counts = {};
  await saveBoard(state);
  return state;
}

/** Admin-only: empty the whole wall. */
export async function clearPosts(): Promise<BoardState> {
  const state: BoardState = { posts: [], counts: {} };
  await saveBoard(state);
  return state;
}

/** Shared visitor counter — Cloudflare D1 when bound, local JSON otherwise. */
export async function nextVisitor(): Promise<number> {
  return (await getStore()).nextVisitor();
}

export async function readVisitorCount(): Promise<number> {
  return (await getStore()).readVisitors();
}
