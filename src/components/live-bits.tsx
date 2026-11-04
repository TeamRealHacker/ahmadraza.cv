"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, Copy } from "lucide-react";

const TZ = "Asia/Karachi";

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true }).format(d);
}

/** Ahmad's local time in Faisalabad (PKT), ticking once a minute. */
export function LocalTime({ suffix = true }: { suffix?: boolean }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(formatTime(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="local-time" suppressHydrationWarning>
      <span className="tabular-nums">{now ?? "--:--"}</span>
      {suffix ? <span className="local-time-zone"> PKT</span> : null}
    </span>
  );
}

/** Email address with a one-tap copy button and a quiet confirmation. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const t = document.createElement("textarea");
      t.value = email;
      t.setAttribute("readonly", "");
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      try { document.execCommand("copy"); } catch {}
      t.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="copy-email">
      <a href={`mailto:${email}`} className="copy-email-addr">{email}</a>
      <button
        type="button"
        onClick={copy}
        className={`copy-email-btn${copied ? " is-copied" : ""}`}
        aria-label={copied ? "Email copied" : "Copy email address"}
      >
        <span className="copy-email-icon" aria-hidden="true">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </span>
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}

/** Number that counts up once when it scrolls into view. */
export function CountUp({ value, pad = 2, duration = 1100 }: { value: number; pad?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]);
  return <span ref={ref} className="tabular-nums" aria-label={String(value)}>{String(n).padStart(pad, "0")}</span>;
}

/**
 * Magnetic hover: the child drifts a few pixels toward the pointer.
 * Pointer devices with fine input only; off for reduced motion.
 */
export function Magnetic({ children, strength = 0.22, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };
    const leave = () => { el.style.transform = ""; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return <span ref={ref} className={`magnetic${className ? ` ${className}` : ""}`}>{children}</span>;
}
