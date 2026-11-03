"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Adds a soft reveal as sections scroll into view. Respects reduced motion. */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    nodes.forEach((n) => {
      if (!n.classList.contains("in-view")) io.observe(n);
    });

    /* A jump straight to the bottom can skip an element without it ever
       intersecting. Reveal anything already scrolled past, then retire the
       listener as soon as every node is done. */
    let ticking = false;
    const check = () => {
      ticking = false;
      let remaining = 0;
      nodes.forEach((n) => {
        if (n.classList.contains("in-view")) return;
        if (n.getBoundingClientRect().bottom < 0) {
          n.classList.add("in-view");
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

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
