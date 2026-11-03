"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { createPortal } from "react-dom";
import {
  ChevronLeft, ChevronRight, ImagePlus, Maximize2, Minimize2, Plus,
  Send, Trash2, X, ZoomIn, ZoomOut,
} from "lucide-react";
import { animatedEmojis, animForEmoji, emojiChoices, reactionOptions, type LifePost } from "@/data/life";
import { ReactionIcon } from "./reaction-icons";
import { prepareImage } from "@/lib/prepare-image";

type Counts = Record<string, Record<string, number>>;
const REACTIONS_STORE = "ar_reactions_v1";
const POSTS_STORE = "ar_local_posts_v1";
const OWNED_STORE = "ar_my_posts_v1";
const CUSTOM_STORE = "ar_custom_reactions_v1";
const LIFE_ACCENTS = ["#eab308", "#a78bfa", "#ef4444", "#63d6e8", "#ff9066", "#3b6ef6"];

function readJSON<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function looksLikeEmoji(value: string) {
  return value.trim().length > 0 && value.trim().length <= 24 && /[\p{Extended_Pictographic}]/u.test(value);
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

type RowProps = {
  postId: string;
  postAlt: string;
  counts: Record<string, number>;
  mine: Set<string>;
  customEmojis: string[];
  pickerOpen: boolean;
  customInput: string;
  onToggle: (postId: string, emoji: string, force?: "add") => void;
  onTogglePicker: (postId: string) => void;
  onInput: (value: string) => void;
  onAddCustom: (postId: string, emoji: string) => void;
  onRemoveCustom: (postId: string, emoji: string) => void;
  onRemove?: () => void;
};

/** Reactions for ONE post — built-ins, visitor-added emojis and the "+" button. */
function ReactionRow({
  postId, postAlt, counts, mine, customEmojis, pickerOpen, customInput,
  onToggle, onTogglePicker, onInput, onAddCustom, onRemoveCustom, onRemove,
}: RowProps) {
  return (
    <div className="life-reactions" role="group" aria-label={`Reactions for ${postAlt}`}>
      {reactionOptions.map((r) => {
        const active = mine.has(`${postId}:${r.key}`);
        const n = counts[r.key] ?? 0;
        return (
          <m.button
            key={r.key}
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={() => onToggle(postId, r.key)}
            aria-pressed={active}
            aria-label={`${r.label}${n ? `, ${n}` : ""}`}
            className={`life-reaction ${active ? "active" : ""}`}
          >
            <ReactionIcon name={r.key} active={active} size={14} />
            {n > 0 && <span className="tabular-nums">{n}</span>}
          </m.button>
        );
      })}

      {customEmojis.map((emoji) => {
        const active = mine.has(`${postId}:${emoji}`);
        const n = counts[emoji] ?? 0;
        return (
          <span className="life-reaction-wrap" key={emoji}>
            <m.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => onToggle(postId, emoji)}
              aria-pressed={active}
              aria-label={`React with ${emoji}${n ? `, ${n}` : ""}`}
              className={`life-reaction life-reaction-custom ${active ? "active" : ""}`}
              data-anim={animForEmoji(emoji)}
            >
              <ReactionIcon name={emoji} size={14} />
              {n > 0 && <span className="tabular-nums">{n}</span>}
            </m.button>
            <button
              type="button"
              className="life-reaction-x"
              onClick={() => onRemoveCustom(postId, emoji)}
              aria-label={`Remove ${emoji} from this post`}
            >
              <X size={10} />
            </button>
          </span>
        );
      })}

      <button
        type="button"
        className={`life-reaction life-reaction-add ${pickerOpen ? "active" : ""}`}
        onClick={() => onTogglePicker(postId)}
        aria-label="Add your own emoji reaction"
        aria-expanded={pickerOpen}
        title="Add your own emoji"
      >
        <Plus size={13} />
      </button>

      {onRemove && (
        <button type="button" onClick={onRemove} className="life-reaction ml-auto" aria-label="Delete this post">
          <Trash2 size={13} />
        </button>
      )}

      <AnimatePresence>
        {pickerOpen && (
          <m.div
            className="life-emoji-picker"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <div className="life-emoji-head">
              <span>Your own reaction</span>
              <button type="button" onClick={() => onTogglePicker(postId)} aria-label="Close emoji picker"><X size={13} /></button>
            </div>
            <div className="life-emoji-grid">
              {emojiChoices.map((e) => (
                <button key={e} type="button" onClick={() => onAddCustom(postId, e)} aria-label={`React with ${e}`}>
                  {e}
                </button>
              ))}
            </div>
            <div className="life-emoji-sub">Animated <span aria-hidden="true">✦</span></div>
            <div className="life-emoji-animated">
              {animatedEmojis.map((a) => (
                <button
                  key={a.emoji}
                  type="button"
                  onClick={() => onAddCustom(postId, a.emoji)}
                  aria-label={`React with ${a.label} ${a.emoji}`}
                  title={a.label}
                >
                  <span data-anim={a.anim}>{a.emoji}</span>
                </button>
              ))}
            </div>
            <div className="life-emoji-custom">
              <input
                value={customInput}
                onChange={(event) => onInput(event.target.value)}
                placeholder="Paste any emoji"
                maxLength={12}
                aria-label="Paste any emoji"
              />
              <button
                type="button"
                onClick={() => onAddCustom(postId, customInput)}
                disabled={!looksLikeEmoji(customInput)}
              >
                Add
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LifeGrid({ initialPosts, initialCounts }: { initialPosts: LifePost[]; initialCounts: Counts }) {
  const [posts, setPosts] = useState<LifePost[]>(initialPosts);
  const [counts, setCounts] = useState<Counts>(initialCounts);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState<Record<string, string[]>>({});
  const mineRef = useRef(mine);
  const [burst, setBurst] = useState<Record<string, { id: number; emoji: string }[]>>({});
  const [composerOpen, setComposerOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [upload, setUpload] = useState<{ src: string; width: number; height: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = new Set<string>(readJSON<string[]>(REACTIONS_STORE, []));
    const ownedSet = new Set<string>(readJSON<string[]>(OWNED_STORE, []));
    const local = readJSON<LifePost[]>(POSTS_STORE, []);
    mineRef.current = stored;
    queueMicrotask(() => {
      setMine(stored);
      setOwned(ownedSet);
      setCustom(readJSON<Record<string, string[]>>(CUSTOM_STORE, {}));
      if (local.length) setPosts((current) => [...local.filter((p) => !current.some((c) => c.id === p.id)), ...current]);
    });
  }, []);

  /* The Life hero's "New moment" button opens the composer from up top. */
  useEffect(() => {
    const open = () => setComposerOpen(true);
    window.addEventListener("ar:open-composer", open);
    return () => window.removeEventListener("ar:open-composer", open);
  }, []);

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 2200);
  }, []);

  const bump = useCallback((postId: string, emoji: string, delta: 1 | -1) => {
    setCounts((c) => ({ ...c, [postId]: { ...c[postId], [emoji]: Math.max(0, (c[postId]?.[emoji] ?? 0) + delta) } }));
  }, []);

  const fire = (postId: string, emoji: string) => {
    const id = Date.now();
    setBurst((b) => ({ ...b, [postId]: [...(b[postId] ?? []), { id, emoji }] }));
    window.setTimeout(() => setBurst((b) => ({ ...b, [postId]: (b[postId] ?? []).filter((x) => x.id !== id) })), 950);
  };

  const toggle = useCallback(
    async (postId: string, emoji: string, force?: "add") => {
      const key = `${postId}:${emoji}`;
      const has = mineRef.current.has(key);
      if (force === "add" && has) return;
      const delta: 1 | -1 = has ? -1 : 1;
      const next = new Set(mineRef.current);
      if (delta === 1) { next.add(key); fire(postId, emoji); } else next.delete(key);
      mineRef.current = next;
      setMine(next);
      localStorage.setItem(REACTIONS_STORE, JSON.stringify([...next]));
      bump(postId, emoji, delta);
      try {
        const res = await fetch("/api/board", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "react", postId, emoji, delta }),
        });
        if (res.ok) {
          const data = (await res.json()) as { counts: Counts };
          setCounts(data.counts);
        }
      } catch {
        /* stays working locally when there is no server */
      }
    },
    [bump],
  );

  const togglePicker = useCallback((postId: string) => {
    setCustomInput("");
    setPickerFor((current) => (current === postId ? null : postId));
  }, []);

  const addCustom = useCallback((postId: string, emoji: string) => {
    const clean = emoji.trim().slice(0, 16);
    if (!looksLikeEmoji(clean)) return;
    setCustom((prev) => {
      const list = prev[postId] ?? [];
      if (list.includes(clean)) return prev;
      const next = { ...prev, [postId]: [...list, clean] };
      localStorage.setItem(CUSTOM_STORE, JSON.stringify(next));
      return next;
    });
    setPickerFor(null);
    setCustomInput("");
    toggle(postId, clean, "add");
    flash(`Added ${clean} — tap it to react`);
  }, [toggle, flash]);

  const removeCustom = useCallback((postId: string, emoji: string) => {
    setCustom((prev) => {
      const next = { ...prev, [postId]: (prev[postId] ?? []).filter((e) => e !== emoji) };
      localStorage.setItem(CUSTOM_STORE, JSON.stringify(next));
      return next;
    });
  }, []);

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      setUpload(await prepareImage(file));
    } catch {
      flash("Couldn't read that image");
    }
  };

  const publish = async () => {
    if (!caption.trim() || busy) return;
    setBusy(true);
    const payload = {
      action: "post",
      caption: caption.trim(),
      src: upload?.src ?? "",
      alt: caption.trim(),
      width: upload?.width ?? 1200,
      height: upload?.height ?? 800,
    };
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("server");
      const data = (await res.json()) as { posts: LifePost[]; counts: Counts };
      setPosts(data.posts);
      setCounts(data.counts);
      const newId = data.posts[0]?.id;
      if (newId) {
        const next = new Set(owned).add(newId);
        setOwned(next);
        localStorage.setItem(OWNED_STORE, JSON.stringify([...next]));
      }
      flash("Posted ✓");
    } catch {
      const post: LifePost = {
        id: `local-${Date.now().toString(36)}`,
        src: payload.src,
        width: payload.width,
        height: payload.height,
        alt: payload.alt,
        caption: payload.caption,
        date: new Date().toISOString().slice(0, 10),
      };
      setPosts((p) => [post, ...p]);
      const locals = [post, ...readJSON<LifePost[]>(POSTS_STORE, [])];
      localStorage.setItem(POSTS_STORE, JSON.stringify(locals));
      const next = new Set(owned).add(post.id);
      setOwned(next);
      localStorage.setItem(OWNED_STORE, JSON.stringify([...next]));
      flash("Saved on this device ✓");
    }
    setCaption("");
    setUpload(null);
    setComposerOpen(false);
    setBusy(false);
  };

  const remove = async (id: string) => {
    setPosts((p) => p.filter((x) => x.id !== id));
    const locals = readJSON<LifePost[]>(POSTS_STORE, []).filter((p) => p.id !== id);
    localStorage.setItem(POSTS_STORE, JSON.stringify(locals));
    const next = new Set(owned);
    next.delete(id);
    setOwned(next);
    localStorage.setItem(OWNED_STORE, JSON.stringify([...next]));
    try {
      await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
    } catch { /* local only */ }
  };

  const lightboxPost = lightboxIndex === null ? null : posts[lightboxIndex] ?? null;

  const step = useCallback((direction: -1 | 1) => {
    setZoomed(false);
    setLightboxIndex((i) => (i === null ? null : (i + direction + posts.length) % posts.length));
  }, [posts.length]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await lightboxRef.current?.requestFullscreen();
    } catch {
      flash("Fullscreen isn't available here");
    }
  }, [flash]);

  useEffect(() => queueMicrotask(() => setMounted(true)), []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key.toLowerCase() === "f") void toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, step, toggleFullscreen]);

  const rowProps = (post: LifePost) => ({
    postId: post.id,
    postAlt: post.alt,
    counts: counts[post.id] ?? {},
    mine,
    customEmojis: custom[post.id] ?? [],
    pickerOpen: pickerFor === post.id,
    customInput,
    onToggle: toggle,
    onTogglePicker: togglePicker,
    onInput: setCustomInput,
    onAddCustom: addCustom,
    onRemoveCustom: removeCustom,
  });

  return (
    <>
      {/* Composer */}
      <div className="life-composer" id="life-composer" data-reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-medium">Share a moment</h2>
            <p className="text-xs text-muted">A photo, a thought, a late-night shipping note. People can react below.</p>
          </div>
          <button type="button" onClick={() => setComposerOpen((v) => !v)} className="life-button">
            {composerOpen ? <X size={15} /> : <Plus size={15} />} {composerOpen ? "Close" : "New post"}
          </button>
        </div>
        <AnimatePresence>
          {composerOpen && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-wrap items-start gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); void onFile(e.dataTransfer.files?.[0]); }}
                  className="life-dropzone"
                  aria-label="Choose or drop a photo"
                >
                  {upload ? <img src={upload.src} alt="Preview" className="h-full w-full object-cover" /> : <ImagePlus size={22} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
                <div className="min-w-[220px] flex-1">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    maxLength={240}
                    placeholder="What's happening today?"
                    className="life-textarea"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => void publish()} disabled={busy || !caption.trim()} className="life-button life-button-primary">
                      <Send size={14} /> {busy ? "Posting…" : "Publish"}
                    </button>
                    {upload && (
                      <button type="button" onClick={() => setUpload(null)} className="life-button">Remove photo</button>
                    )}
                    <span className="text-xs text-muted">{caption.length}/240</span>
                  </div>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* While the wall hydrates (local reactions merge in), show same-layout
          skeleton cards instead of a half-painted grid, so nothing jumps. */}
      {!mounted ? (
        <ul className="life-posts columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4" aria-busy="true" aria-label="Loading moments">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="life-card" aria-hidden="true">
              <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
              <div className="mt-3 skeleton h-4 w-full" />
              <div className="mt-2 skeleton h-4 w-2/3" />
            </li>
          ))}
        </ul>
      ) : posts.length === 0 ? (
        <div className="life-empty" data-reveal>
          <span className="life-empty-icon" aria-hidden="true"><ImagePlus size={27} /></span>
          <h3>Your wall is empty.</h3>
          <p>All the old photos are gone. Drop your own moments below and they&apos;ll live right here.</p>
          <button
            type="button"
            className="life-button life-button-primary"
            onClick={() => {
              setComposerOpen(true);
              window.setTimeout(() => document.getElementById("life-composer")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
            }}
          >
            <Plus size={15} /> Add the first moment
          </button>
          <small>JPG, PNG or WebP — resized automatically, kept on this device.</small>
        </div>
      ) : (
        <ul className="life-posts columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              burst={burst[post.id] ?? []}
              rowProps={rowProps(post)}
              onToggle={toggle}
              onExpand={() => { setLightboxIndex(i); setZoomed(false); }}
              onRemove={owned.has(post.id) ? () => void remove(post.id) : undefined}
            />
          ))}
        </ul>
      )}

      {mounted && createPortal(
        <>
      {/* Big-screen lightbox */}
      <AnimatePresence>
        {lightboxPost && (
          <m.div
            ref={lightboxRef}
            className="life-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={lightboxPost.caption}
          >
            <div className="life-lightbox-tools" onClick={(e) => e.stopPropagation()}>
              <span className="life-lightbox-count">{String((lightboxIndex ?? 0) + 1).padStart(2, "0")} / {String(posts.length).padStart(2, "0")}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setZoomed((v) => !v)} className="life-lightbox-btn" aria-label={zoomed ? "Zoom out" : "Zoom in"}>
                  {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
                </button>
                <button type="button" onClick={() => void toggleFullscreen()} className="life-lightbox-btn" aria-label={isFullscreen ? "Exit full screen" : "Full screen"}>
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button type="button" onClick={() => setLightboxIndex(null)} className="life-lightbox-btn" aria-label="Close"><X size={17} /></button>
              </div>
            </div>

            <button type="button" className="life-lightbox-nav prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous moment"><ChevronLeft size={22} /></button>
            <button type="button" className="life-lightbox-nav next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next moment"><ChevronRight size={22} /></button>

            <m.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className={`life-lightbox-inner ${zoomed ? "is-zoomed" : ""}`}
            >
              {lightboxPost.src
                ? <img src={lightboxPost.src} alt={lightboxPost.alt} />
                : <div className="life-lightbox-empty"><ImagePlus size={30} /><span>Text-only moment</span></div>}
              <div className="life-lightbox-caption">
                <div>
                  <p className="text-sm">{lightboxPost.caption}</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(lightboxPost.date)}</p>
                </div>
                <ReactionRow {...rowProps(lightboxPost)} />
              </div>
            </m.div>
            <p className="life-lightbox-hint">← → to browse · F for full screen · Esc to close</p>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notice && (
          <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="life-toast" role="status">
            {notice}
          </m.div>
        )}
      </AnimatePresence>
        </>
      , document.body)}
    </>
  );
}

function PostCard({
  post, index, burst, rowProps, onToggle, onExpand, onRemove,
}: {
  post: LifePost;
  index: number;
  burst: { id: number; emoji: string }[];
  rowProps: RowProps;
  onToggle: (postId: string, emoji: string, force?: "add") => void;
  onExpand: () => void;
  onRemove?: () => void;
}) {
  return (
    <m.li
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="break-inside-avoid"
    >
      <figure className="life-card group">
        <div className="life-media" onDoubleClick={() => onToggle(post.id, "heart", "add")}>
          {post.src ? (
            <img src={post.src} alt={post.alt} width={post.width} height={post.height} loading="lazy" />
          ) : (
            <div className="life-media-empty" aria-hidden="true">
              <ImagePlus size={24} /><span>Text-only moment</span>
            </div>
          )}
          <span className="life-card-tag" style={{ background: LIFE_ACCENTS[index % LIFE_ACCENTS.length] }} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <button type="button" onClick={onExpand} className="life-expand" aria-label={`View ${post.caption} larger`}><ZoomIn size={16} /></button>
          <AnimatePresence>
            {burst.map((b) => (
              <m.span
                key={b.id}
                initial={{ opacity: 0.95, scale: 0.4, y: 0 }}
                animate={{ opacity: 0, scale: 1.8, y: -60 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="pointer-events-none absolute bottom-6 left-1/2 -ml-5 text-white drop-shadow-lg"
                aria-hidden="true"
              >
                <ReactionIcon name={b.emoji} active size={40} />
              </m.span>
            ))}
          </AnimatePresence>
        </div>
        <figcaption className="px-3 pb-3 pt-3">
          <p className="text-sm leading-snug">{post.caption}</p>
          <time dateTime={post.date} className="mt-1 block text-xs text-muted">{formatDate(post.date)}</time>
          <ReactionRow {...rowProps} onRemove={onRemove} />
        </figcaption>
      </figure>
    </m.li>
  );
}
