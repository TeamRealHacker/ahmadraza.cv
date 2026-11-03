# Runtime data (local fallback)

`board.json` (Life posts + reactions), `visitors.json` (visitor counter) and
`projects.json` (admin-published projects) are created automatically the first
time someone posts, reacts, visits or publishes. They are intentionally **not**
committed — deleting them resets the Life wall to empty and projects to the
seven compiled seeds.

**On Cloudflare these files are not used at all.** `src/lib/storage.ts` writes to
a real **Cloudflare D1** database instead (see `CLOUDFLARE.md`). The JSON files
are the zero-configuration fallback for plain `npm start` / local development;
no credentials are needed for them.

On a purely static host the Life widgets additionally fall back to browser
`localStorage`.
