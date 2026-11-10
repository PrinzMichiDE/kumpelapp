'use client'

import { useEffect } from 'react'
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
          className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,63,191,0.12),_transparent_45%)] px-4 py-12 sm:px-6"
        >
          <div
            role="alert"
            aria-live="assertive"
            className="w-full max-w-xl rounded-2xl border border-fc-border/80 bg-fc-surface/90 p-6 text-center shadow-xl shadow-fc-violet/5 backdrop-blur-sm sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-fc-loss/90">Kritischer Fehler</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Die App konnte nicht geladen werden</h1>
            <p className="mt-3 text-sm leading-relaxed text-fc-fg/70 sm:text-base">
              Es ist ein unerwartetes Problem aufgetreten. Bitte versuche es erneut. Wenn der Fehler bestehen bleibt,
              lade die Seite neu oder kehre zur Startseite zurück.
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
                className="inline-flex items-center justify-center rounded-xl bg-fc-violet px-5 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-fc-violet-light hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-colors"
              >
                Erneut versuchen
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-fc-border/80 bg-fc-bg/30 px-5 py-3 text-sm font-semibold text-fc-fg transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/35 hover:bg-fc-bg/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-colors"
              >
                Zur Startseite
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
