# Deploying to Cloudflare with D1

The site still runs completely standalone (`npm install && npm run build && npm start`)
with zero configuration. When you deploy to Cloudflare, the same code switches
automatically to a real **Cloudflare D1 (SQLite) database**.

## What is wired up

| File | Purpose |
| --- | --- |
| `db/schema.sql` | D1 tables: `projects`, `documents`, `counters` |
| `wrangler.jsonc` | Worker config, `ASSETS`, `vars.AR_D1_BINDING`, `d1_databases` → `DB` |
| `open-next.config.ts` | OpenNext Cloudflare adapter (Next 16 → Worker) |
| `src/lib/storage.ts` | Storage adapter: D1 binding → D1 REST API → local JSON fallback |
| `.env.example` | Optional REST credentials for non-Worker hosts |
| `scripts/verify-d1.mjs` | Offline test of the schema and every SQL query (Miniflare) |

**What moves to D1:** published projects (admin → Projects), the `/life` wall
and its reactions, and the shared visitor counter. Everything else is static.

`/api/health` reports `"cloudflare-d1"` or `"local-json"`, and the admin
Overview shows which backend is live.

## 1 — Create the database

```bash
npm install
npm run db:create          # wrangler d1 create ahmadraza-portfolio
```

Copy the printed `database_id` into `wrangler.jsonc` → `d1_databases[0].database_id`.
Then apply the schema:

```bash
npm run db:migrate         # remote
npm run db:migrate:local   # local emulator
```

The app also runs `CREATE TABLE IF NOT EXISTS` lazily on its first D1 request,
so a fresh deployment self-initialises. The CLI migration is still recommended.

## 2 — Build & deploy

```bash
npm run cf:build           # opennextjs-cloudflare build
npm run cf:deploy          # opennextjs-cloudflare deploy
```

`cf:dev` runs the whole app locally against Cloudflare's runtime; `cf:preview`
serves the built Worker locally. `npm run db:verify` checks the SQL offline and
needs no account or network.

## 3 — Alternative: D1 from any host (REST API)

If you are not deploying the Worker (Vercel, a VPS, or plain `npm start`), set:

```bash
CF_ACCOUNT_ID=...          # Cloudflare account id
CF_D1_DATABASE_ID=...      # the id from step 1
CF_API_TOKEN=...           # token with the "D1:Edit" permission
```

With those three present, `src/lib/storage.ts` talks to D1 via
`POST /client/v4/accounts/:id/d1/database/:db/query`. Never expose the token to
the browser — it is only read by server-side API routes.

## 4 — Local / offline

If no binding and no REST credentials are configured, the original
`data/*.json` files are used. Nothing breaks, and the admin console still works.
Delete `data/projects.json` (or press **Reset to seed**) to return to the seven
built-in projects.

## Notes

- The `/api/admin` token is an **easter egg**, not authentication. On a public
  Cloudflare deployment, protect `/api/board`, `/api/reactions` and `/api/admin`
  with real credentials or Cloudflare Access before letting strangers post.
- The visitor counter uses a single atomic `INSERT … ON CONFLICT DO UPDATE …
  RETURNING value` statement, so concurrent visits cannot lose increments.
- `data/board.json`, `data/visitors.json` and `data/projects.json` are gitignored;
  only `data/README.md` ships with the source.

## Verified locally

The Worker was run against a **local D1 database** with `wrangler dev --local`
(using the `env.DB` binding from `wrangler.jsonc`). Results:

```
GET  /api/health          {"database":"cloudflare-d1","d1":true}
GET  /api/admin           storage: cloudflare-d1, 7 projects
POST /api/admin           project-add → /work shows it, sitemap includes it,
                          /work/d1-worker returns 200  (no rebuild)
POST /api/visitors  ×2    22 → 23 (atomic SQL increment)
POST /api/board           Life post persisted in D1
POST /api/admin           project-reset → 7 projects
```

`npm run cf:build` produces `.open-next/worker.js`, and
`wrangler deploy --dry-run` recognises `env.DB`, `env.ASSETS` and
`env.AR_D1_BINDING`. `npm run db:verify` checks the schema and all queries
offline through Miniflare's real SQLite D1 emulator.

> `compatibility_date` is set to `2025-04-01` so the pinned Wrangler 4.86 can
> run the Worker locally. You can bump it after upgrading Wrangler; a date in
> the future is rejected by the local runtime.
