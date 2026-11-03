"use client";

import { useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";

/** Next-project card with an iOS-style spring + stacked ("duo") thumbnail. */
export function NextProject({
  title, slug, image, accent,
}: { title: string; slug: string; image: string; accent: string }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const href = `/work/${slug}`;

  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.push(href);
    }, 240);
  };

  return (
    <m.a
      href={href}
      onClick={go}
      className="case-next"
      style={{ "--next-accent": accent } as CSSProperties}
      aria-label={`Next project: ${title}`}
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: leaving ? 0.55 : 1, y: leaving ? 8 : 0, scale: leaving ? 0.975 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.8 }}
    >
      <span className="case-next-copy">
        <span className="case-next-kicker">Next project</span>
        <strong className="case-next-title">{title}</strong>
        <span className="case-next-hint">Tap to continue</span>
      </span>
      <span className="case-next-thumb" aria-hidden="true">
        <span className="case-next-ghost" />
        <Image src={image} alt="" fill sizes="190px" className="object-cover object-top" />
      </span>
      <span className="case-next-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
    </m.a>
  );
}
