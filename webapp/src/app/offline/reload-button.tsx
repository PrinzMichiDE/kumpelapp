'use client'

import { RefreshCw } from 'lucide-react'

export function ReloadButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-fc-border/80 bg-fc-bg/30 px-5 py-3 text-sm font-semibold text-fc-fg transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/35 hover:bg-fc-bg/45 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-colors sm:w-auto"
    >
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
      Verbindung erneut prüfen
    </button>
  )
}
