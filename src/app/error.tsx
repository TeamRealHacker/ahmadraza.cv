"use client";

/**
 * Global error boundary: a client error in any route shows a message and a
 * retry button instead of a blank page.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" style={{ maxWidth: 640, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
      <p style={{ opacity: 0.6, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>Something went wrong</p>
      <h1 style={{ fontSize: 28, margin: "12px 0" }}>This page couldn&apos;t load</h1>
      <p style={{ opacity: 0.75 }}>It might be a temporary glitch. Try again — if it keeps happening, reload the page.</p>
      <button
        type="button"
        onClick={() => reset()}
        style={{ marginTop: 20, padding: "10px 22px", borderRadius: 999, border: "1px solid currentColor", background: "transparent", cursor: "pointer", fontSize: 15 }}
      >
        Try again
      </button>
    </main>
  );
}
