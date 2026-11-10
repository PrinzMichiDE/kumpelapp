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
          <Bone className="h-9 w-56 max-w-full rounded-xl sm:h-10 sm:w-72" />
          <Bone className="h-4 w-full max-w-xl" />
          <Bone className="h-4 w-2/3 max-w-md" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-fc-border/70 bg-fc-surface/35 p-5 shadow-sm ring-1 ring-inset ring-fc-border/20"
              aria-hidden="true"
            >
              <div className="mb-4 flex items-start gap-3">
                <Bone className="h-11 w-11 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                  <Bone className="h-4 w-32 max-w-[70%]" />
                  <Bone className="h-3 w-20 max-w-[45%]" />
                </div>
              </div>
              <div className="space-y-2.5">
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-[92%]" />
                <Bone className="h-3.5 w-[76%]" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-fc-border/50 pt-4">
                <Bone className="h-3 w-20" />
                <Bone className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
