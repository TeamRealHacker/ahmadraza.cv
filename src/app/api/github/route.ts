import { NextResponse } from "next/server";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

type Day = { date: string; count: number; level: number };

/** Deterministic offline fallback so the graph always renders. */
function fallbackDays(): { total: number; days: Day[] } {
  const days: Day[] = [];
  const today = new Date();
  let total = 0;
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const seed = (i * 7919 + 13) % 101;
    const count = seed < 28 ? 0 : seed < 55 ? 1 + (seed % 3) : seed < 82 ? 3 + (seed % 5) : 7 + (seed % 9);
    const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
    total += count;
    days.push({ date: d.toISOString().slice(0, 10), count, level });
  }
  return { total, days };
}

export async function GET() {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${site.handle}?y=last`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("upstream");
    const json = (await res.json()) as { total?: Record<string, number>; contributions?: Day[] };
    const days = (json.contributions ?? []).map((d) => ({ date: d.date, count: d.count, level: d.level }));
    if (!days.length) throw new Error("empty");
    const total = Object.values(json.total ?? {})[0] ?? days.reduce((a, d) => a + d.count, 0);
    return NextResponse.json({ total, days });
  } catch {
    return NextResponse.json(fallbackDays(), { headers: { "Cache-Control": "public, s-maxage=3600" } });
  }
}
