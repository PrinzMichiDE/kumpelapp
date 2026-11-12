export default function AuthLoading() {
  return (
    <div
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10 sm:px-6 sm:py-14"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Anmeldebereich wird geladen</span>

      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-fc-border/80 bg-card/90 shadow-lg shadow-black/10 ring-1 ring-inset ring-fc-border/20 backdrop-blur-sm"
        aria-hidden="true"
      >
        <div className="border-b border-fc-border/60 px-6 py-6 text-center sm:px-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-inset ring-fc-violet/25">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-fc-violet/25 border-t-fc-violet motion-reduce:animate-none" />
          </div>
          <div className="animate-fc-shimmer mx-auto h-6 w-36 rounded-md bg-fc-surface/80 motion-reduce:animate-pulse" />
          <div className="animate-fc-shimmer mx-auto mt-3 h-3.5 w-64 max-w-full rounded-md bg-fc-surface/60 motion-reduce:animate-pulse" />
          <div className="animate-fc-shimmer mx-auto mt-2 h-3.5 w-52 max-w-full rounded-md bg-fc-surface/50 motion-reduce:animate-pulse" />
        </div>

        <div className="space-y-4 px-6 py-6 sm:px-8">
          <div className="space-y-2">
            <div className="animate-fc-shimmer h-3 w-20 rounded-md bg-fc-surface/55 motion-reduce:animate-pulse" />
            <div className="animate-fc-shimmer h-11 rounded-lg bg-fc-surface/70 ring-1 ring-inset ring-fc-border/30 motion-reduce:animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="animate-fc-shimmer h-3 w-24 rounded-md bg-fc-surface/55 motion-reduce:animate-pulse" />
            <div className="animate-fc-shimmer h-11 rounded-lg bg-fc-surface/70 ring-1 ring-inset ring-fc-border/30 motion-reduce:animate-pulse" />
          </div>
          <div className="animate-fc-shimmer h-11 rounded-xl bg-fc-violet/20 ring-1 ring-inset ring-fc-violet/25 motion-reduce:animate-pulse" />
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="animate-fc-shimmer h-3 w-28 rounded-md bg-fc-surface/45 motion-reduce:animate-pulse" />
            <div className="animate-fc-shimmer h-3 w-16 rounded-md bg-fc-surface/55 motion-reduce:animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
