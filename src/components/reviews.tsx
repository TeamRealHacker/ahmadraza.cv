"use client";

import { useEffect, useState } from "react";

type Review = {
  id: string;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
};

function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} style={{ letterSpacing: 1, fontSize: size, color: "#eab308" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ opacity: i < rating ? 1 : 0.3 }}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.reviews)) setReviews(data.reviews);
        else setReviews([]);
      })
      .catch(() => setReviews([]));
  }, []);

  const submit = async () => {
    if (!name.trim() || !message.trim() || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), rating, message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not post your review");
      setReviews((current) => [data.review as Review, ...(current ?? [])]);
      setName("");
      setMessage("");
      setRating(5);
      setNotice("Thanks — your review is live below.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not post your review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="reviews-title" className="projects-section" style={{ paddingTop: 8 }}>
      <div className="projects-head" data-reveal>
        <div className="work-head">
          <p className="work-head-kicker"><span className="work-head-bar" aria-hidden="true" /> Reviews</p>
          <h2 id="reviews-title" className="work-head-title work-head-title--sm">
            What people <em>say</em>
          </h2>
          <p className="work-head-note">Worked with Ahmad? Leave a review — it shows up here right away.</p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Your name"
            aria-label="Your name"
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border, #ccc)", background: "transparent", fontSize: 15 }}
          />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 13, opacity: 0.75, marginRight: 6 }}>Rating:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                style={{ fontSize: 22, color: n <= rating ? "#eab308" : "#999", background: "none", border: "none", cursor: "pointer", padding: 2 }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="How was working with Ahmad?"
            aria-label="Your review"
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border, #ccc)", background: "transparent", fontSize: 15, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={busy || !name.trim() || !message.trim()}
              style={{ padding: "10px 22px", borderRadius: 999, border: "1px solid currentColor", background: "transparent", cursor: "pointer", fontSize: 15 }}
            >
              {busy ? "Posting…" : "Post review"}
            </button>
            <span style={{ fontSize: 12, opacity: 0.6 }}>{message.length}/500</span>
          </div>
          {notice && <p style={{ fontSize: 14 }}>{notice}</p>}
        </div>

        {reviews === null ? (
          <div aria-busy="true">
            <div className="skeleton h-4 w-full" />
            <div className="mt-3 skeleton h-4 w-2/3" />
          </div>
        ) : reviews.length === 0 ? (
          <p style={{ opacity: 0.75 }}>No reviews yet — be the first to leave one.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 16 }}>
            {reviews.map((r) => (
              <li key={r.id} style={{ border: "1px solid var(--border, #ddd)", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <strong>{r.name}</strong>
                  <Stars rating={r.rating} />
                </div>
                <p style={{ margin: "8px 0 4px", whiteSpace: "pre-wrap" }}>{r.message}</p>
                <small style={{ opacity: 0.6 }}>
                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
