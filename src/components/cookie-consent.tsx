"use client";

import { useEffect, useState } from "react";

export const COOKIE_CONSENT_KEY = "ar_cookie_consent";
export const COOKIE_CONSENT_EVENT = "ar:cookie-consent";

export type CookieConsentValue = "accepted" | "declined";

export function readCookieConsent(): CookieConsentValue | null {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

function choose(value: CookieConsentValue, setVisible: (v: boolean) => void) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {}
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
  setVisible(false);
}

/**
 * Honest cookie banner: this site sets no tracking or ad cookies at all.
 * It uses one cookie to count visits (the footer "Visitor #N", cookie-gated
 * so a repeat visit is not counted twice) and, only for the admin, a
 * session cookie after unlocking /admin. Declining skips the visit count.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readCookieConsent()) return;
    const timer = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Cookie consent" aria-live="polite" className="cookie-banner">
      <p className="cookie-banner-text">
        This site uses cookies — one to count visits, and one to keep you signed in as admin
        when you unlock it. No tracking, no ads, no analytics.
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="cookie-banner-accept" onClick={() => choose("accepted", setVisible)}>
          Accept
        </button>
        <button type="button" className="cookie-banner-decline" onClick={() => choose("declined", setVisible)}>
          Decline
        </button>
      </div>
    </div>
  );
}
