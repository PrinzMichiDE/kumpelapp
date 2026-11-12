'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw, RotateCcw } from 'lucide-react'
import './globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="de" className="h-full antialiased" data-theme="dark">
      <body className="min-h-full bg-fc-bg text-fc-fg antialiased">
        <main
          id="main-content"
          className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,63,191,0.14),_transparent_45%),linear-gradient(180deg,_rgba(15,10,20,1),_rgba(15,10,20,1))] px-4 py-12 sm:px-6"
        >
          <div
            role="alert"
            aria-live="assertive"
            className="w-full max-w-xl rounded-2xl border border-fc-border/80 bg-fc-surface/90 p-6 text-center shadow-xl shadow-fc-violet/5 backdrop-blur-sm sm:p-8"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-fc-loss/12 ring-1 ring-inset ring-fc-loss/25">
              <AlertTriangle className="h-7 w-7 text-fc-loss" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-fc-loss/90">Kritischer Fehler</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Die App konnte nicht geladen werden</h1>
            <p className="mt-3 text-sm leading-relaxed text-fc-fg/70 sm:text-base">
              Ein unerwartetes Problem hat den Ladevorgang unterbrochen. Du kannst den letzten Schritt erneut versuchen,
              die Seite neu laden oder zur Startseite zurückkehren.
            </p>
            {error.digest ? (
              <p className="mt-3 text-xs text-fc-fg/45">
                Fehlercode: <span className="font-mono tabular-nums">{error.digest}</span>
              </p>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-fc-violet px-5 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-fc-violet-light hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-colors"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Erneut versuchen
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-fc-border/80 bg-fc-bg/30 px-5 py-3 text-sm font-semibold text-fc-fg transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/35 hover:bg-fc-bg/45 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-colors"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Seite neu laden
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-fc-border/80 bg-fc-bg/30 px-5 py-3 text-sm font-semibold text-fc-fg transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/35 hover:bg-fc-bg/45 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-colors"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Zur Startseite
              </a>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-fc-fg/45">
              Wenn das Problem anhält, prüfe deine Verbindung oder versuche es in einigen Minuten erneut.
            </p>
          </div>
        </main>
      </body>
    </html>
  )
}
