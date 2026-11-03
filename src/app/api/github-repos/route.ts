import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  updated_at: string;
  fork: boolean;
};

/**
 * Server-only proxy for Ahmad's public GitHub repos. The browser never talks
 * to api.github.com directly, and no token is used — this is public data.
 */
export async function GET() {
  try {
    const res = await fetch(
      "https://api.github.com/users/MrRealORG/repos?per_page=100&sort=updated",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "ahmadraza-portfolio",
        },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "GitHub API unavailable" },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }
    const data = (await res.json()) as GitHubRepo[];
    /* Only the top 4 by stars — Ahmad asked for no full list. */
    const repos = data
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 4)
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        html_url: r.html_url,
        updated_at: r.updated_at,
      }));
    return NextResponse.json(repos, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json(
      { error: "GitHub API unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
