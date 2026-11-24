"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { m, useScroll, useTransform } from "framer-motion";
import { Stars } from "./stars";
import { site } from "@/data/site";
import { SKIES, type SkyId } from "@/data/skies";
import { SKY_EVENT, getSkyTheme, setSkyTheme } from "@/lib/sky";

const HEADING = "I build for real.";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [sky, setSky] = useState<SkyId>("space");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);

  useEffect(() => {
    const saved = getSkyTheme();
    queueMicrotask(() => {
      setSky(saved);
      /* Also broadcast once on mount so the ambient wash matches a saved sky. */
      window.dispatchEvent(new CustomEvent(SKY_EVENT, { detail: saved }));
    });
  }, []);

  const choose = (id: SkyId) => {
    setSky(id);
    setSkyTheme(id);
  };

  const active = SKIES.find((s) => s.id === sky) ?? SKIES[0];

  return (
    <section aria-label="Introduction" className="px-3 pt-3 sm:px-5" ref={ref}>
      <div className="hero-shell relative mx-auto max-w-5xl overflow-hidden">
        <m.div style={{ y, scale }} className="absolute inset-0">
          {/* Art-directed hero background: <picture> downloads ONLY the matching
              source, unlike the previous two eager next/image fills that always
              pulled both the 1600×560 desktop and 800×800 phone artwork. */}
          <picture key={sky}>
            <source media="(max-width: 640px)" srcSet={`/images/real-${sky}-mobile.webp`} />

            <img
              src={`/images/real-${sky}-desktop.webp`}
              alt=""
              className="hero-img object-cover"
              fetchPriority="high"
              decoding="async"
              style={{ objectPosition: active.focus }}
            />
          </picture>
        </m.div>

        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-stars" aria-hidden="true">
          <Stars density={0.05} color="#fff6e6" shooting shootingColor="#fff1cd" />
        </div>

        <span className="hero-side" aria-hidden="true">{site.name.split(" ")[0]}</span>

        <div className="relative z-10 flex h-full items-center justify-center px-12 sm:px-20">
          <h1
            aria-label={HEADING}
            className="pixel-title hero-title text-center text-[clamp(1.9rem,8vw,5.2rem)] leading-none"
          >
            {HEADING.split("").map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="char-in"
                style={{ animationDelay: `${100 + i * 42}ms`, whiteSpace: "pre" }}
              >
                {ch}
              </span>
            ))}
          </h1>
        </div>

        {/* Minimal sky control: five colour dots + the active sky's name.
            Sits directly on the banner surface, no bar and no icon. */}
        <div className="sky-mini" data-sky={sky} role="group" aria-label="Banner sky theme">
          <div className="sky-mini-dots">
            {SKIES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`sky-mini-dot${s.id === sky ? " is-active" : ""}`}
                style={{ "--sky-chip-accent": s.accent } as CSSProperties}
                onClick={() => choose(s.id)}
                aria-label={`${s.label} sky`}
                aria-pressed={s.id === sky}
                title={`${s.label} sky`}
              >
                <Image src={s.planet} alt="" width={30} height={30} className="sky-mini-planet" />
              </button>
            ))}
          </div>
          <span className="sky-mini-sep" aria-hidden="true" />
          <span className="sky-mini-label" aria-live="polite">{active.label}</span>
        </div>
      </div>
    </section>
  );
}
