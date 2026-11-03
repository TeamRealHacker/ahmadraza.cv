"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * The user's Morpheus artwork. No visible buttons: the blue and red hands
 * themselves are the clickable targets.
 */
export function MatrixPills() {
  return (
    <div className="pill-art" data-reveal>
      <Image
        src="/images/morpheus.webp"
        alt="Morpheus offering a blue pill and a red pill"
        width={1005}
        height={816}
        sizes="(min-width: 768px) 700px, 92vw"
        className="pill-art-img"
        priority
      />

      <button
        type="button"
        className="pill-hotspot pill-hotspot-blue"
        aria-label="Take the blue pill — go back to the top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span className="pill-hotspot-label">Blue · Home</span>
      </button>

      <Link
        href="/life"
        className="pill-hotspot pill-hotspot-red"
        aria-label="Take the red pill — open the Life page"
      >
        <span className="pill-hotspot-label">Red · Life</span>
      </Link>

      <p className="pill-hint">Pick a hand</p>
    </div>
  );
}
