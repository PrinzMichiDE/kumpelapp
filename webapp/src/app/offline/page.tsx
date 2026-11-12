import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Home, MapPin, Trophy, WifiOff } from 'lucide-react'
import { Card, CardContent } from '@kumpelapp/ui'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { OfflineBanner } from '@/components/offline-banner'
import { ReloadButton } from './reload-button'

export const metadata: Metadata = {
  title: 'Offline',
  description: 'Offline-Modus der KumpelApp – zuletzt geladene Inhalte weiter nutzen.',
  robots: { index: false, follow: false },
}

const cachedAreas = [
  {
    href: '/spielplan',
    title: 'Spielplan & Ergebnisse',
    description: 'Zuletzt synchronisierte Spiele, Anstoßzeiten und Ergebnisse abrufen.',
    icon: Calendar,
  },
  {
    href: '/tabelle',
    title: 'Tabelle & Saison',
    description: 'Tabellenstand und Saisoninfos aus dem letzten Stand ansehen.',
    icon: Trophy,
  },
  {
    href: '/auswaerts',
    title: 'Auswärts-Guide',
    description: 'Stadioninfos und Anfahrtsdetails öffnen, sofern bereits geladen.',
    icon: MapPin,
  },
] as const

export default function OfflinePage() {
  return (
    <>
      <OfflineBanner />
      <Header />
      <main
        id="main-content"
        className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,63,191,0.14),_transparent_45%),linear-gradient(180deg,_rgba(15,10,20,1),_rgba(15,10,20,1))] px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="w-full max-w-3xl">
          <Card className="overflow-hidden border-fc-border/80 bg-fc-surface/70 shadow-xl shadow-fc-violet/5 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-10">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-fc-violet/12 ring-1 ring-inset ring-fc-violet/25">
                  <WifiOff className="h-8 w-8 text-fc-violet" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-fc-violet/90">Offline-Modus</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-fc-fg sm:text-4xl">Keine Verbindung</h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-fc-fg/70 sm:text-base">
                  Du bist gerade offline. Im Stadionmodus bleiben bereits geladene Inhalte verfügbar. Aktionen wie
                  Tipps oder Check-ins werden gespeichert und bei bestehender Verbindung automatisch synchronisiert.
                </p>
              </div>

              <section aria-labelledby="offline-cached-heading" className="mt-8">
                <h2 id="offline-cached-heading" className="text-sm font-semibold uppercase tracking-wide text-fc-fg/55">
                  Offline verfügbare Bereiche
                </h2>
                <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {cachedAreas.map((area) => {
                    const Icon = area.icon
                    return (
                      <li key={area.href}>
                        <Link
                          href={area.href}
                          className="group flex h-full flex-col rounded-xl border border-fc-border/80 bg-fc-bg/25 p-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/35 hover:bg-fc-bg/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-colors"
                        >
                          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-fc-violet/12 text-fc-violet ring-1 ring-inset ring-fc-violet/20 transition-colors group-hover:bg-fc-violet group-hover:text-white">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="block font-semibold text-fc-fg">{area.title}</span>
                          <span className="mt-1 block text-sm leading-relaxed text-fc-fg/65">{area.description}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>

              <div className="mt-8 flex flex-col gap-3 border-t border-fc-border/70 pt-6 sm:flex-row sm:items-center sm:justify-center">
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fc-violet px-5 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-fc-violet-light hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-colors sm:w-auto"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Zur Startseite
                </Link>
                <ReloadButton />
              </div>

              <p className="mt-4 text-center text-xs leading-relaxed text-fc-fg/50" aria-live="polite">
                Sobald wieder eine Internetverbindung besteht, aktualisiert sich die App automatisch im Hintergrund.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
