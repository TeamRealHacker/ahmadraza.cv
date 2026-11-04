"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { m, useScroll, useTransform } from "framer-motion";
import { Stars } from "./stars";
import { SKIES, type SkyId } from "@/data/skies";
import { SKY_EVENT, getSkyTheme, setSkyTheme } from "@/lib/sky";

const HEADING = "I Work For Real !!";
const WORDS = HEADING.split(" ").reduce<{ word: string; start: number }[]>((acc, word) => {
  const prev = acc[acc.length - 1];
  acc.push({ word, start: prev ? prev.start + prev.word.length + 1 : 0 });
  return acc;
}, []);

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
          <Image
            key={`${sky}-desktop`}
            src={`/images/real-${sky}-desktop.webp`}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 641px) 1024px, 100vw"
            style={{ objectPosition: active.focus }}
            className="hero-img hero-img-desktop object-cover"
          />
          <Image
            key={`${sky}-mobile`}
            src={`/images/real-${sky}-mobile.webp`}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="hero-img hero-img-mobile object-cover"
          />
        </m.div>

        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-stars" aria-hidden="true">
          <Stars density={0.05} color="#fff6e6" shooting shootingColor="#fff1cd" />
        </div>

        <div className="relative z-10 flex h-full items-center justify-center px-12 sm:px-20">
          <h1
            aria-label={HEADING}
            className="hero-title text-center"
          >
            {/* Letters animate one by one, but each word stays unbreakable
                so the line never wraps mid-word on narrow screens. */}
            {WORDS.map(({ word, start }) => (
              <span key={start} className="hero-word">
                {word.split("").map((ch, j) => (
                  <span key={j} aria-hidden="true" className="char-in" style={{ animationDelay: `${100 + (start + j) * 42}ms` }}>
                    {ch}
                  </span>
                ))}
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
          <span className="sky-mini-label" aria-live="polite">{active.label}</span>
        </div>
      </div>
    </section>
  );
}
