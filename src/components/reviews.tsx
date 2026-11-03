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
    <span className="review-stars" aria-label={`${rating} out of 5 stars`} style={{ fontSize: size }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "is-on" : "is-off"}>
          ★
        </span>
      ))}
    </span>
  );
}

/** Seeded names carry a role after " — " ("Usman Khan — Business Owner"). */
function splitName(full: string): { person: string; role: string } {
  const [person, role] = full.split(" — ");
  return { person: person.trim(), role: (role ?? "").trim() };
}

function initials(person: string): string {
  return person
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
    /* Admins get a delete button on each review; visitors never see it. */
    fetch("/api/admin", { credentials: "same-origin" })
      .then((res) => setIsAdmin(res.ok))
      .catch(() => setIsAdmin(false));
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

  const remove = async (id: string) => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) setReviews((current) => (current ?? []).filter((r) => r.id !== id));
  };

  const average =
    reviews && reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return (
    <section aria-labelledby="reviews-title" className="projects-section">
      <div className="projects-head" data-reveal>
        <div className="work-head">
          <p className="work-head-kicker"><span className="work-head-bar" aria-hidden="true" /> Reviews</p>
          <h2 id="reviews-title" className="work-head-title work-head-title--sm">
            What people <em>say</em>
          </h2>
          <p className="work-head-note">Real words from people Ahmad has worked with.</p>
        </div>
      </div>

      <div className="reviews-wrap">
        {average !== null && reviews && (
          <div className="reviews-summary" data-reveal>
            <span className="reviews-summary-score">{average.toFixed(1)}</span>
            <span className="reviews-summary-meta">
              <Stars rating={Math.round(average)} size={18} />
              <span>{reviews.length} review{reviews.length > 1 ? "s" : ""} and counting</span>
            </span>
          </div>
        )}

        {reviews === null ? (
          <div aria-busy="true" className="reviews-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="review-card" aria-hidden="true">
                <div className="skeleton h-4 w-2/3" />
                <div className="mt-3 skeleton h-4 w-full" />
                <div className="mt-2 skeleton h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="reviews-empty">No reviews yet — be the first to leave one.</p>
        ) : (
          <ul className="reviews-grid">
            {reviews.map((r, i) => {
              const { person, role } = splitName(r.name);
              return (
                <li
                  key={r.id}
                  className="review-card"
                  data-reveal
                  style={{ transitionDelay: `${Math.min(i, 4) * 80}ms` }}
                >
                  <span className="review-quote" aria-hidden="true">“</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => void remove(r.id)}
                      aria-label={`Delete review by ${person}`}
                      title="Delete this review"
                      className="review-delete"
                    >
                      ×
                    </button>
                  )}
                  <Stars rating={r.rating} size={16} />
                  <p className="review-message">{r.message}</p>
                  <div className="review-author">
                    <span className="review-avatar" aria-hidden="true">{initials(person)}</span>
                    <span>
                      <strong className="review-person">{person}</strong>
                      {role && <span className="review-role">{role}</span>}
                      <span className="review-date">
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form
          className="review-form"
          data-reveal
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <h3 className="review-form-title">Worked with Ahmad? Leave a review</h3>
          <p className="review-form-note">It shows up here right away — no account needed.</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Your name"
            aria-label="Your name"
            className="review-input"
          />
          <div className="review-picker">
            <span>Your rating</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                className={`review-pick ${n <= rating ? "is-on" : ""}`}
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
            className="review-input"
          />
          <div className="review-form-row">
            <button type="submit" disabled={busy || !name.trim() || !message.trim()} className="review-submit">
              {busy ? "Posting…" : "Post review"}
            </button>
            <span className="review-count">{message.length}/500</span>
          </div>
          {notice && <p className="review-notice">{notice}</p>}
        </form>
      </div>
    </section>
  );
}
