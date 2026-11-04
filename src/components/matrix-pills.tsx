"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";

type Side = "blue" | "red" | null;

/**
 * "Choose your path" CTA built around the Morpheus artwork. The image sits
 * in a framed card; two clear choices live under it. Hovering a choice (or
 * the matching hand) lights that side of the artwork in its own colour.
 */
export function MatrixPills() {
  const [side, setSide] = useState<Side>(null);
  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="path" data-side={side ?? undefined} aria-labelledby="path-title" data-reveal>
      <div className="path-head">
        <p className="path-eyebrow"><span className="path-eyebrow-dot" aria-hidden="true" />Choose your path</p>
        <h2 id="path-title" className="path-title">
          Blue pill, or <em>red pill?</em>
        </h2>
      </div>

      <div className="path-frame">
        <div className="path-art">
          <Image
            src="/images/morpheus.webp"
            alt="Morpheus offering a blue pill and a red pill"
            width={1005}
            height={816}
            sizes="(min-width: 768px) 720px, 92vw"
            className="path-img"
          />
          <span className="path-glow path-glow-blue" aria-hidden="true" />
          <span className="path-glow path-glow-red" aria-hidden="true" />
          <span className="path-vignette" aria-hidden="true" />

          {/* The hands stay clickable too, for anyone who reaches for them. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="path-hand path-hand-blue"
            onMouseEnter={() => setSide("blue")}
            onMouseLeave={() => setSide(null)}
            onClick={toTop}
          />
          <Link
            href="/life"
            tabIndex={-1}
            aria-hidden="true"
            className="path-hand path-hand-red"
            onMouseEnter={() => setSide("red")}
            onMouseLeave={() => setSide(null)}
          />
        </div>
      </div>

      <div className="path-choices">
        <button
          type="button"
          className="path-choice path-choice-blue"
          onMouseEnter={() => setSide("blue")}
          onMouseLeave={() => setSide(null)}
          onFocus={() => setSide("blue")}
          onBlur={() => setSide(null)}
          onClick={toTop}
        >
          <span className="path-pill" aria-hidden="true" />
          <span className="path-choice-text">
            <span className="path-choice-label">Blue · Home</span>
            <span className="path-choice-sub">Back to the top, nothing changes</span>
          </span>
          <ArrowUp size={16} className="path-choice-icon" aria-hidden="true" />
        </button>
        <Link
          href="/life"
          className="path-choice path-choice-red"
          onMouseEnter={() => setSide("red")}
          onMouseLeave={() => setSide(null)}
          onFocus={() => setSide("red")}
          onBlur={() => setSide(null)}
        >
          <span className="path-pill" aria-hidden="true" />
          <span className="path-choice-text">
            <span className="path-choice-label">Red · Life</span>
            <span className="path-choice-sub">See how deep it goes</span>
          </span>
          <ArrowUpRight size={16} className="path-choice-icon" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
