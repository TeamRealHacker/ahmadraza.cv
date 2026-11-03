/**
 * Storage layer for the portfolio.
 *
 * On Cloudflare (Workers / Pages via OpenNext) the real Cloudflare **D1**
 * SQLite database is used. Locally, or when no D1 credentials are configured,
 * the same operations fall back to the original `data/*.json` files. Every
 * caller is async, so switching backends never changes the API surface.
 *
 * Two ways to reach D1:
 *  1. native `env.DB` binding — enabled by `AR_D1_BINDING=1` (set in wrangler.jsonc)
 *  2. D1 REST API — enabled by `CF_ACCOUNT_ID`, `CF_D1_DATABASE_ID`, `CF_API_TOKEN`
 *
 * `db/schema.sql` is the same schema, for `wrangler d1 execute`.
 */
import type { Project } from "@/data/projects";
import type { BoardState } from "@/lib/board";

export type StorageKind = "cloudflare-d1" | "local-json";

export type Store = {
  kind: StorageKind;
  /** null = no overrides yet, so the compiled seed list should be used. */
  getProjects(): Promise<Project[] | null>;
  setProjects(list: Project[]): Promise<void>;
  readBoard(): Promise<BoardState>;
  writeBoard(state: BoardState): Promise<void>;
  readVisitors(): Promise<number>;
  nextVisitor(): Promise<number>;
};

type Row = Record<string, unknown>;
type BoundStatement = {
  bind(...args: unknown[]): BoundStatement;
  all(): Promise<{ results?: Row[] }>;
  run(): Promise<unknown>;
};
type D1Binding = { prepare(sql: string): BoundStatement };

type D1Client = {
  mode: "binding" | "rest";
  query<T extends Row = Row>(sql: string, params?: unknown[]): Promise<T[]>;
  exec(sql: string, params?: unknown[]): Promise<void>;
};

/** Native D1 binding, only attempted when the worker explicitly opts in. */
async function bindingClient(): Promise<D1Client | null> {
  if (process.env.AR_D1_BINDING !== "1") return null;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as Record<string, unknown> | undefined;
    const db = env?.DB as D1Binding | undefined;
    if (!db || typeof db.prepare !== "function") return null;

    const run = (sql: string, params: unknown[]) => {
      const statement = db.prepare(sql);
      return params.length ? statement.bind(...params) : statement;
    };
    return {
      mode: "binding",
      async query<T extends Row = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
        const result = await run(sql, params).all();
        return (result.results ?? []) as T[];
      },
      async exec(sql: string, params: unknown[] = []): Promise<void> {
        await run(sql, params).run();
      },
    };
  } catch {
    return null;
  }
}

/** D1 over the Cloudflare HTTP API — works from any Node or edge host. */
function restClient(): D1Client | null {
  const account = process.env.CF_ACCOUNT_ID;
  const database = process.env.CF_D1_DATABASE_ID;
  const token = process.env.CF_API_TOKEN;
  if (!account || !database || !token) return null;

  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${encodeURIComponent(database)}/query`;
  const query = async <T extends Row = Row>(sql: string, params: unknown[] = []): Promise<T[]> => {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json()) as {
      success?: boolean;
      result?: { results?: Row[] }[];
      errors?: { message?: string }[];
    };
    if (!res.ok || !json.success) {
      throw new Error(json.errors?.[0]?.message ?? `D1 query failed (${res.status})`);
    }
    return (json.result?.[0]?.results ?? []) as T[];
  };

  return {
    mode: "rest",
    query,
    async exec(sql, params = []) {
      await query(sql, params);
    },
  };
}

/** Kept in sync with db/schema.sql. D1 executes one statement per call. */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS projects (
     position INTEGER PRIMARY KEY,
     slug TEXT NOT NULL,
     payload TEXT NOT NULL,
     updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE TABLE IF NOT EXISTS documents (
     key TEXT PRIMARY KEY,
     payload TEXT NOT NULL,
     updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE TABLE IF NOT EXISTS counters (
     name TEXT PRIMARY KEY,
     value INTEGER NOT NULL DEFAULT 0
   )`,
  `INSERT OR IGNORE INTO counters (name, value) VALUES ('visitors', 20)`,
];

let clientPromise: Promise<D1Client | null> | undefined;
function getClient(): Promise<D1Client | null> {
  clientPromise ??= (async () => (await bindingClient()) ?? restClient())();
  return clientPromise;
}

let bootstrap: Promise<void> | undefined;

class D1Store implements Store {
  readonly kind = "cloudflare-d1" as const;
  constructor(private readonly db: D1Client) {}

  async getProjects(): Promise<Project[] | null> {
    const rows = await this.db.query<{ payload: string }>(
      `SELECT payload FROM projects ORDER BY position ASC`,
    );
    if (!rows.length) return null;
    const list = rows
      .map((row) => {
        try {
          return JSON.parse(row.payload) as Project;
        } catch {
          return null;
        }
      })
      .filter((p): p is Project => Boolean(p && typeof p.slug === "string"));
    return list.length ? list : null;
  }

  async setProjects(list: Project[]): Promise<void> {
    await this.db.exec(`DELETE FROM projects`);
    const now = new Date().toISOString();
    for (let i = 0; i < list.length; i++) {
      await this.db.exec(
        `INSERT INTO projects (position, slug, payload, updated_at) VALUES (?, ?, ?, ?)`,
        [i, list[i].slug, JSON.stringify(list[i]), now],
      );
    }
  }

  async readBoard(): Promise<BoardState> {
    const rows = await this.db.query<{ payload: string }>(
      `SELECT payload FROM documents WHERE key = 'board' LIMIT 1`,
    );
    if (!rows.length) return { posts: [], counts: {} };
    try {
      const parsed = JSON.parse(rows[0].payload) as Partial<BoardState>;
      return {
        posts: Array.isArray(parsed.posts) ? parsed.posts : [],
        counts: parsed.counts && typeof parsed.counts === "object" ? parsed.counts : {},
      };
    } catch {
      return { posts: [], counts: {} };
    }
  }

  async writeBoard(state: BoardState): Promise<void> {
    await this.db.exec(
      `INSERT INTO documents (key, payload, updated_at) VALUES ('board', ?, ?)
       ON CONFLICT(key) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
      [JSON.stringify(state), new Date().toISOString()],
    );
  }

  async readVisitors(): Promise<number> {
    const rows = await this.db.query<{ value: number }>(
      `SELECT value FROM counters WHERE name = 'visitors' LIMIT 1`,
    );
    return Number(rows[0]?.value ?? 20) || 20;
  }

  /** Atomic increment — no read/modify/write race between concurrent visits. */
  async nextVisitor(): Promise<number> {
    const rows = await this.db.query<{ value: number }>(
      `INSERT INTO counters (name, value) VALUES ('visitors', 21)
       ON CONFLICT(name) DO UPDATE SET value = value + 1
       RETURNING value`,
    );
    return Number(rows[0]?.value ?? 21) || 21;
  }
}

const BOARD_FILE = "board.json";
const VISITOR_FILE = "visitors.json";

class JsonStore implements Store {
  readonly kind = "local-json" as const;

  private async read(file: string): Promise<string> {
    const fs = await import("node:fs/promises");
    return fs.readFile(`${process.cwd()}/data/${file}`, "utf8");
  }

  private async write(file: string, value: unknown): Promise<void> {
    const fs = await import("node:fs/promises");
    const dir = `${process.cwd()}/data`;
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/${file}`, JSON.stringify(value, null, 2), "utf8");
  }

  async getProjects(): Promise<Project[] | null> {
    try {
      const parsed = JSON.parse(await this.read("projects.json")) as unknown;
      return Array.isArray(parsed) && parsed.length ? (parsed as Project[]) : null;
    } catch {
      return null;
    }
  }

  async setProjects(list: Project[]): Promise<void> {
    await this.write("projects.json", list);
  }

  async readBoard(): Promise<BoardState> {
    try {
      const parsed = JSON.parse(await this.read(BOARD_FILE)) as Partial<BoardState>;
      return {
        posts: Array.isArray(parsed.posts) ? parsed.posts : [],
        counts: parsed.counts && typeof parsed.counts === "object" ? parsed.counts : {},
      };
    } catch {
      return { posts: [], counts: {} };
    }
  }

  async writeBoard(state: BoardState): Promise<void> {
    await this.write(BOARD_FILE, state);
  }

  async readVisitors(): Promise<number> {
    try {
      return Number(JSON.parse(await this.read(VISITOR_FILE)).count) || 20;
    } catch {
      return 20;
    }
  }

  async nextVisitor(): Promise<number> {
    const count = (await this.readVisitors()) + 1;
    await this.write(VISITOR_FILE, { count });
    return count;
  }
}

async function resolveStore(): Promise<Store> {
  const client = await getClient().catch(() => null);
  if (!client) return new JsonStore();
  try {
    bootstrap ??= (async () => {
      for (const sql of SCHEMA) await client.exec(sql);
    })();
    await bootstrap;
    return new D1Store(client);
  } catch {
    bootstrap = undefined;
    return new JsonStore();
  }
}

let storePromise: Promise<Store> | undefined;
export function getStore(): Promise<Store> {
  storePromise ??= resolveStore();
  return storePromise;
}

export async function storageKind(): Promise<StorageKind> {
  return (await getStore()).kind;
}
