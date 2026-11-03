"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/data/site";

type Day = { date: string; count: number; level: number };
type State = { status: "idle" | "loading" | "ready" | "error"; total: number; days: Day[] };

const CELL = 11;
const GAP = 3;
const OPACITY = [0.07, 0.3, 0.5, 0.75, 1];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function GithubGraph() {
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>({ status: "idle", total: 0, days: [] });

  // Fetch only when the footer scrolls into view.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setState((s) => ({ ...s, status: "loading" }));
        fetch("/api/github")
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((d: { total: number; days: Day[] }) =>
            setState({ status: d.days.length ? "ready" : "error", total: d.total, days: d.days }),
          )
          .catch(() => setState({ status: "error", total: 0, days: [] }));
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { weeks, months } = useMemo(() => {
    const weeks: (Day | null)[][] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;
    state.days.forEach((d) => {
      const date = new Date(d.date + "T00:00:00Z");
      const dow = date.getUTCDay();
      if (!weeks.length || dow === 0) weeks.push(Array(7).fill(null));
      const col = weeks.length - 1;
      weeks[col][dow] = d;
      const mo = date.getUTCMonth();
      if (mo !== lastMonth && dow < 4) {
        months.push({ label: MONTHS[mo], col });
        lastMonth = mo;
      }
    });
    return { weeks, months };
  }, [state.days]);

  useEffect(() => {
    if (state.status === "ready" && scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [state.status]);

  const width = weeks.length * (CELL + GAP);
  const height = 7 * (CELL + GAP) + 16;

  return (
    <div ref={boxRef} aria-busy={state.status === "loading"} className="min-w-0 overflow-hidden rounded-2xl border border-line bg-card px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">GitHub activity</h3>
          <p className="text-xs text-muted">
            {state.status === "ready"
              ? `${state.total.toLocaleString()} contributions in the last year`
              : state.status === "error"
                ? "Couldn’t load the graph right now"
                : "Loading contributions…"}
          </p>
        </div>
        <a
          href={`https://github.com/${site.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs transition-colors hover:bg-fg/[0.07]"
        >
          @{site.handle} <ArrowUpRight size={12} />
        </a>
      </div>

      <div ref={scrollRef} className="hide-scrollbar overflow-x-auto">
        {state.status === "ready" ? (
          <svg
            role="img"
            aria-label={`GitHub contribution graph for ${site.handle}`}
            viewBox={`0 0 ${width} ${height}`}
            className="min-w-[640px] text-fg"
            width="100%"
          >
            {months.map((mo) => (
              <text key={mo.col + mo.label} x={mo.col * (CELL + GAP)} y={9} fontSize={9} fill="currentColor" opacity={0.45}>
                {mo.label}
              </text>
            ))}
            {weeks.map((week, wi) =>
              week.map((d, di) =>
                d ? (
                  <rect
                    key={d.date}
                    x={wi * (CELL + GAP)}
                    y={16 + di * (CELL + GAP)}
                    width={CELL}
                    height={CELL}
                    rx={3}
                    fill="currentColor"
                    opacity={OPACITY[d.level] ?? 0.07}
                  >
                    <title>{`${d.count} contributions on ${d.date}`}</title>
                  </rect>
                ) : null,
              ),
            )}
          </svg>
        ) : (
          <div
            className={`grid h-[110px] min-w-[640px] grid-flow-col grid-rows-7 gap-[3px] ${state.status === "error" ? "opacity-40" : "skeleton animate-pulse"}`}
            aria-hidden="true"
          >
            {Array.from({ length: 7 * 53 }).map((_, i) => (
              <span key={i} className="rounded-[3px] bg-fg/[0.07]" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
