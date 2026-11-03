"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Adds a soft reveal as sections scroll into view. Respects reduced motion.
 *
 * Why this is written defensively: on client-side navigation Next.js first
 * renders the route's loading skeleton, and only then streams in the real
 * page. An observer that only scans the DOM once per pathname therefore
 * misses the real [data-reveal] nodes entirely — they stay at opacity 0
 * forever and the page looks blank (the bug reported on /work). So this
 * version also watches for nodes added later (MutationObserver) and has
 * two timed fallbacks: in-viewport nodes after ~900ms, and everything
 * remaining after 3s. Nothing is allowed to stay invisible forever.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reveal = (el: Element) => el.classList.add("in-view");
    const inViewport = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll("[data-reveal]").forEach(reveal);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );

    const observe = (el: Element) => {
      if (!el.classList.contains("in-view")) io.observe(el);
    };

    const scan = () => document.querySelectorAll("[data-reveal]").forEach(observe);
    scan();

    /* Nodes streamed in after navigation (loading skeleton -> real page). */
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches("[data-reveal]")) observe(node);
          node.querySelectorAll("[data-reveal]").forEach(observe);
        }
      }
      /* A node already in view when it arrives should not wait for a scroll. */
      document.querySelectorAll("[data-reveal]:not(.in-view)").forEach((el) => {
        if (inViewport(el)) reveal(el);
      });
    });
    if (document.body) mo.observe(document.body, { childList: true, subtree: true });

    /* A jump straight to the bottom can skip an element without it ever
       intersecting. Reveal anything already scrolled past. */
    let ticking = false;
    const check = () => {
      ticking = false;
      let remaining = 0;
      document.querySelectorAll("[data-reveal]").forEach((n) => {
        if (n.classList.contains("in-view")) return;
        if (n.getBoundingClientRect().bottom < 0) {
          reveal(n);
          io.unobserve(n);
        } else remaining++;
      });
      if (!remaining) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    };
    const frame = requestAnimationFrame(check);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    /* Timed fail-safes: the page must never stay blank. */
    const tInView = window.setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not(.in-view)").forEach((el) => {
        if (inViewport(el)) reveal(el);
      });
    }, 900);
    const tAll = window.setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not(.in-view)").forEach(reveal);
    }, 3000);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(tInView);
      window.clearTimeout(tAll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
