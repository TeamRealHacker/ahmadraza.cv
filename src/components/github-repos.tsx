"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { site } from "@/data/site";

type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number | null;
  html_url: string | null;
  updated_at: string | null;
};

/**
 * Fallback list, verified 2026-11-03 from Ahmad's public GitHub profile.
 * Used ONLY if the live API fails. No star counts are claimed here — the
 * live route is the only source of star counts — and fallback items link to
 * the profile rather than to guessed per-repo URLs.
 */
const FALLBACK_REPOS: Repo[] = [
  { name: "NookNook", description: "Cozy offline notes desk for Windows", language: null, stars: null, html_url: null, updated_at: null },
  { name: "free-ui", description: "Free MIT UI templates, React 19 + TypeScript + Tailwind", language: null, stars: null, html_url: null, updated_at: null },
  { name: "Kanso UI", description: "React component library", language: null, stars: null, html_url: null, updated_at: null },
  { name: "GTA-REAL", description: "2D GTA-style game", language: null, stars: null, html_url: null, updated_at: null },
  { name: "Tide Island", description: "Interactive island for Windows", language: null, stars: null, html_url: null, updated_at: null },
  { name: "dotnote", description: "Minimal mono notes", language: null, stars: null, html_url: null, updated_at: null },
];

export function GithubRepos() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github-repos")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Repo[]) => {
        if (!cancelled && Array.isArray(d) && d.length) {
          /* Top 4 by stars, even if a cached API response predates the fix. */
          setRepos([...d].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0)).slice(0, 4));
        } else if (!cancelled) { setRepos(FALLBACK_REPOS.slice(0, 4)); setUsingFallback(true); }
      })
      .catch(() => {
        if (!cancelled) { setRepos(FALLBACK_REPOS.slice(0, 4)); setUsingFallback(true); }
      });
    return () => { cancelled = true; };
  }, []);

  if (!repos) {
    return (
      <section aria-label="Open source on GitHub" aria-busy="true" className="home-repos mx-auto max-w-5xl px-5 sm:px-8" data-reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="w-full max-w-xs">
            <div className="skeleton h-6 w-2/3" />
            <div className="mt-2 skeleton h-4 w-full" />
          </div>
          <div className="skeleton h-8 w-24 shrink-0 rounded-full" />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="surface rounded-3xl px-6 py-5 sm:px-7 sm:py-6" aria-hidden="true">
              <div className="skeleton h-5 w-1/2" />
              <div className="mt-3 skeleton h-4 w-full" />
              <div className="mt-2 skeleton h-4 w-2/3" />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-muted">Loading repositories…</p>
      </section>
    );
  }

  if (repos.length === 0) {
    return (
      <section aria-labelledby="github-repos-title" className="home-repos mx-auto max-w-5xl px-5 sm:px-8" data-reveal>
        <h2 id="github-repos-title" className="section-title">Open source on GitHub</h2>
        <p className="mt-2 text-sm text-muted">No public repositories to show right now — try the profile instead.</p>
        <a href={`https://github.com/${site.handle}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 chip hover:bg-fg/[0.07]">
          @{site.handle} <ArrowUpRight size={12} />
        </a>
      </section>
    );
  }

  return (
    <section aria-labelledby="github-repos-title" className="home-repos mx-auto max-w-5xl px-5 sm:px-8" data-reveal>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="github-repos-title" className="section-title">Open source on GitHub</h2>
          <p className="mt-3 text-sm text-muted">
            {usingFallback
              ? "Live list unavailable right now — showing a verified snapshot."
              : "Top repositories by stars."}
          </p>
        </div>
        <a
          href={`https://github.com/${site.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 chip transition-colors hover:bg-fg/[0.07]"
        >
          @{site.handle} <ArrowUpRight size={12} />
        </a>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {repos.map((repo) => (
          <li key={repo.name} className="surface rounded-3xl px-6 py-5 sm:px-7 sm:py-6">
            {repo.html_url ? (
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[15px] font-medium tracking-[-0.01em] transition-colors hover:text-[var(--sky-ink)]">
                {repo.name} <ArrowUpRight size={13} />
              </a>
            ) : (
              <span className="font-medium">{repo.name}</span>
            )}
            {repo.description && <p className="mt-2 text-sm leading-relaxed text-muted">{repo.description}</p>}
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {repo.language && <span>{repo.language}</span>}
              {repo.stars !== null && (
                <span className="inline-flex items-center gap-1"><Star size={12} /> {repo.stars}</span>
              )}
              {repo.updated_at && <span>Updated {new Date(repo.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
