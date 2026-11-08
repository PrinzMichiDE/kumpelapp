export default function RootLoading() {
  return (
    <div
      className="flex min-h-[40vh] flex-1 items-center justify-center bg-fc-bg px-4 py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Seite wird geladen</span>
      <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        <div
          aria-hidden="true"
          className="h-12 w-12 animate-pulse rounded-2xl bg-fc-violet/15 ring-1 ring-inset ring-fc-violet/25 motion-reduce:animate-none"
        />
        <div className="w-full space-y-2" aria-hidden="true">
          <div className="mx-auto h-4 w-40 animate-pulse rounded-md bg-fc-surface/80 motion-reduce:animate-none" />
          <div className="mx-auto h-3 w-56 max-w-full animate-pulse rounded-md bg-fc-surface/60 motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  )
}
