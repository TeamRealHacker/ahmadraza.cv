"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CrownIcon } from "./icons";
import { site } from "@/data/site";

const links = [
  { href: "/", label: "Home", match: "/" },
  { href: "/work", label: "Work", match: "/work" },
  { href: "/life", label: "Life", match: "/life" },
  { href: "/about", label: "About", match: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => navRef.current?.classList.toggle("is-scrolled", window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-3 sm:px-4">
      <nav
        ref={navRef}
        aria-label="Primary"
        className="site-nav pointer-events-auto flex max-w-full items-center gap-0.5 rounded-full border border-line p-1 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md sm:gap-1"
      >
        <Link href="/" aria-label={`${site.name} — home`} className="flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium sm:px-3">
          <CrownIcon width={14} height={14} />
          <span className="hidden lg:inline">{site.name}</span>
        </Link>
        <span className="mx-0.5 h-4 w-px shrink-0 bg-line" aria-hidden="true" />
        {links.map((l) => {
          const active = l.match === "/" ? pathname === "/" : l.match !== "" && pathname.startsWith(l.match);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-full px-2 py-1.5 text-xs transition-all duration-200 hover:-translate-y-0.5 sm:px-3 sm:text-sm ${
                active ? "bg-fg text-bg" : "text-muted hover:bg-fg/[0.07] hover:text-fg"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <a
          href={`mailto:${site.email}`}
          className="hidden shrink-0 rounded-full px-3 py-1.5 text-sm text-muted transition-all hover:-translate-y-0.5 hover:bg-fg/[0.07] hover:text-fg sm:inline-block"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
