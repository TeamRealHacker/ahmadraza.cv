"use client";

import { useEffect, useRef, useState } from "react";
import { m, useMotionValue, useSpring } from "framer-motion";
import { CrownIcon } from "./icons";

/**
 * A tiny crown that trails the real system cursor with a soft spring.
 * The native cursor is never hidden or replaced. Disabled on touch devices.
 */
export function CrownCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const shownRef = useRef(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 420, damping: 32, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 420, damping: 32, mass: 0.5 });
  const rotate = useSpring(0, { stiffness: 200, damping: 18 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(mq.matches);
    const onChange = () => setEnabled(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let lastX = 0;
    const move = (e: PointerEvent) => {
      x.set(e.clientX + 12);
      y.set(e.clientY - 20);
      rotate.set(Math.max(-18, Math.min(18, (e.clientX - lastX) * 0.8)) - 8);
      lastX = e.clientX;
      /* Only one React render on the first move — not one per pointer event. */
      if (!shownRef.current) {
        shownRef.current = true;
        setVisible(true);
      }
    };
    const leave = () => {
      shownRef.current = false;
      setVisible(false);
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y, rotate]);

  if (!enabled) return null;

  return (
    <m.div
      aria-hidden="true"
      className="crown-cursor pointer-events-none fixed left-0 top-0 z-[100] text-fg"
      style={{ x: sx, y: sy, rotate }}
      animate={{ opacity: visible ? 1 : 0, scale: pressed ? 0.8 : 1 }}
      transition={{ opacity: { duration: 0.2 }, scale: { type: "spring", stiffness: 500, damping: 25 } }}
    >
      <CrownIcon width={16} height={16} />
    </m.div>
  );
}
