"use client";

import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
  type CookieConsentValue,
} from "./cookie-consent";

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    /* No visit is counted until the visitor accepts cookies. Declining
       skips the count entirely — the banner is not decoration. */
    const act = (consent: CookieConsentValue | null) => {
      if (consent === "declined") { setDeclined(true); return; }
      if (consent !== "accepted") return;
      const ctrl = new AbortController();
      fetch("/api/visitors", { method: "POST", signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d: { count: number }) => setCount(d.count))
        .catch((e) => e?.name !== "AbortError" && setFailed(true));
      return () => ctrl.abort();
    };
    let cleanup = act(readCookieConsent());
    const onConsent = (e: Event) => {
      cleanup?.();
      cleanup = act((e as CustomEvent<CookieConsentValue>).detail);
    };
    const onStorage = () => {
      cleanup?.();
      cleanup = act(readCookieConsent());
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    window.addEventListener("storage", onStorage);
    return () => {
      cleanup?.();
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <p className="footer-visitor" aria-live="polite">
      <span className="footer-visitor-dot" aria-hidden="true" />
      {declined || failed ? (
        <span>Thanks for stopping by.</span>
      ) : (
        <span>
          Visitor{" "}
          <strong className="tabular-nums">
            {count === null ? <span className="skeleton skeleton-inline" aria-label="Loading visitor count" /> : `#${count}`}
          </strong>
        </span>
      )}
    </p>
  );
}
