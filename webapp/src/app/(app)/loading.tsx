import { cn } from '@kumpelapp/utils'

function Bone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-lg bg-fc-surface/80 ring-1 ring-inset ring-fc-border/40 motion-reduce:animate-none',
        className
      )}
    />
  )
}

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-fc-bg" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Inhalt wird geladen</span>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <Bone className="h-9 w-56 max-w-full sm:h-10 sm:w-72" />
          <Bone className="h-4 w-full max-w-xl" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-fc-border/70 bg-fc-surface/35 p-5 shadow-sm"
              aria-hidden="true"
            >
              <div className="mb-4 flex items-center gap-3">
                <Bone className="h-10 w-10 rounded-xl" />
                <Bone className="h-5 w-32 max-w-[60%]" />
              </div>
              <div className="space-y-2">
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-[92%]" />
                <Bone className="h-3.5 w-[70%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
