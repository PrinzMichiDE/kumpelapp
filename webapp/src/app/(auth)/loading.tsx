export default function AuthLoading() {
  return (
    <div
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Anmeldung wird geladen</span>
      <div className="w-full max-w-md rounded-2xl border border-fc-border/70 bg-fc-surface/40 p-6 shadow-sm" aria-hidden="true">
        <div className="mx-auto mb-4 h-7 w-40 animate-pulse rounded-md bg-fc-surface/80 motion-reduce:animate-none" />
        <div className="space-y-3">
          <div className="h-11 animate-pulse rounded-lg bg-fc-surface/70 motion-reduce:animate-none" />
          <div className="h-11 animate-pulse rounded-lg bg-fc-surface/70 motion-reduce:animate-none" />
          <div className="h-11 animate-pulse rounded-lg bg-fc-violet/15 motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  )
}
