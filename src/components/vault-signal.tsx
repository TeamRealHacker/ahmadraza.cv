"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const PAGE_VIEWS_KEY = "ar_page_views_v1";

/**
 * Page-view journal used by the admin dashboard. No clues are printed to
 * the console and no console API is installed.
 */
export function VaultSignal() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(PAGE_VIEWS_KEY) ?? "[]");
      const list = Array.isArray(raw) ? raw : [];
      const next = [{ path: pathname, at: new Date().toISOString() }, ...list].slice(0, 120);
      localStorage.setItem(PAGE_VIEWS_KEY, JSON.stringify(next));
    } catch {
      /* private mode — the journal simply stays empty */
    }
  }, [pathname]);

  return null;
}
