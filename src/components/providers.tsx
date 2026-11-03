"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { CrownCursor } from "./crown-cursor";
import { ContextMenu } from "./context-menu";
import { BackToTop } from "./back-to-top";
import { ScrollReveal } from "./scroll-reveal";
import { ThemeToggle } from "./theme-toggle";
import { SkyAmbient } from "./sky-ambient";
import { VaultSignal } from "./vault-signal";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      {/* Honour the OS "reduce motion" setting for every framer-motion animation. */}
      <MotionConfig reducedMotion="user">
        <SkyAmbient />
        <VaultSignal />
        <ScrollReveal />
        {children}
        <BackToTop />
        <ThemeToggle />
        <CrownCursor />
        <ContextMenu />
      </MotionConfig>
    </LazyMotion>
  );
}
