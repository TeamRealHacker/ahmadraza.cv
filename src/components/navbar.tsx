"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme";
import { SocialIcon } from "./icons";
import { site } from "@/data/site";

/**
 * One calm navigation bar: brand on the left, the five real links in the
 * middle, theme toggle + "Say hello" on the right. On mobile the links move
 * into a clean drop-down drawer — no hidden pill menus, no letter tricks.
 */

const LINKS = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Experience", href: "/experience" },
  { label: "Life", href: "/life" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");

  React.useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /* Close the drawer whenever the route changes. */
  React.useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const onTheme = () => {
    toggleTheme();
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return (
    <header className={`site-nav${scrolled || open ? " is-scrolled" : ""}`}>
      <div className="nav-inner">
        <Link href="/" className="nav-brand" aria-label={`${site.name} — home`}>
          <span className="nav-logo" aria-hidden="true">AR</span>
          <span>{site.name}</span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${isActive(l.href) ? " is-active" : ""}`}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-button"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={onTheme}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <a href={`mailto:${site.email}`} className="btn btn-primary nav-cta">
            Say hello
          </a>
          <button
            type="button"
            className="icon-button nav-burger"
            aria-expanded={open}
            aria-controls="nav-drawer"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="3.5" y1="3.5" x2="13.5" y2="13.5" />
                  <line x1="13.5" y1="3.5" x2="3.5" y2="13.5" />
                </>
              ) : (
                <>
                  <line x1="2.5" y1="5" x2="14.5" y2="5" />
                  <line x1="2.5" y1="12" x2="14.5" y2="12" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div id="nav-drawer" className={`nav-drawer${open ? " is-open" : ""}`}>
        <div className="nav-drawer-inner">
          <Link href="/" className={`nav-drawer-link${isActive("/") ? " is-active" : ""}`}>
            Home <span className="nav-drawer-index">01</span>
          </Link>
          {LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} className={`nav-drawer-link${isActive(l.href) ? " is-active" : ""}`}>
              {l.label}
              <span className="nav-drawer-index">{String(i + 2).padStart(2, "0")}</span>
            </Link>
          ))}
          <div className="nav-drawer-foot">
            <a href={`mailto:${site.email}`} className="btn btn-primary">Say hello</a>
            <div className="nav-drawer-socials">
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="icon-button"
                >
                  <SocialIcon name={s.icon} width={16} height={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
