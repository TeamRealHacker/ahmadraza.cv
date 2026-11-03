/**
 * Offline check that db/schema.sql and every query used by src/lib/storage.ts
 * are valid Cloudflare D1 SQL. Uses Miniflare's real SQLite D1 emulator, so it
 * needs no Cloudflare account, token or network access.
 *
 *   npm run db:verify
 */
import { readFileSync } from "node:fs";
import { Miniflare } from "miniflare";

const mf = new Miniflare({
  modules: true,
  script: `export default { fetch() { return new Response("ok"); } };`,
  d1Databases: { DB: "verify-local" },
});

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "OK  " : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

try {
  const db = await mf.getD1Database("DB");
  const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
    .split("\n").filter((line) => !line.trim().startsWith("--")).join("\n");
  for (const stmt of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await db.prepare(stmt).run();
  }
  check("schema.sql executes on a D1 database", true);

  // projects
  await db.prepare("DELETE FROM projects").run();
  await db
    .prepare("INSERT INTO projects (position, slug, payload, updated_at) VALUES (?, ?, ?, ?)")
    .bind(0, "centerface-ai", JSON.stringify({ slug: "centerface-ai", title: "CenterFace Ai" }), new Date().toISOString())
    .run();
  const projects = await db.prepare("SELECT payload FROM projects ORDER BY position ASC").all();
  check("projects: insert + ordered read", projects.results.length === 1 && JSON.parse(projects.results[0].payload).slug === "centerface-ai");

  // documents (Life wall)
  await db
    .prepare("INSERT INTO documents (key, payload, updated_at) VALUES ('board', ?, ?) ON CONFLICT(key) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at")
    .bind(JSON.stringify({ posts: [], counts: {} }), new Date().toISOString())
    .run();
  const board = await db.prepare("SELECT payload FROM documents WHERE key = 'board' LIMIT 1").all();
  check("documents: upsert + read", JSON.parse(board.results[0].payload).posts.length === 0);

  // atomic visitor counter
  await db.prepare("INSERT OR IGNORE INTO counters (name, value) VALUES ('visitors', 20)").run();
  const one = await db
    .prepare("INSERT INTO counters (name, value) VALUES ('visitors', 21) ON CONFLICT(name) DO UPDATE SET value = value + 1 RETURNING value")
    .all();
  const two = await db
    .prepare("INSERT INTO counters (name, value) VALUES ('visitors', 21) ON CONFLICT(name) DO UPDATE SET value = value + 1 RETURNING value")
    .all();
  check("counters: atomic increment", Number(one.results[0]?.value) === 21 && Number(two.results[0]?.value) === 22, `${one.results[0]?.value} → ${two.results[0]?.value}`);
} catch (error) {
  check("D1 verification", false, String(error?.message ?? error));
} finally {
  await mf.dispose();
}

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll D1 checks passed.");
process.exit(failures ? 1 : 0);
