"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SKY_ACCENTS, SKY_STORAGE_KEY, type SkyId } from "@/data/skies";
import { SKY_EVENT, isValidSky } from "@/lib/sky";

/**
 * Keeps one shared, soft ambient colour on <html> for the whole site.
 * The home banner, /about and /life already pick their artwork from the
 * same key — this makes the page background follow that choice too.
 */
export function SkyAmbient() {
  const pathname = usePathname();

  useEffect(() => {
    const apply = (raw: unknown) => {
      const sky: SkyId = isValidSky(raw) ? raw : "space";
      const root = document.documentElement;
      /* A case study owns the ambient colour while it is open. */
      if (root.dataset.project) return;
      root.dataset.sky = sky;
      root.style.setProperty("--sky-ambient", SKY_ACCENTS[sky]);
    };

    const read = () => {
      let saved: string | null = null;
      try {
        saved = window.localStorage.getItem(SKY_STORAGE_KEY);
      } catch {
        /* storage unavailable */
      }
      apply(saved);
    };

    read();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === SKY_STORAGE_KEY) apply(e.newValue);
    };
    const onSky = (e: Event) => apply((e as CustomEvent<string>).detail);

    window.addEventListener("storage", onStorage);
    window.addEventListener(SKY_EVENT, onSky);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SKY_EVENT, onSky);
      window.removeEventListener("focus", read);
    };
  }, [pathname]);

  return null;
}
