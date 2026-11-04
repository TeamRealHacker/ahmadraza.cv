"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domMax } from "framer-motion";
import { CrownCursor } from "./crown-cursor";
import { ContextMenu } from "./context-menu";
import { BackToTop } from "./back-to-top";
import { ScrollReveal } from "./scroll-reveal";
import { CookieConsent } from "./cookie-consent";
import { SkyAmbient } from "./sky-ambient";
import { VaultSignal } from "./vault-signal";
import { RouteProgress } from "./route-progress";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax}>
      {/* Honour the OS "reduce motion" setting for every framer-motion animation. */}
      <MotionConfig reducedMotion="user">
        <RouteProgress />
        <SkyAmbient />
        <VaultSignal />
        <ScrollReveal />
        {children}
        <BackToTop />
        <CookieConsent />
        <CrownCursor />
        <ContextMenu />
      </MotionConfig>
    </LazyMotion>
  );
}
