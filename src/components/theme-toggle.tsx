"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme";

/** Floating theme switch (bottom-left) with a tidy pencil note + arrow. */
export function ThemeToggle() {
  const noteRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const update = () => {
      const note = noteRef.current;
      if (!note) return;
      /* The note only sits in the empty left gutter of wide screens at the
         very top of the page. Hide it everywhere else so it never covers
         profile text, stats or cards. */
      const hide = window.scrollY > 70 || window.innerWidth < 1280;
      note.classList.toggle("is-hidden", hide);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle light and dark theme"
        title="Toggle theme"
        className="theme-float"
      >
        <span className="theme-float-icons" aria-hidden="true">
          <Sun size={17} className="theme-icon-sun" />
          <Moon size={17} className="theme-icon-moon" />
        </span>
      </button>

      <svg className="theme-ring" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <circle className="theme-ring-line" cx="40" cy="40" r="34" />
        <path className="theme-ring-accent" d="M40 6 A34 34 0 0 1 73 33" />
        <path className="theme-ring-arrow" d="M67 15 L57 17 M67 15 L65 25" />
      </svg>

      <div className="theme-note" ref={noteRef} aria-hidden="true">
        <span className="theme-note-text">theme changer</span>
        <svg className="theme-note-arrow" viewBox="0 0 120 44" fill="none">
          <path className="theme-note-stroke" d="M108 6 C 86 4 64 9 48 20 C 36 28 24 34 16 38" />
          <path className="theme-note-head" d="M16 38 l 16 -4 M16 38 l 3 -16" />
        </svg>
      </div>
    </>
  );
}
