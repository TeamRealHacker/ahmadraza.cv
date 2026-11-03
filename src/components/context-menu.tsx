"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { ArrowUp, Copy, House, Image as ImageIcon, Mail, Moon, Sparkles, User } from "lucide-react";
import { toggleTheme } from "@/lib/theme";
import { SKIES } from "@/data/skies";
import { cycleSkyTheme } from "@/lib/sky";
import { site } from "@/data/site";
import { GithubIcon } from "./icons";

type Item = { label: string; icon: React.ReactNode; run: () => void };

const MENU_W = 210;
const MENU_H = 8 + 9 * 36;

/** Minimal replacement for the browser's right-click menu. */
export function ContextMenu() {
  const router = useRouter();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setPos(null), []);

  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      e.preventDefault();
      setPos({
        x: Math.min(e.clientX, window.innerWidth - MENU_W - 8),
        y: Math.min(e.clientY, window.innerHeight - MENU_H - 8),
      });
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    window.addEventListener("blur", close);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("blur", close);
    };
  }, [close]);

  useEffect(() => {
    if (pos) menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [pos]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const items: Item[] = [
    { label: "Home", icon: <House size={15} />, run: () => router.push("/") },
    { label: "About", icon: <User size={15} />, run: () => router.push("/about") },
    { label: "Life", icon: <ImageIcon size={15} />, run: () => router.push("/life") },
    { label: "Toggle theme", icon: <Moon size={15} />, run: toggleTheme },
    {
      label: "Change sky",
      icon: <Sparkles size={15} />,
      run: () => {
        const id = cycleSkyTheme();
        setToast(`${SKIES.find((s) => s.id === id)?.label ?? "Space"} sky`);
      },
    },
    { label: "Back to top", icon: <ArrowUp size={15} />, run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    {
      label: "Copy link",
      icon: <Copy size={15} />,
      run: () => {
        navigator.clipboard?.writeText(window.location.href).then(() => setToast("Link copied"));
      },
    },
    { label: "Say hello", icon: <Mail size={15} />, run: () => (window.location.href = `mailto:${site.email}`) },
    { label: "GitHub", icon: <GithubIcon width={15} height={15} />, run: () => window.open(site.socials[0].href, "_blank", "noopener") },
  ];

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const btns = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === "ArrowDown" ? (i + 1) % btns.length : (i - 1 + btns.length) % btns.length;
    btns[next]?.focus();
  };

  return (
    <>
      <AnimatePresence>
        {pos && (
          <m.div
            ref={menuRef}
            role="menu"
            aria-label="Quick actions"
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            style={{ left: pos.x, top: pos.y, width: MENU_W, transformOrigin: "top left" }}
            className="fixed z-[95] rounded-2xl border border-line bg-card/90 p-1 text-sm shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-sm"
          >
            {items.map((item) => (
              <button
                key={item.label}
                role="menuitem"
                onClick={() => {
                  close();
                  item.run();
                }}
                className="flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-left text-fg/90 transition-colors hover:bg-fg/[0.07] focus:bg-fg/[0.07] focus:outline-none"
              >
                <span className="text-muted">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </m.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <m.div
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 z-[95] -translate-x-1/2 rounded-full bg-fg px-4 py-2 text-xs font-medium text-bg"
          >
            {toast}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
