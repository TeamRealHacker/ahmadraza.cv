"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowLeft, ArrowUpRight, BarChart3, Check, Clipboard, Copy, Eye,
  Film, FolderPlus, Gauge, HeartPulse, ImagePlus, LayoutDashboard, LockKeyhole,
  LogOut, MonitorPlay, Moon, Palette, Pencil, Plus, RefreshCw, RotateCcw, Save,
  Send, ShieldCheck, SlidersHorizontal, Sparkles, Star, Sun, Trash2, WandSparkles, X,
} from "lucide-react";
import { SKIES } from "@/data/skies";
import { animatedEmojis } from "@/data/life";
import { PROJECT_VIDEOS } from "@/data/project-videos";
import { AutoVideo, TOUR_VIDEO, WatchProject } from "./project-video";
import type { Project } from "@/data/projects";
import { setSkyTheme } from "@/lib/sky";
import { toggleTheme } from "@/lib/theme";
import { prepareImage } from "@/lib/prepare-image";
import { API_ROUTES, HIDDEN_ROUTES, PUBLIC_ROUTES, SITE_FACTS } from "@/data/audit";
import { ADMIN_PATH, VAULT_PATH } from "@/lib/vault";
import { PAGE_VIEWS_KEY } from "./vault-signal";

type BoardPost = { id: string; src: string; alt: string; caption: string; date: string };
type Counts = Record<string, Record<string, number>>;
type AdminData = {
  board: { posts: BoardPost[]; counts: Counts };
  visitors: number;
  reactions: number;
  posts: number;
  generatedAt: string;
  routes: { public: { path: string; label: string }[]; hidden: { path: string; label: string }[] };
  apis: string[];
  projects: Project[];
  facts: typeof SITE_FACTS;
  health: { ok: boolean; service: string; database: string };
  storage?: string;
};
type PageView = { path: string; at: string };
type Tab = "overview" | "life" | "projects" | "reactions" | "recordings" | "audience" | "appearance" | "audit" | "tour" | "reviews";
type AdminReview = { id: string; name: string; rating: number; message: string; createdAt: string };

type ProjectForm = {
  slug: string; title: string; tagline: string; description: string;
  highlights: string; image: string; href: string; accent: string; year: string;
};
const EMPTY_PROJECT: ProjectForm = {
  slug: "", title: "", tagline: "", description: "", highlights: "",
  image: "/images/phone-app.webp", href: "", accent: "#a78bfa", year: "2026",
};
const FORM_FIELDS: { key: keyof ProjectForm; label: string; wide?: boolean; hint?: string }[] = [
  { key: "title", label: "Title" },
  { key: "slug", label: "Slug", hint: "lowercase, dashes" },
  { key: "tagline", label: "Tagline" },
  { key: "year", label: "Year" },
  { key: "description", label: "Short description", wide: true },
  { key: "highlights", label: "Highlights (comma separated)", wide: true },
  { key: "image", label: "Screenshot path / URL", wide: true, hint: "/images/… or https://" },
  { key: "href", label: "Live site URL", wide: true },
  { key: "accent", label: "Accent (#rrggbb)" },
];

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "life", label: "Life wall", icon: ImagePlus },
  { id: "projects", label: "Projects", icon: FolderPlus },
  { id: "reactions", label: "Reactions", icon: HeartPulse },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "recordings", label: "Recordings", icon: MonitorPlay },
  { id: "audience", label: "Audience", icon: Activity },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "audit", label: "Site audit", icon: Clipboard },
  { id: "tour", label: "Site tour", icon: Film },
];

function readPageViews(): PageView[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PAGE_VIEWS_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as PageView[]).slice(0, 30) : [];
  } catch {
    return [];
  }
}

function when(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function AdminConsole() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [views, setViews] = useState<PageView[]>([]);
  const [sky, setSky] = useState("space");
  const [dark, setDark] = useState(true);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [newCaption, setNewCaption] = useState("");
  const [upload, setUpload] = useState<{ src: string; width: number; height: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm>(EMPTY_PROJECT);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<number | null>(null);

  const flash = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2600);
  }, []);

  /* Auth lives in the HttpOnly session cookie set by /api/admin/unlock.
     A 401 here means locked — the console never holds a token. */
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin", { cache: "no-store" });
      if (res.status === 401) { queueMicrotask(() => setUnlocked(false)); return; }
      if (res.ok) {
        const next = (await res.json()) as AdminData;
        queueMicrotask(() => { setData(next); setUnlocked(true); });
      }
    } catch {
      flash("Could not reach the admin API");
    }
  }, [flash]);

  useEffect(() => {
    queueMicrotask(() => {
      setViews(readPageViews());
      setSky(localStorage.getItem("ar_sky_theme") ?? "space");
      setDark(document.documentElement.classList.contains("dark"));
      /* Direct link support: /admin#reviews opens the Reviews tab. */
      if (window.location.hash === "#reviews") setTab("reviews");
      void load();
    });
    return () => { if (noticeTimer.current) window.clearTimeout(noticeTimer.current); };
  }, [load]);

  /* Reviews live in /api/reviews, not /api/admin — load them on demand. */
  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews", { credentials: "same-origin", cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { reviews?: AdminReview[] };
        setAdminReviews(Array.isArray(data.reviews) ? data.reviews : []);
      }
    } catch {
      /* keep the previous list; the panel shows the error via flash */
    }
  }, []);

  useEffect(() => {
    if (unlocked && tab === "reviews") void loadReviews();
  }, [unlocked, tab, loadReviews]);

  const postReview = useCallback(async () => {
    if (!reviewName.trim() || !reviewMessage.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: reviewName.trim(), rating: reviewRating, message: reviewMessage.trim() }),
      });
      if (res.status === 401) { setUnlocked(false); throw new Error("locked"); }
      if (!res.ok) throw new Error("request");
      setReviewName("");
      setReviewMessage("");
      setReviewRating(5);
      flash("Review posted ✓");
      await loadReviews();
    } catch {
      flash("That review didn't go through");
    } finally {
      setBusy(false);
    }
  }, [reviewName, reviewMessage, reviewRating, loadReviews, flash]);

  const deleteReview = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "delete", id }),
      });
      if (res.status === 401) { setUnlocked(false); return; }
      if (res.ok) { flash("Review deleted ✓"); await loadReviews(); }
    } catch {
      flash("That delete didn't go through");
    }
  }, [loadReviews, flash]);

  const run = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (res.status === 401) { setUnlocked(false); throw new Error("locked"); }
      if (!res.ok) throw new Error("request");
      const next = (await res.json()) as AdminData;
      setData(next);
      flash(`${action.replace("-", " ")} ✓`);
      return true;
    } catch {
      flash("That change didn't go through");
      return false;
    } finally {
      setBusy(false);
    }
  }, [flash]);

  const applySky = useCallback((id: string) => {
    const skyId = SKIES.find((x) => x.id === id);
    if (!skyId) return;
    setSkyTheme(skyId.id);
    setSky(skyId.id);
    flash(`${skyId.label} applied`);
  }, [flash]);

  const totals = useMemo(() => {
    const byEmoji: Record<string, number> = {};
    Object.values(data?.board.counts ?? {}).forEach((row) => {
      Object.entries(row).forEach(([key, n]) => { byEmoji[key] = (byEmoji[key] ?? 0) + n; });
    });
    return { byEmoji, kinds: Object.keys(byEmoji).length, sum: Object.values(byEmoji).reduce((a, b) => a + b, 0) };
  }, [data]);

  const report = useMemo(() => JSON.stringify({
    generatedAt: data?.generatedAt,
    storage: data?.storage,
    site: data?.facts ?? SITE_FACTS,
    routes: { public: data?.routes?.public ?? PUBLIC_ROUTES, hidden: data?.routes?.hidden ?? HIDDEN_ROUTES },
    apis: API_ROUTES,
    stats: { posts: data?.posts ?? 0, reactions: data?.reactions ?? 0, visitors: data?.visitors ?? 0, projects: data?.projects?.length ?? 0 },
    health: data?.health,
  }, null, 2), [data]);

  if (unlocked === null) {
    return (
      <main className="admin-page" aria-busy="true" aria-label="Loading console">
        <aside className="admin-side">
          <div className="skeleton h-10 w-full" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-8 w-full" />
            ))}
          </div>
        </aside>
        <section className="admin-main">
          <div className="skeleton h-8 w-1/3" />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
          <div className="mt-6 skeleton h-64 w-full" />
          <p className="mt-6 text-center text-xs text-muted">Checking the key…</p>
        </section>
      </main>
    );
  }

  if (!unlocked) {
    return (
      <main className="admin-locked">
        <div className="admin-locked-card">
          <LockKeyhole size={28} />
          <h1>Locked.</h1>
          <p>This panel is locked. Unlock it through the vault gate.</p>
          <Link href={VAULT_PATH} className="admin-primary">Go to the vault gate <ArrowUpRight size={15} /></Link>
          <Link href="/" className="admin-quiet"><ArrowLeft size={13} /> back to the site</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="admin-brand-mark"><ShieldCheck size={17} /></span>
          <div><strong>AR / CONTROL</strong><small>{SITE_FACTS.domain} · private</small></div>
        </div>
        <nav className="admin-nav" aria-label="Admin sections">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} className={tab === t.id ? "active" : ""}>
                <Icon size={15} /> <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="admin-side-foot">
          <div className="admin-session"><span /> Session active</div>
          <Link href="/"><ArrowLeft size={13} /> View site</Link>
          <button type="button" onClick={async () => { try { await fetch("/api/admin/unlock", { method: "DELETE" }); } catch { /* cookie already gone */ } setUnlocked(false); }}>
            <LogOut size={13} /> Lock again
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">PRIVATE CONSOLE <span>/</span> {tab.toUpperCase()}</p>
            <h1>{TABS.find((t) => t.id === tab)?.label}</h1>
          </div>
          <div className="admin-header-actions">
            <div className="admin-site-strip" aria-label="Site appearance">
              <span className="admin-site-strip-label">sky</span>
              {SKIES.map((s) => (
                <button key={s.id} type="button" className={sky === s.id ? "active" : ""} onClick={() => applySky(s.id)} title={s.label} aria-label={`${s.label} sky`}>
                  <img src={s.planet} alt="" />
                </button>
              ))}
              <span className="admin-site-strip-sep" aria-hidden="true" />
              <button type="button" className="admin-site-theme" onClick={() => { toggleTheme(); setDark(document.documentElement.classList.contains("dark")); }} aria-label="Toggle light and dark">
                {dark ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>
            <button type="button" onClick={() => void load()} aria-label="Refresh data"><RefreshCw size={15} /></button>
            <Link href={ADMIN_PATH} className="admin-clock" title="Session route">
              <Gauge size={14} /> {data ? when(data.generatedAt) : "…"}
            </Link>
          </div>
        </header>

        {/* OVERVIEW ------------------------------------------------------ */}
        {tab === "overview" && (
          <div className="admin-stack">
            <div className="admin-stats">
              {[
                { label: "Life moments", value: data?.posts ?? 0, icon: ImagePlus },
                { label: "Reactions", value: data?.reactions ?? 0, icon: HeartPulse },
                { label: "Reaction kinds", value: totals.kinds, icon: Sparkles },
                { label: "Visitors", value: data?.visitors ?? 0, icon: Eye },
                { label: "Projects", value: data?.facts.projectCount ?? SITE_FACTS.projectCount, icon: BarChart3 },
                { label: "Public routes", value: data?.routes.public.length ?? PUBLIC_ROUTES.length, icon: LayoutDashboard },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div className="admin-stat" key={s.label}>
                    <Icon size={15} /><span>{s.label}</span><strong>{String(s.value).padStart(2, "0")}</strong>
                  </div>
                );
              })}
            </div>
            <div className="admin-grid-2">
              <div className="admin-panel">
                <h2><Activity size={15} /> Recent activity</h2>
                {views.length === 0 ? <p className="admin-empty">No page views recorded yet on this device.</p> : (
                  <ul className="admin-log">
                    {views.slice(0, 8).map((v, i) => (
                      <li key={`${v.at}-${i}`}><code>{v.path}</code><span>{when(v.at)}</span></li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="admin-panel">
                <h2><WandSparkles size={15} /> Quick actions</h2>
                <div className="admin-actions">
                  <button type="button" onClick={() => setTab("life")}><Plus size={14} /> Add a moment</button>
                  <button type="button" onClick={() => setTab("projects")}><FolderPlus size={14} /> Publish a project</button>
                  <button type="button" onClick={() => setTab("reviews")}><Star size={14} /> Post a review</button>
                  <button type="button" onClick={() => setTab("recordings")}><MonitorPlay size={14} /> Watch recordings</button>
                  <button type="button" onClick={() => setTab("reactions")}><HeartPulse size={14} /> Manage reactions</button>
                  <button type="button" onClick={() => setTab("appearance")}><Palette size={14} /> Change the sky</button>
                  <button type="button" onClick={() => setTab("tour")}><Film size={14} /> Watch the tour</button>
                </div>
                <div className="admin-health">
                  <span><Check size={13} /> API healthy</span>
                  <span><Check size={13} /> {data?.storage === "cloudflare-d1" ? "Cloudflare D1" : "Local JSON fallback"}</span>
                  <span><Check size={13} /> {SKIES.length} skies</span>
                </div>
              </div>
            </div>
            <div className="admin-panel">
              <h2><ArrowUpRight size={15} /> Quick links</h2>
              <div className="admin-links">
                {PUBLIC_ROUTES.slice(0, 6).map((r) => <Link key={r.path} href={r.path}>{r.label} <ArrowUpRight size={12} /></Link>)}
              </div>
            </div>
          </div>
        )}

        {/* LIFE WALL ----------------------------------------------------- */}
        {tab === "life" && (
          <div className="admin-stack">
            <div className="admin-panel">
              <h2><Plus size={15} /> Publish a moment</h2>
              <div className="admin-compose">
                <button
                  type="button"
                  className="admin-drop"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void prepareImage(f).then(setUpload).catch(() => flash("Couldn't read that image")); }}
                >
                  {upload ? <img src={upload.src} alt="Preview" /> : <><ImagePlus size={20} /><span>Drop a photo</span></>}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void prepareImage(f).then(setUpload).catch(() => flash("Couldn't read that image")); }} />
                <div className="admin-compose-fields">
                  <textarea value={newCaption} onChange={(e) => setNewCaption(e.target.value)} rows={3} maxLength={240} placeholder="Write a caption…" />
                  <div className="admin-row">
                    <button type="button" className="admin-primary" disabled={busy || !newCaption.trim()}
                      onClick={async () => {
                        const ok = await run("add", { caption: newCaption.trim(), src: upload?.src, width: upload?.width, height: upload?.height });
                        if (ok) { setNewCaption(""); setUpload(null); }
                      }}>
                      <Send size={14} /> Publish
                    </button>
                    {upload && <button type="button" className="admin-quiet-btn" onClick={() => setUpload(null)}><X size={13} /> Remove photo</button>}
                    <span className="admin-muted">{newCaption.length}/240</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-panel">
              <div className="admin-panel-head">
                <h2><ImagePlus size={15} /> All moments ({data?.posts ?? 0})</h2>
                <button type="button" className="admin-danger-quiet" onClick={() => { if (confirm("Delete every moment? This cannot be undone.")) void run("clear-posts"); }}>
                  <Trash2 size={13} /> Clear wall
                </button>
              </div>
              {!data?.board.posts.length ? (
                <p className="admin-empty">The wall is empty — Ahmad uploads his own photos here.</p>
              ) : (
                <ul className="admin-posts">
                  {data.board.posts.map((p) => (
                    <li key={p.id}>
                      <div className="admin-post-thumb">
                        {p.src ? <img src={p.src} alt="" /> : <span><ImagePlus size={16} /></span>}
                      </div>
                      <div className="admin-post-body">
                        <code>{p.id}</code>
                        <input value={edits[p.id] ?? p.caption} onChange={(e) => setEdits((x) => ({ ...x, [p.id]: e.target.value }))} maxLength={240} />
                        <small>{p.date} · {Object.values(data.board.counts[p.id] ?? {}).reduce((a, b) => a + b, 0)} reactions</small>
                      </div>
                      <div className="admin-post-tools">
                        <button type="button" title="Save caption" onClick={() => void run("edit", { id: p.id, caption: edits[p.id] ?? p.caption })}><Check size={14} /></button>
                        <button type="button" title="Delete" onClick={() => void run("delete", { id: p.id })}><Trash2 size={14} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS ------------------------------------------------------- */}
        {tab === "reviews" && (
          <div className="admin-stack">
            <div className="admin-panel">
              <h2><Star size={15} /> Post a review</h2>
              <p className="admin-panel-note">Only you can post reviews now — the public form is gone from the home page. Post here and it appears on the home Reviews section right away.</p>
              <div className="admin-project-form" style={{ display: "grid", gap: 10 }}>
                <input value={reviewName} onChange={(e) => setReviewName(e.target.value)} maxLength={80} placeholder="Name (e.g. Usman Khan — Business Owner)" />
                <div className="admin-row" style={{ alignItems: "center" }}>
                  <span className="admin-muted">Rating:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewRating(n)} aria-label={`${n} stars`}
                      style={{ fontSize: 22, color: n <= reviewRating ? "#eab308" : "#999", background: "none", border: "none", cursor: "pointer", padding: 2 }}>★</button>
                  ))}
                </div>
                <textarea value={reviewMessage} onChange={(e) => setReviewMessage(e.target.value)} rows={3} maxLength={500} placeholder="The review message…" />
                <div className="admin-row">
                  <button type="button" className="admin-primary" disabled={busy || !reviewName.trim() || !reviewMessage.trim()} onClick={() => void postReview()}>
                    <Send size={14} /> Post review
                  </button>
                  <span className="admin-muted">{reviewMessage.length}/500</span>
                </div>
              </div>
            </div>
            <div className="admin-panel">
              <div className="admin-panel-head">
                <h2><Star size={15} /> All reviews ({adminReviews.length})</h2>
                <button type="button" className="admin-quiet-btn" onClick={() => void loadReviews()}><RefreshCw size={13} /> Refresh</button>
              </div>
              {adminReviews.length === 0 ? (
                <p className="admin-empty">No reviews yet — post the first one above.</p>
              ) : (
                <ul className="admin-log">
                  {adminReviews.map((r) => (
                    <li key={r.id} style={{ alignItems: "flex-start" }}>
                      <span><strong>{r.name}</strong> · {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}<br />{r.message}</span>
                      <button type="button" className="admin-danger-quiet" title="Delete this review" onClick={() => void deleteReview(r.id)}><Trash2 size={13} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* REACTIONS ----------------------------------------------------- */}
        {tab === "reactions" && (
          <div className="admin-stack">
            <div className="admin-grid-2">
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <h2><HeartPulse size={15} /> Reaction totals</h2>
                  <button type="button" className="admin-danger-quiet" onClick={() => { if (confirm("Reset every reaction count?")) void run("clear-reactions"); }}>
                    <RefreshCw size={13} /> Reset all
                  </button>
                </div>
                {totals.kinds === 0 ? <p className="admin-empty">No reactions yet.</p> : (
                  <ul className="admin-bars">
                    {Object.entries(totals.byEmoji).sort((a, b) => b[1] - a[1]).map(([key, n]) => (
                      <li key={key}>
                        <span className="admin-emoji-key">{key}</span>
                        <div className="admin-bar"><i style={{ width: `${Math.max(6, (n / Math.max(1, totals.sum)) * 100)}%` }} /></div>
                        <strong>{n}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="admin-panel">
                <h2><Sparkles size={15} /> Animated emoji set</h2>
                <p className="admin-muted admin-panel-note">Live CSS motion — these are available in the Life reaction picker. No GIFs, no network assets.</p>
                <div className="admin-emoji-live">
                  {animatedEmojis.map((a) => (
                    <span key={a.emoji} className="admin-emoji-cell" title={a.label}>
                      <i data-anim={a.anim}>{a.emoji}</i>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIENCE ------------------------------------------------------ */}
        {tab === "audience" && (
          <div className="admin-stack">
            <div className="admin-stats admin-stats-3">
              <div className="admin-stat"><Eye size={15} /><span>Visitors</span><strong>{data?.visitors ?? 0}</strong></div>
              <div className="admin-stat"><Activity size={15} /><span>Views logged</span><strong>{views.length}</strong></div>
              <div className="admin-stat"><Palette size={15} /><span>Active sky</span><strong>{sky.toUpperCase()}</strong></div>
            </div>
            <div className="admin-panel">
              <div className="admin-panel-head"><h2><Activity size={15} /> Page-view journal (this device)</h2>
                <button type="button" className="admin-quiet-btn" onClick={() => { localStorage.removeItem(PAGE_VIEWS_KEY); setViews([]); flash("Journal cleared"); }}><Trash2 size={13} /> Clear</button>
              </div>
              {views.length === 0 ? <p className="admin-empty">Nothing logged yet.</p> : (
                <ul className="admin-log">{views.map((v, i) => <li key={`${v.at}-${i}`}><code>{v.path}</code><span>{when(v.at)}</span></li>)}</ul>
              )}
            </div>
          </div>
        )}

        {/* PROJECTS ------------------------------------------------------ */}
        {tab === "projects" && (
          <div className="admin-stack">
            <div className="admin-panel">
              <div className="admin-panel-head">
                <h2><FolderPlus size={15} /> {editingSlug ? "Edit project" : "Publish a new project"}</h2>
                {editingSlug && (
                  <button type="button" className="admin-quiet-btn" onClick={() => { setEditingSlug(null); setProjectForm(EMPTY_PROJECT); }}>
                    <X size={13} /> Cancel edit
                  </button>
                )}
              </div>
              <p className="admin-muted admin-panel-note">Published projects appear instantly on <code>/work</code>, get their own case study and are added to the sitemap. Stored in <code>data/projects.json</code> — no rebuild needed.</p>
              <div className="admin-project-form">
                {FORM_FIELDS.map((f) => (
                  <label key={f.key} className={f.wide ? "wide" : ""}>
                    <span>{f.label}{f.hint && <em> · {f.hint}</em>}</span>
                    {f.key === "description" || f.key === "highlights" ? (
                      <textarea
                        rows={f.key === "highlights" ? 2 : 3}
                        value={projectForm[f.key]}
                        onChange={(e) => setProjectForm((x) => ({ ...x, [f.key]: e.target.value }))}
                      />
                    ) : (
                      <input
                        value={projectForm[f.key]}
                        onChange={(e) => setProjectForm((x) => ({ ...x, [f.key]: e.target.value }))}
                      />
                    )}
                  </label>
                ))}
                <div className="admin-project-swatch" style={{ background: projectForm.accent }} title="Project accent" />
              </div>
              <div className="admin-row">
                <button type="button" className="admin-primary" disabled={busy || !projectForm.title.trim()}
                  onClick={async () => {
                    const ok = await run(editingSlug ? "project-edit" : "project-add", { project: projectForm });
                    if (ok) { setEditingSlug(null); setProjectForm(EMPTY_PROJECT); }
                  }}>
                  <Save size={14} /> {editingSlug ? "Save changes" : "Publish project"}
                </button>
                <button type="button" className="admin-danger-quiet"
                  onClick={() => { if (confirm("Reset every project back to the original seven?")) void run("project-reset"); }}>
                  <RotateCcw size={13} /> Reset to seed
                </button>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-head">
                <h2><BarChart3 size={15} /> Published projects ({data?.projects?.length ?? 0})</h2>
              </div>
              <ul className="admin-projects-list">
                {(data?.projects ?? []).map((proj, i) => (
                  <li key={proj.slug}>
                    <img src={proj.image} alt="" />
                    <div className="admin-project-info">
                      <code>{String(i + 1).padStart(2, "0")} · /work/{proj.slug}</code>
                      <strong>{proj.title}</strong>
                      <small>{proj.tagline} · {proj.year}</small>
                    </div>
                    <div className="admin-post-tools">
                      <Link href={`/work/${proj.slug}`} title="Open case study"><ArrowUpRight size={14} /></Link>
                      <button type="button" title="Edit" onClick={() => {
                        setEditingSlug(proj.slug);
                        setProjectForm({
                          slug: proj.slug, title: proj.title, tagline: proj.tagline,
                          description: proj.description, highlights: proj.highlights.join(", "),
                          image: proj.image, href: proj.href, accent: proj.accent, year: proj.year,
                        });
                      }}><Pencil size={14} /></button>
                      <button type="button" title="Delete" onClick={() => { if (confirm(`Delete ${proj.title}?`)) void run("project-delete", { slug: proj.slug }); }}><Trash2 size={14} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* RECORDINGS ---------------------------------------------------- */}
        {tab === "recordings" && (
          <div className="admin-stack">
            <div className="admin-panel">
              <div className="admin-panel-head">
                <h2><MonitorPlay size={15} /> Project recordings ({PROJECT_VIDEOS.length})</h2>
              </div>
              <p className="admin-muted admin-panel-note">Five real live websites plus the two case studies without a live URL. All seven are playing already — click any tile to open it full-screen.</p>
              <div className="admin-video-grid">
                {PROJECT_VIDEOS.map((v) => <WatchProject key={v.slug} slug={v.slug} variant="card" />)}
              </div>
            </div>
            <div className="admin-panel">
              <h2><Film size={15} /> Full site tour</h2>
              <AutoVideo video={TOUR_VIDEO} startAt={0.9} className="admin-video" controls showRec={false} />
            </div>
          </div>
        )}

        {/* APPEARANCE ---------------------------------------------------- */}
        {tab === "appearance" && (
          <div className="admin-stack">
            <div className="admin-panel">
              <h2><Palette size={15} /> Site sky</h2>
              <p className="admin-muted admin-panel-note">Changes apply to the whole site instantly and are remembered, exactly like the banner control.</p>
              <div className="admin-skies">
                {SKIES.map((s) => (
                  <button key={s.id} type="button" className={sky === s.id ? "active" : ""}
                    onClick={() => applySky(s.id)}>
                    <img src={s.planet} alt="" /> <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-panel">
              <h2><SlidersHorizontal size={15} /> Colour scheme</h2>
              <div className="admin-actions">
                <button type="button" className="admin-primary" onClick={() => { toggleTheme(); setDark(document.documentElement.classList.contains("dark")); }}>
                  {dark ? <Sun size={14} /> : <Moon size={14} />} Switch to {dark ? "light" : "dark"}
                </button>
                <span className="admin-muted">Currently {dark ? "dark" : "light"}</span>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT --------------------------------------------------------- */}
        {tab === "audit" && (
          <div className="admin-stack">
            <div className="admin-panel">
              <div className="admin-panel-head">
                <h2><Clipboard size={15} /> Machine-readable site report</h2>
                <button type="button" className="admin-quiet-btn" onClick={async () => {
                  try { await navigator.clipboard.writeText(report); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { flash("Clipboard blocked"); }
                }}><Copy size={13} /> {copied ? "Copied" : "Copy JSON"}</button>
              </div>
              <pre className="admin-json">{report}</pre>
            </div>
            <div className="admin-grid-2">
              <div className="admin-panel">
                <h2><LayoutDashboard size={15} /> Routes</h2>
                <ul className="admin-tight-list">
                  {(data?.routes.public ?? PUBLIC_ROUTES).map((r) => <li key={r.path}><code>{r.path}</code><span>{r.label}</span></li>)}
                  {HIDDEN_ROUTES.map((r) => <li key={r.path}><code>{r.path}</code><span>{r.label} · hidden</span></li>)}
                </ul>
              </div>
              <div className="admin-panel">
                <h2><BarChart3 size={15} /> Systems</h2>
                <ul className="admin-tight-list">
                  {API_ROUTES.map((r) => <li key={r}><code>{r}</code><span>local JSON</span></li>)}
                  <li><code>database</code><span>none</span></li>
                  <li><code>{SITE_FACTS.framework}</code><span>framework</span></li>
                  <li><code>{SITE_FACTS.skills.length} skills</code><span>profile</span></li>
                  <li><code>{SKIES.length} skies</code><span>palettes</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TOUR ---------------------------------------------------------- */}
        {tab === "tour" && (
          <div className="admin-stack">
            <div className="admin-panel">
              <h2><Film size={15} /> Recorded site tour</h2>
              <p className="admin-muted admin-panel-note">A scroll-through capture of every public page, recorded from the live build.</p>
              <AutoVideo video={TOUR_VIDEO} startAt={0.9} className="admin-video" controls showRec={false} />
            </div>
          </div>
        )}
      </section>

      {notice && <div className="admin-toast" role="status"><Check size={14} /> {notice}</div>}
    </main>
  );
}
