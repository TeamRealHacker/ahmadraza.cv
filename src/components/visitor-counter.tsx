"use client";

import { useEffect, useState } from "react";

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/visitors", { method: "POST", signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { count: number }) => setCount(d.count))
      .catch((e) => e?.name !== "AbortError" && setFailed(true));
    return () => ctrl.abort();
  }, []);

  return (
    <p className="footer-visitor" aria-live="polite">
      <span className="footer-visitor-dot" aria-hidden="true" />
      {failed ? (
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
