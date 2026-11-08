import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,63,191,0.12),_transparent_42%),linear-gradient(180deg,_rgba(15,10,20,1),_rgba(15,10,20,1))]">
      <header className="mx-auto flex w-full max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-fc-fg/75 transition-colors hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
          aria-label="Zur Startseite"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Zur Startseite
        </Link>
      </header>
      <main id="main-content" className="pb-8">
        {children}
      </main>
    </div>
  )
}
