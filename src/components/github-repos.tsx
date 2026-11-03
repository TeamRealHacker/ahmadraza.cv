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
        if (!cancelled && Array.isArray(d) && d.length) setRepos(d);
        else if (!cancelled) { setRepos(FALLBACK_REPOS); setUsingFallback(true); }
      })
      .catch(() => {
        if (!cancelled) { setRepos(FALLBACK_REPOS); setUsingFallback(true); }
      });
    return () => { cancelled = true; };
  }, []);

  if (!repos) return null;

  return (
    <section aria-labelledby="github-repos-title" className="mx-auto max-w-5xl px-5 py-10 sm:px-8" data-reveal>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="github-repos-title" className="text-xl font-semibold">Open source on GitHub</h2>
          <p className="text-sm text-muted">
            {usingFallback
              ? "Live list unavailable right now — showing a verified snapshot."
              : "Public repositories, newest first."}
          </p>
        </div>
        <a
          href={`https://github.com/${site.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs transition-colors hover:bg-fg/[0.07]"
        >
          @{site.handle} <ArrowUpRight size={12} />
        </a>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {repos.map((repo) => (
          <li key={repo.name} className="rounded-2xl border border-line bg-card px-5 py-4">
            {repo.html_url ? (
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium hover:underline">
                {repo.name} <ArrowUpRight size={13} />
              </a>
            ) : (
              <span className="font-medium">{repo.name}</span>
            )}
            {repo.description && <p className="mt-1 text-sm text-muted">{repo.description}</p>}
            <p className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
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
