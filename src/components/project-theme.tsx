"use client";

import { useEffect } from "react";

/**
 * While a case study is open, the site's ambient glow follows that
 * project's accent colour, and is restored when it closes. Pure CSS
 * custom properties — no listeners, no storage.
 */
export function ProjectTheme({ accent, slug }: { accent: string; slug: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.project = slug;
    root.style.setProperty("--glow-a", `color-mix(in srgb, ${accent} 10%, transparent)`);
    root.style.setProperty("--glow-b", `color-mix(in srgb, ${accent} 7%, transparent)`);
    return () => {
      delete root.dataset.project;
      root.style.removeProperty("--glow-a");
      root.style.removeProperty("--glow-b");
    };
  }, [accent, slug]);
  return null;
}
