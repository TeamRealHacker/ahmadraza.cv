export default function Loading() {
  return (
    <main className="admin-page" aria-busy="true" aria-label="Loading console">
      <aside className="admin-side">
        <div className="skeleton h-10 w-full" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-full" />
          ))}
        </div>
      </aside>
      <section className="admin-main">
        <div className="skeleton h-8 w-1/3" />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
        <div className="mt-6 skeleton h-64 w-full" />
        <p className="mt-6 text-center text-xs uppercase tracking-[0.25em] text-muted">
          Loading console…
        </p>
      </section>
    </main>
  );
}
