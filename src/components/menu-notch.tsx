"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme";
import { SocialIcon } from "./icons";
import { site } from "@/data/site";

/**
 * Centered pill menu (adapted MenuNotch): a Menu toggle with blur-in letters
 * and a burger that crosses into an X, a sun/moon theme button, and a panel
 * that grows open with the nav links and real brand social icons.
 * Written against this project's own stack (framer-motion, site tokens) —
 * no new packages.
 */

type NotchLink = { label: string; href: string; match: string };
type NotchSection = { label: string; links: NotchLink[]; size?: "lg" | "sm" };

const SECTIONS: NotchSection[] = [
  {
    label: "Navigate",
    size: "lg",
    links: [
      { label: "Home", href: "/", match: "/" },
      { label: "Work", href: "/work", match: "/work" },
      { label: "Life", href: "/life", match: "/life" },
      { label: "About", href: "/about", match: "/about" },
      { label: "Experience", href: "/experience", match: "/experience" },
    ],
  },
  {
    label: "Say hello",
    size: "sm",
    links: [{ label: "Contact", href: `mailto:${site.email}`, match: "" }],
  },
];

const LETTER_STAGGER = 0.05;
const LETTER_BLUR = 3;
const ROLL = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };
const SPRING_PILL = { type: "spring", stiffness: 380, damping: 32 } as const;
const TWEEN_LETTER = { duration: 0.35, ease: "easeOut" } as const;

function cx(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

/** A label whose letters blur into focus one after another when it changes. */
function Letters({ text, animate }: { text: string; animate: boolean }) {
  return (
    <span aria-hidden className="flex">
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          className="whitespace-pre"
          initial={animate ? { opacity: 0, filter: `blur(${LETTER_BLUR}px)` } : false}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ ...TWEEN_LETTER, delay: i * LETTER_STAGGER }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/** Two lines that cross into an X: the top one turns 135°, the bottom 45°. */
function Burger({ open, reduced }: { open: boolean; reduced: boolean }) {
  const t = reduced ? { duration: 0 } : SPRING_PILL;
  const line =
    "absolute inset-x-[0.75px] top-1/2 -mt-[0.75px] h-[1.5px] rounded-full bg-current";
  return (
    <span aria-hidden className="relative ml-[1.5px] size-[21px] shrink-0">
      <motion.span
        className={line}
        initial={false}
        animate={{ y: open ? 0 : -3.3, rotate: open ? 135 : 0 }}
        transition={t}
      />
      <motion.span
        className={line}
        initial={false}
        animate={{ y: open ? 0 : 3.3, rotate: open ? 45 : 0 }}
        transition={t}
      />
    </span>
  );
}

/** Sun/moon crossfade for the theme button. */
function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <span aria-hidden className="relative block size-6">
      <motion.span
        className="absolute inset-0 grid place-items-center"
        initial={false}
        animate={{ opacity: dark ? 0 : 1, rotate: dark ? -90 : 0 }}
        transition={{ duration: 0.35 }}
      >
        <Sun size={22} />
      </motion.span>
      <motion.span
        className="absolute inset-0 grid place-items-center"
        initial={false}
        animate={{ opacity: dark ? 1 : 0, rotate: dark ? 0 : 90 }}
        transition={{ duration: 0.35 }}
      >
        <Moon size={22} />
      </motion.span>
    </span>
  );
}

/** Rolls its content up and out on hover or focus while a copy rolls in from below. */
function Roll({
  children,
  active,
  reduced,
}: {
  children: React.ReactNode;
  active: boolean;
  reduced: boolean;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="relative block"
        initial={false}
        animate={{ y: active && !reduced ? "-100%" : "0%" }}
        transition={ROLL}
      >
        {children}
        <span aria-hidden className="absolute inset-x-0 top-full">
          {children}
        </span>
      </motion.span>
    </span>
  );
}

export function MenuNotch() {
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;
  const rootRef = React.useRef<HTMLElement | null>(null);
  const contentId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [toggled, setToggled] = React.useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
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

  const toggle = () => {
    setToggled(true);
    setOpen(!open);
  };

  const onTheme = () => {
    toggleTheme();
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  const roll = (id: string) => ({
    onPointerEnter: () => setHovered(id),
    onPointerLeave: () => setHovered((h) => (h === id ? null : h)),
    onFocus: () => setHovered(id),
    onBlur: () => setHovered((h) => (h === id ? null : h)),
  });

  const label = open ? "Close" : "Menu";
  const isActive = (l: NotchLink) =>
    l.match !== "" && (l.match === "/" ? pathname === "/" : pathname.startsWith(l.match));

  return (
    <nav
      ref={rootRef}
      aria-label="Main"
      className="menu-notch pointer-events-auto relative w-[min(414px,calc(100vw-24px))]"
    >
      <div className="absolute inset-x-0 top-0 z-50 rounded-[30px] border border-line bg-card p-2 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex h-[60px] items-center justify-between rounded-[21px] bg-fg pl-6 pr-[9px] text-bg">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={contentId}
            aria-label={label}
            onClick={toggle}
            className="-ml-6 flex cursor-pointer items-center gap-[6.75px] self-stretch rounded-[21px] pr-3 pl-6 text-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Burger open={open} reduced={reduced} />
            <Letters key={label} text={label} animate={toggled && !reduced} />
          </button>
          <button
            type="button"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={onTheme}
            className="grid size-[42px] cursor-pointer place-items-center rounded-full border border-bg/25 outline-none transition-colors duration-500 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ThemeIcon dark={theme === "dark"} />
          </button>
        </div>

        <motion.div
          id={contentId}
          inert={!open}
          aria-hidden={!open || undefined}
          className="overflow-hidden"
          initial={false}
          animate={{ height: open ? "auto" : 0 }}
          transition={reduced ? { duration: 0 } : SPRING_PILL}
        >
          <div className="px-[21px] pt-[34px] pb-[35px]">
            {SECTIONS.map((section, s) => {
              const lg = section.size === "lg";
              const headingId = `${contentId}-s${s}`;
              return (
                <div key={s}>
                  <p id={headingId} className="text-[15px]/[22.5px] text-muted">
                    {section.label}
                  </p>
                  <ul
                    aria-labelledby={headingId}
                    className={cx(
                      "mt-2 flex flex-col font-medium",
                      lg
                        ? "gap-[7.5px] text-[22.5px]/[33.75px]"
                        : "gap-[9.3px] text-[16.5px]/[24.75px]",
                    )}
                  >
                    {section.links.map((link, i) => {
                      const id = `${s}-${i}`;
                      const active = isActive(link);
                      const content = (
                        <Roll active={hovered === id} reduced={reduced}>
                          {link.label}
                        </Roll>
                      );
                      return (
                        <li key={i} className="flex">
                          {link.href.startsWith("mailto:") ? (
                            <a
                              href={link.href}
                              onClick={() => setOpen(false)}
                              className={cx(
                                "menu-notch-link block cursor-pointer text-left outline-none transition-colors duration-500 hover:text-fg focus-visible:text-fg",
                                active && "menu-notch-link-active",
                              )}
                              {...roll(id)}
                            >
                              {content}
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              aria-current={active ? "page" : undefined}
                              onClick={() => setOpen(false)}
                              className={cx(
                                "menu-notch-link block cursor-pointer text-left outline-none transition-colors duration-500 hover:text-fg focus-visible:text-fg",
                                active && "menu-notch-link-active",
                              )}
                              {...roll(id)}
                            >
                              {content}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {lg ? (
                    <div aria-hidden className="mt-[25px] mb-[25px] h-px bg-fg/10" />
                  ) : (
                    <div className="h-[25px]" />
                  )}
                </div>
              );
            })}
            <div>
              <p className="text-[15px]/[22.5px] text-muted">Social media</p>
              <ul className="mt-[10px] flex gap-3">
                {site.socials.map((social, i) => {
                  const id = `social-${i}`;
                  return (
                    <li key={i} className="flex">
                      <a
                        href={social.href}
                        aria-label={social.label}
                        target={social.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="menu-notch-link block cursor-pointer text-left text-muted outline-none transition-colors duration-500 hover:text-fg focus-visible:text-fg [&_svg]:size-5"
                        {...roll(id)}
                      >
                        <Roll active={hovered === id} reduced={reduced}>
                          <span className="grid size-5 place-items-center">
                            <SocialIcon name={social.icon} width={20} height={20} />
                          </span>
                        </Roll>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
