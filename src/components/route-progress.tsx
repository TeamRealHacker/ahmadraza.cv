"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Phase = "idle" | "loading" | "done";

/**
 * A slim accent line at the very top of the viewport while a route loads.
 * Starts on an internal link click, trickles toward ~85%, and completes
 * when the new pathname commits. Nothing renders while idle.
 */
function Bar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const trickle = useRef<number | undefined>(undefined);
  const hide = useRef<number | undefined>(undefined);
  const failsafe = useRef<number | undefined>(undefined);
  const loading = useRef(false);

  const finish = () => {
    if (!loading.current) return;
    loading.current = false;
    window.clearInterval(trickle.current);
    window.clearTimeout(failsafe.current);
    setProgress(100);
    setPhase("done");
    hide.current = window.setTimeout(() => {
      setPhase("idle");
      setProgress(0);
    }, 420);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      let url: URL;
      try { url = new URL(a.href, location.href); } catch { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;

      window.clearTimeout(hide.current);
      window.clearInterval(trickle.current);
      window.clearTimeout(failsafe.current);
      loading.current = true;
      setPhase("loading");
      setProgress(12);
      trickle.current = window.setInterval(() => {
        setProgress((p) => (p < 85 ? p + (85 - p) * 0.12 : p));
      }, 180);
      /* Never leave the bar hanging if a navigation is abandoned. */
      failsafe.current = window.setTimeout(finish, 8000);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    finish();
  }, [pathname, search]);

  useEffect(() => () => {
    window.clearInterval(trickle.current);
    window.clearTimeout(hide.current);
    window.clearTimeout(failsafe.current);
  }, []);

  if (phase === "idle") return null;
  return (
    <div className={`route-progress is-${phase}`} aria-hidden="true">
      <span className="route-progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
