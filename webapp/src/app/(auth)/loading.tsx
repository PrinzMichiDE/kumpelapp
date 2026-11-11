export default function AuthLoading() {
  return (
    <div
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Anmeldung wird geladen</span>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-fc-border/70 bg-fc-surface/40 p-6 shadow-sm ring-1 ring-inset ring-fc-border/20"
        aria-hidden="true"
      >
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-inset ring-fc-violet/25">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-fc-violet/25 border-t-fc-violet motion-reduce:animate-none" />
        </div>
        <div className="animate-fc-shimmer mx-auto mb-6 h-5 w-40 rounded-md bg-fc-surface/80 motion-reduce:animate-pulse" />
        <div className="space-y-3">
          <div className="animate-fc-shimmer h-11 rounded-lg bg-fc-surface/70 ring-1 ring-inset ring-fc-border/30 motion-reduce:animate-pulse" />
          <div className="animate-fc-shimmer h-11 rounded-lg bg-fc-surface/70 ring-1 ring-inset ring-fc-border/30 motion-reduce:animate-pulse" />
          <div className="animate-fc-shimmer h-11 rounded-lg bg-fc-violet/20 ring-1 ring-inset ring-fc-violet/20 motion-reduce:animate-pulse" />
        </div>
        <div className="animate-fc-shimmer mx-auto mt-5 h-3 w-48 rounded-md bg-fc-surface/50 motion-reduce:animate-pulse" />
      </div>
    </div>
  )
}
