export default function Loading() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-5 pt-28 sm:px-8 sm:pt-36" aria-busy="true" aria-label="Loading case study">
      <div className="skeleton h-4 w-28" />
      <div className="mt-8 skeleton h-12 w-2/3 sm:h-16" />
      <div className="mt-4 skeleton h-5 w-1/2" />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-16" />)}
      </div>
      <div className="mt-10 skeleton aspect-[16/9] w-full rounded-2xl" />
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <div>
          <div className="skeleton h-6 w-32" />
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton mt-4 h-4 w-full" />)}
        </div>
        <div>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton mt-4 h-4 w-full" />)}
        </div>
      </div>
      <p className="mt-10 text-center text-xs uppercase tracking-[0.25em] text-muted">Loading the good stuff…</p>
    </main>
  );
}
