export default function Loading() {
  return (
    <main
      className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-5 pt-28 sm:px-8"
      aria-busy="true"
      aria-label="Loading gate"
    >
      <div className="w-full max-w-md rounded-2xl border border-line px-6 py-8">
        <div className="skeleton mx-auto h-10 w-10 rounded-full" />
        <div className="mt-6 skeleton h-6 w-2/3 mx-auto" />
        <div className="mt-4 skeleton h-4 w-full" />
        <div className="mt-2 skeleton h-4 w-3/4 mx-auto" />
        <div className="mt-6 skeleton h-11 w-full" />
        <p className="mt-6 text-center text-xs uppercase tracking-[0.25em] text-muted">
          Loading gate…
        </p>
      </div>
    </main>
  );
}
