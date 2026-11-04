/**
 * Shared loading shell for route transitions: quiet skeleton blocks that
 * match the page's layout, so a slow route still looks like the site.
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
      className="mx-auto max-w-5xl px-5 pt-32 pb-24 sm:px-8 sm:pt-40"
      aria-busy="true"
      aria-label={label}
    >
      {hero && (
        <>
          <div className="skeleton h-12 w-2/3 sm:h-16" />
          <div className="mt-5 skeleton h-5 w-1/2" />
        </>
      )}
      {video && <div className="mt-12 skeleton aspect-[16/10] w-full rounded-3xl" />}
      {cards > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-card px-6 py-6">
              <div className="skeleton h-5 w-1/2" />
              <div className="mt-4 skeleton h-4 w-full" />
              <div className="mt-2 skeleton h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}
      <span className="sr-only">{label}…</span>
    </main>
  );
}
