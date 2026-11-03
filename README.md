# Ahmad Raza — personal portfolio

Clean, minimal personal portfolio built from the downloaded
`minimalist-nextjs-portfolio-development.zip`. Project data comes from
<https://realhackers.pages.dev/>. No studio/team pages.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck && npm run lint
```
Node 20.9+. Zero configuration by default (local JSON files). On Cloudflare it uses a real **D1** database — see [CLOUDFLARE.md](./CLOUDFLARE.md). No Postgres, no ORM.

## Layout

1. **Hero** — a **contained horizontal banner** (max 1024px wide, 480px tall on desktop / 300px on phones), rounded corners and a thin border — not a full-screen section. Behind it is a **real-photograph-style** night sky (Milky Way, blood moon, sun, sunset, midnight) with **twinkling + falling/shooting stars**, a vertical **"AHMAD"** label on the left, cream **"I Work For Real !!"** pixel type, gentle parallax, and a **minimal sky control sitting directly on the banner**: five **real celestial-body thumbnails** (Saturn, a blood moon, the Sun, Jupiter, Neptune) plus the active sky's name tinted with that sky's accent. No colour-only dots, no bar, no container, no sparkle/SKY icon, no badge, rules, indices or pulsing dot — the active planet grows slightly and gets an accent ring. Five switchable skies — **Space, Red Moon, Sun, Sunset, Midnight** — each with its own desktop (1600×560) and phone (800×800) artwork; the choice is remembered in `localStorage`. A faint dark wash keeps the heading readable on the brighter skies. No eyebrow, subtitle, divider, scroll hint or frame. The whole page also has a very soft ambient sky glow behind the content.
2. **GitHub activity** — compact contribution graph directly under the hero (live API, offline fallback).
3. **Profile** — an **open editorial section, explicitly NOT a card**: no box, border, fill or shadow around it. A tall framed portrait on the left, a very large pixel-font name with a short accent underline, kicker with a **crisp 3:2 Pakistan flag**, handle/role, bio, accent tagline link and the two action buttons. A single hairline rule separates the meta row (location, flag, domain) and the two clean stats.
4. **Selected work (home)** — an editorial **“Things I’ve shipped”** masthead in the **pixel display font** — accent rule above it, a pixel-square divider below the title, a soft accent glow on *shipped*, a small real Pakistan flag in the kicker and a bordered "All work" pill — then **4 of 7** projects: one full-width cinematic feature + three alternating split spreads, followed by a compact pill index of the remaining work (**Auto Max**, Tark Place, Pulse Mobile) with coloured dots and **no numeric badges**. All 7 are on `/work`. **Every project screenshot is now a video that is already playing** — muted, looping and inline, so there is no play button to press and no click needed. The site's real screen recording replaces the static image on the home showcase, `/work` and the case-study preview. **All leftover numbering and card chrome was removed**: no `01 / 07` badges, no years in the eyebrows, no REC chips, no scrim, no hover "View case study" pill, no "Full screen" buttons. A project is now just the playing recording, its title, one-line tagline and two text links.
   - Chamfered frames, oversized balanced titles, accent glow, zoom + accent sweep on hover.
   - **Each project's own accent colour** drives a small swatch in the eyebrow, the left accent bar, the badge dot, the hover glow/title shadow and the "Explore project" link. Yellow/purple accents also colour the profile stats.
   - Only the playing recording, name, one-line tagline and two text links per project — **no numbers, no index, no year, no badges**.
5. **Site tour** — a compact **“In twenty seconds”** reel on the home page: a real ~21-second screen recording of the live site (home → work → about → life → case study → home), 960×600 WebM, **already playing in place** with a poster for first paint, a REC dot, an expand icon and a soft accent glow. The same recording plays inside the admin console. `public/videos/ar-tour.webm`.
6. **Footer** — kept minimal but made **smooth**: a slow accent aurora behind it, staggered fade-up reveals, spring-eased "Say hello" CTA with a soft accent halo, gently floating Morpheus artwork, a slowly drifting ghost wordmark, and a faint accent hairline. All motion is compositor-only (`transform`/`opacity`) and is disabled under `prefers-reduced-motion`. Big **“Let’s build something real”** headline in the pixel display font, a “Say hello” button plus mail link, the user-supplied Morpheus artwork, and a redesigned end block: a **quick-nav row** (Home / Work / Life / About) beside a handwritten **“— Ahmad”** signature with the Pakistan flag and Faisalabad, then meta/socials/visitor row, a huge ghost **Ahmad Raza** wordmark, and a clean “Back to top” line.

**Theme switch** is a floating button at the **bottom-left** (back-to-top stays bottom-right); it is no longer in the navbar. It is also available in the right-click quick menu. A **pencil-style handwritten note** ("theme changer") with a hand-drawn curved arrow points right at it, plus a slim pencil **ring with a sky-accent arc** around the button — Caveat handwriting font, warm chalk in the dark palette. The ring swells gently on hover, picks up the active sky colour, gets a soft accent halo, and is hidden on phones so it never covers text. **The note never covers profile text:** it shows only at widths ≥1280px while the page is at the top, and hides as soon as you scroll (or on any narrower screen), leaving just the compact pencil ring + arrow.

**The Matrix artwork is interactive:** there are no visible buttons. The **blue hand** is a click target (scrolls back to the top) and the **red hand** opens `/life`. Hovering a hand shows a soft coloured glow + tiny label; tapping works on mobile.

**Sky themes** live on the banner itself (separate from the light/dark theme switch): Space, Red Moon, Sun, Sunset and Midnight. The five themes, labels, swatches and accent colours are shared from `src/data/skies.ts` and stored under the single `ar_sky_theme` key, so **Home, `/about` and `/life` always show the same sky**. Shooting stars animate on a canvas that pauses when offscreen and respects reduced-motion.

**Choosing a sky changes the whole UI, not just the banner.** Each of the five skies has a full light + dark palette in `globals.css` (`--bg`, `--fg`, `--muted`, `--line`, `--card`, `--glow-a/b`, `--sky-ambient`, `--sky-ink`), so the page background, cards, borders, navbar, buttons, footer, ambient wash, About/Life accents and the picker itself all re-tint together. `--sky-ink` is a contrast-safe darker accent for text on light pages while the dark cosmic heroes keep the bright `--sky-ambient`. Because the palette is registered with CSS `@property`, the change **cross-fades** over ~0.5s. The sky is restored before first paint by `themeInitScript`, so there is no flash of the default palette. Right-click anywhere → **Change sky** cycles the themes from any page.

**Tabs:** Home · Work · Life · About · Contact (plus two unlisted routes — see below).
- `/about` — full-bleed **cosmic About hero** that follows the sky theme chosen on the home banner (accent colour + matching artwork + shooting stars). Huge animated name, handwritten **Ahmad** signature, email with a working **copy** button, "See the work". Below it: count-up stats (`07` builds / `12` tools / `01` human), a sticky GitHub portrait with mouse spotlight and `@MrRealORG` tag, a numbered **timeline** (Who I am / How I got here / What I do), a 12-item toolbox grid, social tiles and a handwritten sign-off. All real profile data, no invented team/studio content. In the navbar, sitemap and right-click menu.
- `/work` — full archive of all 7 projects under a large “Things I’ve shipped” masthead, same showcase, no filters.
- `/work/[slug]` — case study with framed screenshot, 3 short highlights, short description, live link and a **next-project card**: a small screenshot thumbnail with a stacked (“duo”) ghost card behind it, an iOS-like spring, a smooth top-of-page scroll and a page “swell” on navigation. Opening a case study also makes the **whole site inherit that project’s screenshot colour** (`--sky-ambient`, both ambient glows); leaving restores the chosen sky.
- `/life` — an **About-style cosmic hero first** ("Life, unfiltered.", animated name, `moments — @MrRealORG`, shooting stars, count-up stats, "New moment" CTA), synced to the same sky theme. **The wall is empty by default — all six seed photographs were deleted.** Ahmad uploads his own photos with the composer; text-only moments get a gradient placeholder instead of a stock image. A polished empty state invites the first upload. Below it: masonry posts with the 5 built-in Lucide reactions, double-tap love, toast/burst feedback, and a **per-post `+` button** with 36 starter emojis, **12 animated emoji stickers** (CSS bob / wiggle / pulse / spin / flicker / float / twinkle / beat — no GIFs, no network assets) and a "paste any emoji" field; custom emojis are isolated per post in `localStorage` (`ar_custom_reactions_v1`). Emoji glyphs are served from an expanded self-hosted Noto Color Emoji subset so every built-in and animated emoji renders everywhere. **Big-screen viewing**: a full-viewport lightbox with zoom, real browser **Fullscreen API** (`F`), prev/next arrows (`← →`), `Esc` to close, caption and reactions. Rendered through a `createPortal` on `document.body` so it always covers the viewport. Reactions/posts are shared via `/api/board` → `data/board.json`, with a localStorage fallback on static hosts.

**Soft + smooth, across the whole site:** three non-fixed, sky-tinted radial gradients sit behind every route and follow the sky chosen on the banner. No grain layer, no `background-attachment: fixed`, no infinite background pulse. The palette is registered with CSS `@property`, so switching light/dark or changing the sky **cross-fades** the entire page instead of snapping. Smooth scrolling with `scroll-padding-top` for the floating navbar, an `is-scrolled` glass state on that navbar, soft image fade-ins, consistent easing on cards/buttons/links, a slim themed scrollbar, and `MotionConfig reducedMotion="user"` + CSS reduced-motion rules for anyone who prefers less motion. No extra widgets, no parallax clutter, no heavy blur layers over the content.

## Hidden vault & admin console (secret easter egg)

An **ultra-hard-to-find, deliberately analysable** easter egg. Nothing is linked from the navbar, sitemap or any page.

| Layer | Where |
| --- | --- |
| Hidden door | `/vault/9f4c2e` — disallowed in `robots.txt`, absent from the sitemap, `noindex` |
| Riddle | *"A door that no map lists. Three keys: the count, the creed, the choice."* |
| Machine-readable clues | `public/llms.txt`, `public/.well-known/ar-vault.json`, `<meta name="ar-vault">`, a `robots.txt` comment |
| Human-readable clues | the tiny footer whisper (`title`), the On-page "Where are the clues?" toggle (vague pointers), the `07 · 12 · 01` line in the gate |
| Console gate | `__AR.hint()` prints the three explicit clues; `__AR.vault()` opens the door |
| Key | `count + creed + choice`, concatenated as one uppercase A–Z 0–9 word. Verified in the browser with **SHA-256** (`src/lib/vault.ts`), then a `sessionStorage` token unlocks `/admin` |
| Admin API | `/api/admin` — `GET` state / `POST` actions, requires the `x-ar-admin` header. Returns 401 without a key |

`/admin` shows a locked screen with no session; the public chrome (navbar, theme button, back-to-top, crown cursor) is hidden on both secret routes.

**Admin console — 9 tabs:** Overview (6 live stat tiles, recent activity, quick actions, quick links, health), Life wall (upload + publish, inline caption edit, delete, clear wall), **Projects** (publish / edit / delete / reset projects), Reactions (per-emoji totals with bars, reset all, live animated-emoji palette), **Recordings** (all 7 project videos plus the full site tour), Audience (visitors + local page-view journal), Appearance (all 5 skies + light/dark — changes the real site instantly), Site audit (copyable machine-readable JSON report: routes, projects, APIs, skills, storage, health), and Site tour (the recorded reel). Every destructive action goes through the key-protected admin API.

The console now **looks like the site**: the same sky palette (including the 5 real-planet sky strip in the header), the same pixel display font, hairline rules, pill buttons, soft cards and hover easing — in both light and dark. It keeps its dashboard layout rather than duplicating the public navbar/footer.

> This is **obfuscation, not authentication**. The clues, the token and the hash are intentionally present in the client bundle so a human or an AI analysing the source can solve it. It must never protect real secrets. The public `/api/board` endpoints stay open because the Life composer is a public feature — lock them behind a real server-side credential if you deploy this where strangers can post.

## Project recordings & publishing

Seven real Playwright screen recordings (800×500 WebM, ~4–6 s each) live in `public/videos/project-*.webm`: the five reachable live project sites (CenterFace AI, Auto Max, RealXrTTs, Danger Agent X, Minal Enterprises) plus the two case studies without a live URL (**Tark Place**, **Pulse Mobile**). They are **self-hosted** — nothing is hotlinked — and mapped to projects in `src/data/project-videos.ts`.

- `AutoVideo` (`src/components/project-video.tsx`) replaces each project screenshot with a **muted, looping, inline video that is already playing** — home showcase (4), `/work` (7), case-study previews, all 7 admin Recordings tiles and the home tour reel. No play button, no click.
- On public project cards there are **no controls at all** — the footage is the content. The optional full-screen player (portal modal with controls, `Esc` / backdrop close) is reachable from the **admin Recordings** tiles and from the small expand icon on the **tour reel** only.
- No numeric badges, years, REC chips, scrims or hover pills are rendered on `/`, `/work` or case studies.
- Both the project clips and the tour use a `#t=` media fragment to skip the dark loading frames at the start of a recording.

**Publishing from `/admin` → Projects** really updates the live site. Projects are read by `src/lib/projects-store.ts` through `src/lib/storage.ts`: on Cloudflare they come from the D1 `projects` table; locally they come from `data/projects.json` overrides when present, otherwise the seed list in `src/data/projects.ts`. Add, edit, delete and reset actions go through `POST /api/admin` (`project-add`, `project-edit`, `project-delete`, `project-reset`) and sanitise slugs, image paths, URLs, accents and highlights. `/`, `/work`, `/work/[slug]` and `sitemap.xml` are `force-dynamic`, so a published project appears on the archive, gets its own case-study URL and enters the sitemap **without a rebuild**. Delete `data/projects.json` (or hit *Reset to seed*) to go back to the seven originals.

Videos stay light: each one uses `preload="metadata"` plus a poster, is only mounted where it appears, and pauses while the browser tab is hidden. Autoplay is muted so browsers allow it without a click; the full-screen player is the only place with controls.

## Cloudflare D1

The whole app can be deployed as a Cloudflare Worker backed by a real **D1
SQLite database**. `src/lib/storage.ts` is a single async storage adapter used by
every API route and every server page:

1. native `env.DB` binding when `AR_D1_BINDING=1` (set in `wrangler.jsonc`),
2. the D1 REST API when `CF_ACCOUNT_ID` / `CF_D1_DATABASE_ID` / `CF_API_TOKEN` are set,
3. local `data/*.json` files otherwise — zero config, nothing breaks.

What moves to D1: published projects, the `/life` wall and its reactions, and the
shared visitor counter (an atomic `INSERT … ON CONFLICT … RETURNING value`, so
concurrent visits cannot lose increments). `/api/health` reports the active
backend and the admin Overview shows it too.

| File | Purpose |
| --- | --- |
| `db/schema.sql` | `projects`, `documents`, `counters` tables |
| `wrangler.jsonc` | Worker + `ASSETS` + `d1_databases` → `DB` |
| `open-next.config.ts` | OpenNext Cloudflare adapter (Next 16 → Worker) |
| `.env.example` | optional REST credentials |
| `scripts/verify-d1.mjs` | offline SQL check via Miniflare (`npm run db:verify`) |
| `CLOUDFLARE.md` | create → migrate → build → deploy |

```bash
npm run db:verify       # checks the schema + every query offline, no account needed
npm run db:create       # wrangler d1 create ahmadraza-portfolio
npm run db:migrate      # apply db/schema.sql
npm run cf:build && npm run cf:deploy
```

> `/api/admin` is still an **easter egg**, not authentication. On a public
> deployment, protect the write endpoints with Cloudflare Access or real
> credentials before letting strangers post.

## Lightweight / performance

Trimmed for the "lagging too much" pass without removing accepted features:

- `ScrollReveal` now also reveals sections that were scrolled past in a jump, so reveal content can never stay invisible; the footer stagger uses animations (not hidden-by-default CSS) for the same reason.
- Auto-playing recordings use `preload="metadata"`, a poster for the first paint, and pause when the tab is hidden; the full-screen player is the only element with native controls.
- The starfield canvas is capped at **110 stars** and **DPR 1.25**, draws at **~30fps** instead of every frame, drops the expensive shooting-star `shadowBlur`, and pauses offscreen / under reduced-motion.
- The crown cursor no longer re-renders React state on every pointer move.
- Navbar, context menu and glass surfaces use lighter `backdrop-filter` (or none); the grain overlay, `soft-img` image filter, six fixed gradients and the infinite `sky-pulse` keyframes are gone.
- The unused `@fontsource-variable/pixelify-sans` dependency was removed (the local pixel font is self-hosted).
- Theme-note visibility is driven by a ref + DOM class instead of React state on every scroll event.
- The sky picker is now five tiny real-photo planet thumbnails plus one label directly on the banner: no bar/container, no floating pill, no sparkle icon, no badges, dividers, indices or pulsing dot.

Original extras still working without Postgres: crown cursor, right-click quick menu, matrix artwork, GitHub graph, visitor counter, theme toggle, hero starfield with shooting stars, back-to-top, scroll reveal.

**Removed on request:** top scroll-progress/loading bar, proof band, extra About cards, long project descriptions/tags/meta, work filters, pill buttons, "Available for new projects" badge.

## Assets

| File | Source |
| --- | --- |
| `public/images/avatar.webp` | **Real GitHub profile picture** from `github.com/MrRealORG` |
| `public/images/real-*-desktop.webp` (5) | Photorealistic night-sky banner art, 1600×560, one per sky theme |
| `public/images/real-*-mobile.webp` (5) | Matching square 800×800 compositions for phones |
| `public/images/morpheus.webp` | **Your uploaded Morpheus red/blue pill image** |
| `public/images/phone-app.webp` | Generated phone-app mockup (**sample project #07**) |
| `public/images/*` (6) | Real project screenshots |
| `src/fonts/pixelify.woff2` | Self-hosted Pixelify Sans — banner headline **and all display headings** (work masthead, project titles, case titles, profile name, footer headline) |
| `src/fonts/handwriting.woff2` | Caveat — pencil-style theme-changer note |
| `public/fonts/emoji.woff2` | Subset of Noto Color Emoji (~142 KB) covering all starter + animated reactions |
| `public/videos/ar-tour.webm` | 20.9 s / 960×600 screen recording of the live site (3.2 MB) |
| `db/schema.sql` + `wrangler.jsonc` + `open-next.config.ts` | Cloudflare D1 schema, binding and Worker adapter |
| `src/lib/storage.ts` + `scripts/verify-d1.mjs` | D1 / REST / JSON storage adapter and its offline SQL test |
| `public/videos/project-*.webm` (7) | 800×500 WebM recordings of the five live project sites + two case studies (236–788 KB each) |
| `public/images/tour-poster.webp` | Cropped banner frame used as the tour poster |
| `src/data/skies.ts` | Shared sky themes, labels, planet thumbnails and accents (`ar_sky_theme`) |
| `public/images/planet-*.webp` (5) | 96×96 crops of real NASA / spacecraft imagery — Saturn (Cassini), total lunar eclipse, Sun (SDO/AIA 304), Jupiter (Juno) and Neptune (Voyager 2) — used as the sky chips |
| `src/lib/sky.ts` + `src/components/sky-ambient.tsx` | Reads/broadcasts the shared sky and tints the site-wide ambient background |
| `src/components/stars.tsx` | Canvas starfield + shooting (falling) stars |
| `src/lib/vault.ts` + `src/components/vault-gate.tsx` + `src/components/admin-console.tsx` | Hidden gate, key verification and the 9-tab admin console |
| `src/data/project-videos.ts` + `src/components/project-video.tsx` | The 7 recording entries, the always-playing inline video, optional expand control and full-screen modal |
| `src/lib/projects-store.ts` + `data/projects.json` | Runtime project overrides written by the admin publish form |
| `public/llms.txt` + `public/.well-known/ar-vault.json` | Machine-readable site summary and structured puzzle clues for AI analysis |

## Editing

- Add/remove projects in `src/data/projects.ts` (+ screenshot in `public/images/`), **or publish them from `/admin` → Projects** (writes `data/projects.json`). Sitemap and case studies are generated from the merged list. The first project is the full-width feature.
- **#07 `phone-app` is an editable sample**: replace `title`, `tagline`, `description`, `href`, `stack` and the mockup with the real phone-app details.
- Home project count: `HOME_COUNT` in `src/components/projects.tsx`.
- Showcase markup in `src/components/project-showcase.tsx`; the “more work” index swaps the displayed `Minal Enterprises` entry for `Auto Max` there. Hand hotspots in `src/components/matrix-pills.tsx`. Case-study colour + next-project card: `src/components/project-theme.tsx`, `src/components/next-project.tsx`.
- Profile text in `src/data/site.ts`; the profile card in `src/components/profile-header.tsx`; real Pakistan flag SVG in `src/components/icons.tsx`.
- Ambient wash, sky UI palettes, palette cross-fade and global easing live at the top of `src/app/globals.css`; sky read/write helpers are in `src/lib/sky.ts`.
- Life posts are managed from the `/life` composer (or the admin **Life wall** tab); delete `data/board.json` to reset. **The wall ships empty** — `lifePosts` in `src/data/life.ts` is `[]` and no seed photos are in `public/images/`. Starter and animated emoji choices are in `src/data/life.ts`; the per-post picker, empty state, lightbox and fullscreen logic are in `src/components/life-grid.tsx`.
- To re-record the tour, run a Playwright session with `recordVideo` against `npm start` and save the WebM to `public/videos/ar-tour.webm`; update the duration label in `src/components/site-tour.tsx`.
- To attach a recording to a project, add its file under `public/videos/` and an entry in `src/data/project-videos.ts` (`slug` must match the project). Re-record project clips the same way against their live URLs / case-study routes. Recordings autoplay wherever their slug appears; projects without one keep a static screenshot.
- Storage backend: see `CLOUDFLARE.md`. Locally, delete `data/*.json` to reset. `npm run db:verify` must stay green if you change the D1 SQL in `src/lib/storage.ts` or `db/schema.sql`.
- The hidden door path lives in `VAULT_PATH` (`src/lib/vault.ts`). Changing it also means updating `robots.txt`, `llms.txt`, `.well-known/ar-vault.json`, the `<meta name="ar-vault">` tag and `HIDDEN_ROUTES` in `src/data/audit.ts`.
