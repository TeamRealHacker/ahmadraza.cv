"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { BackToTop } from "./back-to-top";
import { ScrollReveal } from "./scroll-reveal";
import { CookieConsent } from "./cookie-consent";
import { VaultSignal } from "./vault-signal";

/**
 * Global client providers — deliberately minimal. The custom cursor,
 * right-click menu and ambient sky layer were removed: they cost frames on
 * every pointer move and made the site feel random. What remains is the
 * scroll reveal, back-to-top, cookie consent and the admin page-view journal.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      {/* Honour the OS "reduce motion" setting for every framer-motion animation. */}
      <MotionConfig reducedMotion="user">
        <ScrollReveal />
        {children}
        <BackToTop />
        <CookieConsent />
        <VaultSignal />
      </MotionConfig>
    </LazyMotion>
  );
}
