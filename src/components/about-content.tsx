"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Copy, Mail, MapPin } from "lucide-react";
import { Stars } from "./stars";
import { PakistanFlag, SocialIcon } from "./icons";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { SKIES, SKY_STORAGE_KEY } from "@/data/skies";
import { SKY_EVENT, isValidSky } from "@/lib/sky";

const STEPS = [
  { kicker: "01 / Now", title: "Who I am", body: site.bio },
  { kicker: "02 / Path", title: "How I got here", body: site.education },
  { kicker: "03 / Craft", title: "What I do", body: site.experience },
];

const STATS = [
  { label: "Builds shipped" },
  { label: "Tools in the kit" },
  { label: "Human behind it all" },
];

export function AboutContent() {
  const [sky, setSky] = useState<string>("space");
  const [copied, setCopied] = useState(false);
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SKY_STORAGE_KEY);
      if (saved && SKIES.some((s) => s.id === saved)) queueMicrotask(() => setSky(saved));
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
    const targets = [projects.length, site.skills.length, 1];
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
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  const spotlight = (e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <main id="main" className="about-page" data-sky={sky}>
      <section className="about-hero" aria-label="About Ahmad Raza">
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

        <div className="about-hero-inner">
          <p className="about-eyebrow">About <span aria-hidden="true">/</span> 01</p>
          <h1 className="about-name" aria-label={site.name}>
            {site.name.split("").map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="about-name-char"
                style={{ animationDelay: `${90 + i * 55}ms`, whiteSpace: "pre" }}
              >
                {ch}
              </span>
            ))}
            <span className="about-dot" aria-hidden="true">.</span>
          </h1>
          <div className="about-signature-row">
            <span className="about-signature">Ahmad</span>
            <span className="about-signature-handle">— @{site.handle}</span>
          </div>
          <p className="about-lead">{site.tagline}</p>
          <div className="about-actions">
            <a href={`mailto:${site.email}`} className="about-cta">
              <Mail size={15} /> {site.email} <ArrowUpRight size={14} />
            </a>
            <button type="button" onClick={copyEmail} className="about-copy" aria-label="Copy email address">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <Link href="/work" className="about-work-link">
              See the work <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="about-hero-fade" aria-hidden="true" />
      </section>

      <div className="about-inner">
        <div className="about-stats" ref={statsRef} aria-label="At a glance">
          {STATS.map((s, i) => (
            <div className="about-stat" key={s.label} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="about-stat-num">{String(counts[i]).padStart(2, "0")}</span>
              <span className="about-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="about-grid">
          <figure className="about-portrait" data-reveal onMouseMove={spotlight}>
            <div className="about-portrait-frame">
              <Image
                src="/images/avatar.webp"
                alt={`${site.name} — GitHub profile picture`}
                width={400}
                height={400}
                sizes="(max-width: 820px) 100vw, 420px"
                className="about-portrait-img"
              />
              <span className="about-portrait-spot" aria-hidden="true" />
              <span className="about-portrait-tag">@{site.handle}</span>
            </div>
            <figcaption>
              <MapPin size={13} /> {site.location} <PakistanFlag size={14} />
            </figcaption>
          </figure>

          <div className="about-timeline">
            {STEPS.map((s) => (
              <section className="about-step" key={s.title} data-reveal>
                <span className="about-step-node" aria-hidden="true">{s.kicker.slice(0, 2)}</span>
                <div className="about-step-body">
                  <p className="about-step-kicker">{s.kicker}</p>
                  <h2>{s.title}</h2>
                  <p>{s.body}</p>
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="about-signoff" data-reveal aria-hidden="true">
          <span className="about-signoff-rule" />
          <span className="about-signoff-hand">Ahmad</span>
          <span className="about-signoff-rule" />
        </div>
      </div>
    </main>
  );
}
