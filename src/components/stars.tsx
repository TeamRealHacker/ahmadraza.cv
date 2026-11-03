"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; a: number; speed: number; phase: number; drift: number; cross: boolean };
type Shot = { x: number; y: number; ux: number; uy: number; speed: number; len: number; width: number; born: number; life: number };

/**
 * Light starry canvas: twinkling points plus occasional shooting ("falling")
 * stars with a fading trail. DPR-capped, paused when offscreen / tab hidden,
 * and completely static for reduced-motion users.
 */
export function Stars({
  density = 0.05,
  color = "#fff6e6",
  shooting = true,
  shootingColor = "#fff2cf",
}: {
  density?: number;
  color?: string;
  shooting?: boolean;
  shootingColor?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let shots: Shot[] = [];
    let nextShotAt = 1400 + Math.random() * 1400;
    let raf = 0;
    let lastFrame = 0;
    let running = false;
    let onScreen = true;

    const build = () => {
      const rect = parent.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.round((w * h) / 2400 * density * 10));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.05 + 0.3,
        a: Math.random() * 0.55 + 0.35,
        speed: Math.random() * 0.0012 + 0.0004,
        phase: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.004 + 0.001,
        cross: Math.random() < 0.1,
      }));
      shots = [];
    };

    const spawnShot = (t: number) => {
      const fromLeft = Math.random() < 0.5;
      const x = w * (fromLeft ? 0.08 + Math.random() * 0.42 : 0.5 + Math.random() * 0.42);
      const y = h * (0.05 + Math.random() * 0.4);
      const dir = fromLeft ? 1 : -1;
      const angle = 0.34 + Math.random() * 0.14;
      const speed = 0.5 + Math.random() * 0.32;
      shots.push({
        x,
        y,
        ux: dir * Math.cos(angle),
        uy: Math.sin(angle),
        speed,
        len: 110 + Math.random() * 110,
        width: 1.1 + Math.random() * 0.9,
        born: t,
        life: 820 + Math.random() * 520,
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (const s of stars) {
        const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        const x = reduce ? s.x : (s.x + t * s.drift) % w;
        ctx.globalAlpha = s.a * tw;
        ctx.beginPath();
        ctx.arc(x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.cross) {
          const l = s.r * 3.2 * tw;
          ctx.fillRect(x - l, s.y - 0.4, l * 2, 0.8);
          ctx.fillRect(x - 0.4, s.y - l, 0.8, l * 2);
        }
      }

      if (shooting && !reduce) {
        if (t > nextShotAt && shots.length < 3 && w > 0) {
          spawnShot(t);
          nextShotAt = t + 1350 + Math.random() * 2600;
        }
        shots = shots.filter((s) => t - s.born < s.life);
        for (const s of shots) {
          const age = t - s.born;
          const p = age / s.life;
          const dist = s.speed * age;
          const hx = s.x + s.ux * dist;
          const hy = s.y + s.uy * dist;
          const tail = s.len * Math.min(1, 0.3 + p * 2.4);
          const tx = hx - s.ux * tail;
          const ty = hy - s.uy * tail;
          const fade = Math.sin(Math.PI * p);
          const g = ctx.createLinearGradient(tx, ty, hx, hy);
          g.addColorStop(0, "rgba(255,242,207,0)");
          g.addColorStop(1, shootingColor);
          ctx.globalAlpha = fade * 0.95;
          ctx.save();
          ctx.strokeStyle = g;
          ctx.lineWidth = s.width;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(hx, hy);
          ctx.stroke();
          ctx.fillStyle = shootingColor;
          ctx.beginPath();
          ctx.arc(hx, hy, s.width * 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
    };

    /* 30fps is plenty for tiny drifting dots and halves the paint work. */
    const loop = (t: number) => {
      if (t - lastFrame >= 32) {
        lastFrame = t;
        draw(t);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduce || running || !onScreen || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    build();
    draw(0);
    start();

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen ? start() : stop();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      build();
      draw(performance.now());
    });
    ro.observe(parent);
    const vis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", vis);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [density, color, shooting, shootingColor]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
