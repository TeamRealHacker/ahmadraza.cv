"use client";

import { useEffect } from "react";
import { SKY_ACCENTS } from "@/data/skies";
import { SKY_EVENT, getSkyTheme } from "@/lib/sky";

/**
 * While a case study is open the whole site's ambient colour follows that
 * project's screenshot instead of the sky palette. Restores the sky on exit.
 */
export function ProjectTheme({ accent, slug }: { accent: string; slug: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      root.dataset.project = slug;
      root.style.setProperty("--sky-ambient", accent);
      root.style.setProperty("--glow-a", `color-mix(in srgb, ${accent} 15%, transparent)`);
      root.style.setProperty("--glow-b", `color-mix(in srgb, ${accent} 8%, transparent)`);
    };
    apply();
    window.addEventListener(SKY_EVENT, apply);
    return () => {
      window.removeEventListener(SKY_EVENT, apply);
      delete root.dataset.project;
      root.style.setProperty("--sky-ambient", SKY_ACCENTS[getSkyTheme()]);
      root.style.removeProperty("--glow-a");
      root.style.removeProperty("--glow-b");
    };
  }, [accent, slug]);
  return null;
}
