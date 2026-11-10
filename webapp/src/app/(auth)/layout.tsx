import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,63,191,0.14),_transparent_42%),linear-gradient(180deg,_rgba(15,10,20,1),_rgba(15,10,20,1))]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-fc-fg/75 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
          aria-label="Zur Startseite"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Zur Startseite</span>
        </Link>

        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
          aria-label="KumpelApp Startseite"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-fc-violet/15 ring-1 ring-fc-violet/30 transition-colors group-hover:bg-fc-violet/25">
            <svg className="h-4.5 w-4.5 text-fc-violet" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" />
              <path d="M50 24 L50 76 M24 50 L76 50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-fc-fg/90 sm:block">KumpelApp</span>
        </Link>
      </header>
      <main id="main-content" className="pb-10 sm:pb-12">
        {children}
      </main>
    </div>
  )
}
