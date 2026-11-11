export default function RootLoading() {
  return (
    <div
      className="relative flex min-h-[60vh] flex-1 items-center justify-center overflow-hidden bg-fc-bg px-4 py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(124,63,191,0.18),transparent_60%)]"
      />
      <span className="sr-only">Seite wird geladen</span>
      <div className="relative flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div
          aria-hidden="true"
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-fc-violet/12 shadow-sm shadow-fc-violet/10 ring-1 ring-inset ring-fc-violet/30"
        >
          <span className="absolute inset-0 rounded-2xl border border-fc-violet/20" />
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-fc-violet/25 border-t-fc-violet motion-reduce:animate-none" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-tight text-fc-fg">KumpelApp lädt</p>
          <p className="text-xs text-fc-fg/55">Einen Moment bitte …</p>
        </div>
        <div className="w-full space-y-2.5 rounded-xl border border-fc-border/60 bg-fc-surface/30 p-4" aria-hidden="true">
          <div className="animate-fc-shimmer h-3.5 w-3/4 rounded-md bg-fc-surface/70 motion-reduce:animate-pulse" />
          <div className="animate-fc-shimmer h-3 w-full rounded-md bg-fc-surface/60 motion-reduce:animate-pulse" />
          <div className="animate-fc-shimmer h-3 w-5/6 rounded-md bg-fc-surface/50 motion-reduce:animate-pulse" />
        </div>
      </div>
    </div>
  )
}
