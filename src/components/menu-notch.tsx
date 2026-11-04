"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme";
import { SocialIcon } from "./icons";
import { site } from "@/data/site";

/**
 * Top bar: a floating, softly blurred pill. On wide screens every link is
 * visible with a soft active highlight; on phones the links fold into a
 * panel under the bar. No dividers — spacing and tone carry the hierarchy.
 * (Kept under its original export name so the layout import is unchanged.)
 */

type NavLink = { label: string; href: string; match: string };

const LINKS: NavLink[] = [
  { label: "Home", href: "/", match: "/" },
  { label: "Work", href: "/work", match: "/work" },
  { label: "Life", href: "/life", match: "/life" },
  { label: "About", href: "/about", match: "/about" },
  { label: "Experience", href: "/experience", match: "/experience" },
];

function cx(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

function ThemeButton() {
  const [dark, setDark] = React.useState(true);
  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  return (
    <button
      type="button"
      onClick={() => {
        toggleTheme();
        setDark((d) => !d);
      }}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="nav-icon"
    >
      <span className="relative grid size-[18px] place-items-center" aria-hidden>
        <Sun size={17} className={cx("nav-theme-icon", !dark && "is-on")} />
        <Moon size={17} className={cx("nav-theme-icon", dark && "is-on")} />
      </span>
    </button>
  );
}

export function MenuNotch() {
  const pathname = usePathname() ?? "/";
  const reduced = useReducedMotion() ?? false;
  const rootRef = React.useRef<HTMLElement | null>(null);
  const panelId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const isActive = (l: NavLink) => (l.match === "/" ? pathname === "/" : pathname.startsWith(l.match));

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the phone panel on navigation, Escape, or a tap outside.
  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <nav
      ref={rootRef}
      aria-label="Main"
      className={cx("site-nav-bar pointer-events-auto", scrolled && "is-scrolled", open && "is-open")}
    >
      <div className="nav-row">
        <Link href="/" className="nav-brand" aria-label={`${site.name} — home`}>
          <span className="nav-mark" aria-hidden>AR</span>
          <span className="nav-name">{site.name}</span>
        </Link>

        <ul className="nav-links">
          {LINKS.map((l) => {
            const active = isActive(l);
            return (
              <li key={l.href}>
                <Link href={l.href} aria-current={active ? "page" : undefined} className={cx("nav-link", active && "is-active")}>
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="nav-end">
          <ThemeButton />
          <a href={`mailto:${site.email}`} className="nav-cta">
            Say hello <ArrowUpRight size={14} aria-hidden />
          </a>
          <button
            type="button"
            className="nav-icon nav-burger"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={cx("burger", open && "is-open")} aria-hidden>
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={panelId}
            key="panel"
            className="nav-panel"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="nav-panel-links">
              {LINKS.map((l) => {
                const active = isActive(l);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={cx("nav-panel-link", active && "is-active")}
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="nav-panel-foot">
              <a href={`mailto:${site.email}`} className="nav-cta nav-cta--block" onClick={() => setOpen(false)}>
                Say hello <ArrowUpRight size={14} aria-hidden />
              </a>
              <ul className="nav-socials">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      aria-label={s.label}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="nav-icon"
                    >
                      <SocialIcon name={s.icon} width={17} height={17} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
