/**
 * Visitor reviews — local-JSON storage, same pattern as the Life board's
 * local-json store (data/*.json). No new database dependency.
 *
 * HONEST CAVEAT: on Vercel, local-JSON writes are ephemeral — they do not
 * survive redeploys or spread across instances. Reviews submitted locally
 * work and list correctly, but durable reviews on live need the D1
 * database configured (wrangler.jsonc still has a placeholder database_id).
 */
import { promises as fs } from "node:fs";
import path from "node:path";

export type Review = {
  id: string;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
};

const FILE = "reviews.json";

async function filePath(): Promise<string> {
  const dir = path.join(process.cwd(), "data");
  await fs.mkdir(dir, { recursive: true });
  return path.join(dir, FILE);
}

export async function readReviews(): Promise<Review[]> {
  try {
    const raw = await fs.readFile(await filePath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is Review =>
        r && typeof r.id === "string" && typeof r.name === "string" &&
        typeof r.rating === "number" && typeof r.message === "string" &&
        typeof r.createdAt === "string",
    );
  } catch {
    return [];
  }
}

async function writeReviews(list: Review[]): Promise<void> {
  await fs.writeFile(await filePath(), JSON.stringify(list, null, 2), "utf8");
}

/** Strip HTML tags and control characters; keep plain text only. */
export function cleanText(value: string, max: number): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

export async function addReview(name: string, rating: number, message: string): Promise<Review> {
  const review: Review = {
    id: `r${Date.now().toString(36)}`,
    name: cleanText(name, 80),
    rating,
    message: cleanText(message, 500),
    createdAt: new Date().toISOString(),
  };
  const list = await readReviews();
  list.unshift(review);
  await writeReviews(list);
  return review;
}

export async function deleteReview(id: string): Promise<boolean> {
  const list = await readReviews();
  if (!list.some((r) => r.id === id)) return false;
  await writeReviews(list.filter((r) => r.id !== id));
  return true;
}
