"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Camera } from "lucide-react";
import { Stars } from "./stars";
import { LifeGrid } from "./life-grid";
import { site } from "@/data/site";
import { SKIES, SKY_STORAGE_KEY } from "@/data/skies";
import { SKY_EVENT, isValidSky } from "@/lib/sky";
import { animatedEmojis, reactionOptions, type LifePost } from "@/data/life";

const TITLE = "Life, unfiltered.";

const STATS = [
  { label: "Moments collected" },
  { label: "Ways to react" },
  { label: "Human behind it all" },
];

export function LifeContent({
  initialPosts,
  initialCounts,
}: {
  initialPosts: LifePost[];
  initialCounts: Record<string, Record<string, number>>;
}) {
  const [sky, setSky] = useState<string>("space");
  /* Admin-only composer: only true after GET /api/admin returns 200 with
     the HttpOnly admin session cookie. Starts false, so visitors never
     see the composer flash in. */
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch("/api/admin", { credentials: "same-origin" })
      .then((res) => { if (alive && res.ok) setIsAdmin(true); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SKY_STORAGE_KEY);
      if (saved && SKIES.some((s) => s.id === saved)) queueMicrotask(() => setSky(saved!));
    } catch {
      /* storage unavailable — keep the default sky */
    }
  }, []);

  /* Keep the hero artwork in step with the shared ambient sky, even if the
     theme is changed from another tab. */
  useEffect(() => {
    const onSky = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (isValidSky(id)) setSky(id);
    };
    const onStorage = (e: StorageEvent) => {
      if ((!e.key || e.key === SKY_STORAGE_KEY) && isValidSky(e.newValue)) setSky(e.newValue);
    };
    window.addEventListener(SKY_EVENT, onSky);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SKY_EVENT, onSky);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const targets = [initialPosts.length, reactionOptions.length + animatedEmojis.length, 1];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      queueMicrotask(() => setCounts(targets));
      return;
    }
    let done = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done) return;
        done = true;
        io.disconnect();
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / 900);
          const eased = 1 - Math.pow(1 - p, 3);
          setCounts(targets.map((v) => Math.round(v * eased)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [initialPosts.length]);

  const openComposer = () => {
    window.dispatchEvent(new Event("ar:open-composer"));
    window.setTimeout(() => {
      document.getElementById("life-composer")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  return (
    <main id="main" className="life-page" data-sky={sky}>
      <section className="about-hero life-hero" aria-label="Daily life">
        <div className="about-hero-bg">
          <Image
            key={`${sky}-desktop`}
            src={`/images/real-${sky}-desktop.webp`}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="about-hero-img about-hero-img-desktop object-cover"
          />
          <Image
            key={`${sky}-mobile`}
            src={`/images/real-${sky}-mobile.webp`}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="about-hero-img about-hero-img-mobile object-cover"
          />
        </div>
        <div className="about-hero-stars" aria-hidden="true">
          <Stars density={0.035} color="#fff6e6" shooting shootingColor="#fff1cd" />
        </div>
        <span className="about-hero-side" aria-hidden="true">{site.name}</span>

        <div className="about-hero-inner life-hero-inner">
          <p className="about-eyebrow">Life <span aria-hidden="true">/</span> 02</p>
          <h1 className="about-name life-name" aria-label={TITLE}>
            {TITLE.split("").map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="about-name-char"
                style={{ animationDelay: `${90 + i * 45}ms`, whiteSpace: "pre" }}
              >
                {ch}
              </span>
            ))}
          </h1>
          <div className="about-signature-row">
            <span className="about-signature">moments</span>
            <span className="about-signature-handle">— @{site.handle}</span>
          </div>
          <p className="about-lead">
            Moments Ahmad posts himself. Tap an emoji to react, or add an animated one of your own.
          </p>
          <div className="about-actions">
            {isAdmin && (
              <button type="button" onClick={openComposer} className="about-cta">
                <Camera size={15} /> New moment <ArrowUpRight size={14} />
              </button>
            )}
            <Link href="/work" className="about-work-link">
              See the work <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="about-hero-fade" aria-hidden="true" />
      </section>

      <div className="life-inner">
        <div className="about-stats life-stats" ref={statsRef} aria-label="At a glance">
          {STATS.map((s, i) => (
            <div className="about-stat" key={s.label} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="about-stat-num">{String(counts[i]).padStart(2, "0")}</span>
              <span className="about-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <LifeGrid initialPosts={initialPosts} initialCounts={initialCounts} isAdmin={isAdmin} />
      </div>
    </main>
  );
}
