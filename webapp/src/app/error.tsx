'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log for debugging; avoid exposing details to users.
    console.error(error)
  }, [error])

  return (
    <main
      id="main-content"
      className="flex min-h-[60vh] flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,63,191,0.12),_transparent_45%)] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div
        role="alert"
        aria-live="assertive"
        className="w-full max-w-xl rounded-2xl border border-fc-border/80 bg-fc-surface/80 p-6 text-center shadow-xl shadow-fc-violet/5 backdrop-blur-sm sm:p-8"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-fc-loss/12 ring-1 ring-inset ring-fc-loss/25">
          <AlertTriangle className="h-7 w-7 text-fc-loss" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-fc-loss/90">Unerwarteter Fehler</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-fc-fg sm:text-3xl">
          Etwas ist schiefgelaufen
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-fc-fg/70 sm:text-base">
          Beim Laden dieser Ansicht ist ein Problem aufgetreten. Du kannst es erneut versuchen oder zur Startseite
          zurückkehren.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-fc-fg/45">
            Fehlercode: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-fc-violet px-5 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-fc-violet-light hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Erneut versuchen
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-fc-border/80 bg-fc-bg/30 px-5 py-3 text-sm font-semibold text-fc-fg transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/35 hover:bg-fc-bg/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  )
}
