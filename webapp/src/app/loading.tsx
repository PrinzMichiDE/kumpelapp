export default function RootLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-1 items-center justify-center bg-fc-bg px-4 py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Seite wird geladen</span>
      <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
        <div
          aria-hidden="true"
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-fc-violet/12 ring-1 ring-inset ring-fc-violet/25"
        >
          <div className="h-7 w-7 animate-pulse rounded-xl bg-fc-violet/35 motion-reduce:animate-none" />
        </div>
        <div className="w-full space-y-2.5" aria-hidden="true">
          <div className="mx-auto h-4 w-44 animate-pulse rounded-md bg-fc-surface/80 motion-reduce:animate-none" />
          <div className="mx-auto h-3 w-60 max-w-full animate-pulse rounded-md bg-fc-surface/60 motion-reduce:animate-none" />
          <div className="mx-auto h-3 w-48 max-w-[80%] animate-pulse rounded-md bg-fc-surface/50 motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  )
}
