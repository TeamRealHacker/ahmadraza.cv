-- Cloudflare D1 schema for Ahmad Raza's portfolio.
-- Apply with:  npm run db:migrate:local   /   npm run db:migrate
-- The app also creates these tables lazily on its first D1 request, so a fresh
-- deployment works even before the CLI migration is run.

CREATE TABLE IF NOT EXISTS projects (
  position    INTEGER PRIMARY KEY,
  slug        TEXT NOT NULL,
  payload     TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- The Life wall is kept as one document so a reaction or a new post is a
-- single upsert instead of a multi-statement transaction.
CREATE TABLE IF NOT EXISTS documents (
  key         TEXT PRIMARY KEY,
  payload     TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS counters (
  name   TEXT PRIMARY KEY,
  value  INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO counters (name, value) VALUES ('visitors', 20);
