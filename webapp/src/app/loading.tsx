export default function RootLoading() {
  return (
    <div
      className="relative flex min-h-[100dvh] flex-1 items-center justify-center overflow-hidden bg-fc-bg px-4 py-10 sm:py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fc-violet/50 to-transparent opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(ellipse_at_top,rgba(124,63,191,0.18),transparent_62%)]"
      />
      <span className="sr-only">Seite wird geladen</span>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-fc-border/70 bg-fc-surface/40 p-6 shadow-xl shadow-fc-violet/5 ring-1 ring-inset ring-fc-border/20 backdrop-blur-sm sm:p-7">
          <div className="flex flex-col items-center text-center">
            <div
              aria-hidden="true"
              className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-fc-violet/12 shadow-sm shadow-fc-violet/10 ring-1 ring-inset ring-fc-violet/30"
            >
              <span className="absolute inset-0 rounded-2xl border border-fc-violet/20" />
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-fc-violet/25 border-t-fc-violet motion-reduce:animate-none" />
            </div>
            <p className="text-sm font-semibold tracking-tight text-fc-fg sm:text-base">KumpelApp wird geladen</p>
            <p className="mt-1 text-xs leading-relaxed text-fc-fg/55 sm:text-sm">Inhalte werden vorbereitet, einen Moment bitte.</p>
          </div>

          <div className="mt-6 space-y-3" aria-hidden="true">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-fc-border/50 ring-1 ring-inset ring-fc-border/30">
              <div className="animate-fc-shimmer h-full w-1/2 rounded-full bg-fc-violet/35 motion-reduce:w-1/3 motion-reduce:animate-pulse" />
            </div>
            <div className="space-y-2.5 rounded-xl border border-fc-border/60 bg-fc-bg/25 p-4">
              <div className="animate-fc-shimmer h-3.5 w-3/4 rounded-md bg-fc-surface/70 ring-1 ring-inset ring-fc-border/30 motion-reduce:animate-pulse" />
              <div className="animate-fc-shimmer h-3 w-full rounded-md bg-fc-surface/60 ring-1 ring-inset ring-fc-border/25 motion-reduce:animate-pulse" />
              <div className="animate-fc-shimmer h-3 w-5/6 rounded-md bg-fc-surface/50 ring-1 ring-inset ring-fc-border/25 motion-reduce:animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
