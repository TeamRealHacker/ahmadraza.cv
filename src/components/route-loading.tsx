/**
 * Shared branded loading shell for route transitions.
 * Uses the site's own `.skeleton` shimmer (globals.css), never a blank page
 * and never a lone generic spinner, so a slow route still looks like the site.
 */
export function RouteLoading({
  label,
  hero = true,
  cards = 4,
  video = false,
}: {
  label: string;
  hero?: boolean;
  cards?: number;
  video?: boolean;
}) {
  return (
    <main
      id="main"
      className="mx-auto max-w-5xl px-5 pt-28 sm:px-8 sm:pt-36"
      aria-busy="true"
      aria-label={label}
    >
      <div className="skeleton h-4 w-28" />
      {hero && (
        <>
          <div className="mt-8 skeleton h-12 w-2/3 sm:h-16" />
          <div className="mt-4 skeleton h-5 w-1/2" />
        </>
      )}
      {video && <div className="mt-10 skeleton aspect-[16/10] w-full rounded-2xl" />}
      {cards > 0 && (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line px-5 py-4">
              <div className="skeleton h-5 w-1/2" />
              <div className="mt-3 skeleton h-4 w-full" />
              <div className="mt-2 skeleton h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}
      <p className="mt-10 text-center text-xs uppercase tracking-[0.25em] text-muted">
        Loading the good stuff…
      </p>
    </main>
  );
}
