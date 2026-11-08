import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Home, SearchX } from 'lucide-react'
import { Card, CardContent } from '@kumpelapp/ui'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { OfflineBanner } from '@/components/offline-banner'

export const metadata: Metadata = {
  title: 'Seite nicht gefunden | KumpelApp',
  description: 'Die angeforderte Seite wurde nicht gefunden.',
  robots: { index: false, follow: false },
}

const actions = [
  {
    href: '/',
    label: 'Zur Startseite',
    description: 'Überblick, nächste Spiele und Highlights',
    icon: Home,
    primary: true,
  },
  {
    href: '/spielplan',
    label: 'Zum Spielplan',
    description: 'Kommende und vergangene Begegnungen',
    icon: Calendar,
    primary: false,
  },
] as const

export default function NotFound() {
  return (
    <>
      <OfflineBanner />
      <Header />
      <main
        id="main-content"
        className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,63,191,0.14),_transparent_45%),linear-gradient(180deg,_rgba(15,10,20,1),_rgba(15,10,20,1))] px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="w-full max-w-2xl">
          <Card className="overflow-hidden border-fc-border/80 bg-fc-surface/70 shadow-xl shadow-fc-violet/5 backdrop-blur-sm">
            <CardContent className="p-6 text-center sm:p-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-fc-violet/12 ring-1 ring-inset ring-fc-violet/25">
                <SearchX className="h-8 w-8 text-fc-violet" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-fc-violet/90">Fehler 404</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-fc-fg sm:text-4xl">
                Seite nicht gefunden
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-fc-fg/70 sm:text-base">
                Die aufgerufene Seite existiert nicht, wurde verschoben oder ist vorübergehend nicht verfügbar.
                Nutze eine der folgenden Optionen, um zurück zur KumpelApp zu finden.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {actions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={
                        action.primary
                          ? 'group flex items-start gap-3 rounded-xl border border-fc-violet/35 bg-fc-violet/12 p-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/55 hover:bg-fc-violet/16 hover:shadow-lg hover:shadow-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface'
                          : 'group flex items-start gap-3 rounded-xl border border-fc-border/80 bg-fc-bg/25 p-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/35 hover:bg-fc-bg/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface'
                      }
                      aria-label={action.label}
                    >
                      <span
                        className={
                          action.primary
                            ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-fc-violet text-white shadow-sm'
                            : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-fc-violet/12 text-fc-violet ring-1 ring-inset ring-fc-violet/20 transition-colors group-hover:bg-fc-violet group-hover:text-white'
                        }
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-fc-fg">{action.label}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-fc-fg/65">
                          {action.description}
                        </span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
