import { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Building, Calendar, CheckCircle, Heart, History, MapPin, Newspaper, Trophy, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { OfflineBanner } from '@/components/offline-banner'

export const metadata: Metadata = {
  title: 'Startseite',
  description: 'KumpelApp - Deine Fan-App für den FC Erzgebirge Aue. Spieltag, Tabelle, Kader, News und mehr.',
}

const features = [
  { name: 'Spieltag', href: '/spielplan', icon: Calendar, description: 'Alle Spiele, Termine & Ergebnisse' },
  { name: 'Tabelle', href: '/tabelle', icon: Trophy, description: 'Aktuelle Regionalliga Nordost Tabelle' },
  { name: 'Kader', href: '/kader', icon: Users, description: 'Spieler, Positionen & Statistiken' },
  { name: 'News', href: '/news', icon: Newspaper, description: 'Aktuelle Nachrichten vom Verein' },
  { name: 'Auswärts', href: '/auswaerts', icon: MapPin, description: 'Stadion-Guide & Anfahrtsinfos' },
  { name: 'Verein', href: '/verein', icon: Building, description: 'Teams, Abteilungen & Mitgliedschaft' },
  { name: 'Tradition', href: '/tradition', icon: History, description: 'Titel, Legenden & Chronik' },
  { name: 'Fans', href: '/fans', icon: Heart, description: 'Fanclubs, Fanbeauftragter & KidsClub' },
]

const quickLinks = [
  { name: 'Tickets', href: 'https://customer59.ticketing.cloud.sap/shop?shopid=103', external: true, icon: AlertTriangle },
  { name: 'Fanshop', href: 'https://www.fc-erzgebirge.shop', external: true, icon: Heart },
  { name: 'Offizielle Website', href: 'https://www.fc-erzgebirge.de', external: true, icon: CheckCircle },
]

export default function HomePage() {
  return (
    <>
      <OfflineBanner />
      <Header />
      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-fc-violet/10 via-fc-bg to-fc-bg py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-fc-fg">
              <span className="text-fc-violet">Kumpel</span>App
            </h1>
            <p className="mt-6 text-lg md:text-xl text-fc-fg/70 max-w-2xl mx-auto">
              Die ultimative Fan-App für den FC Erzgebirge Aue. Spieltag, Tabelle, Kader, News, Tickets, Tippspiel und mehr – alles an einem Ort.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/spielplan"
                className="inline-flex w-full items-center justify-center rounded-xl bg-fc-violet px-7 py-3 text-base font-semibold text-white shadow-sm shadow-fc-violet/20 transition-[background-color,box-shadow,transform] duration-200 hover:bg-fc-violet-dark hover:shadow-md hover:shadow-fc-violet/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] sm:w-auto"
              >
                Zum Spieltag
              </Link>
              <Link
                href="/tabelle"
                className="inline-flex w-full items-center justify-center rounded-xl border border-fc-violet/30 bg-fc-violet/10 px-7 py-3 text-base font-semibold text-fc-fg transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-fc-violet/45 hover:bg-fc-violet/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] sm:w-auto"
              >
                Tabelle ansehen
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <StatCard label="Liga" value="Regionalliga Nordost" icon={Trophy} />
            <StatCard label="Saison" value="2026/27" icon={Calendar} />
            <StatCard label="Stadion" value="Sparkassen-Erzgebirgsstadion" icon={MapPin} />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-fc-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-fc-fg">Alle Funktionen</h2>
            <p className="mt-4 text-lg text-fc-fg/70 max-w-2xl mx-auto">
              Alles, was du als Aue-Fan brauchst – übersichtlich und schnell erreichbar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {features.map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
              >
                <Card className="h-full border-fc-border/70 transition-[transform,border-color,box-shadow,background-color] duration-200 group-hover:-translate-y-1 group-hover:border-fc-violet/45 group-hover:shadow-lg group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-1 group-focus-visible:border-fc-violet/45 group-focus-visible:shadow-lg group-active:translate-y-0">
                  <CardHeader className="pb-3">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/15 transition-[background-color,color,box-shadow,transform] duration-200 group-hover:bg-fc-violet group-hover:shadow-sm group-hover:shadow-fc-violet/25 group-focus-visible:bg-fc-violet">
                      <feature.icon
                        className="h-6 w-6 text-fc-violet transition-colors duration-200 group-hover:text-white group-focus-visible:text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <CardTitle className="text-center text-lg text-fc-fg">{feature.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-sm leading-relaxed text-fc-fg/65">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-fc-surface border-y border-fc-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-fc-fg">Offizielle Links</h2>
            <p className="mt-4 text-lg text-fc-fg/70 max-w-2xl mx-auto">
              Direkte Verweise zu den offiziellen Kanälen des Vereins.
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
            {quickLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="group flex flex-col items-center rounded-xl border border-fc-border bg-fc-bg p-6 text-center transition-[transform,border-color,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/45 hover:shadow-lg hover:shadow-fc-violet/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/15 transition-[background-color,color,box-shadow] duration-200 group-hover:bg-fc-violet group-hover:shadow-sm group-hover:shadow-fc-violet/25 group-focus-visible:bg-fc-violet">
                  <link.icon
                    className="h-6 w-6 text-fc-violet transition-colors duration-200 group-hover:text-white group-focus-visible:text-white"
                    aria-hidden="true"
                  />
                </div>
                <span className="font-medium text-fc-fg">{link.name}</span>
                {link.external ? (
                  <>
                    <span className="sr-only">(öffnet in neuem Tab)</span>
                    <svg
                      className="mt-2 h-4 w-4 text-fc-fg/50 transition-colors group-hover:text-fc-violet/70"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </>
                ) : null}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-fc-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-fc-fg">Bereit für die Saison 2026/27?</h2>
          <p className="mt-4 text-lg text-fc-fg/70 max-w-2xl mx-auto">
            Registriere dich kostenlos und verpasse kein Spiel, keine News und keine Aktion mehr.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-xl bg-fc-violet px-7 py-3 text-base font-semibold text-white shadow-sm shadow-fc-violet/20 transition-[background-color,box-shadow,transform] duration-200 hover:bg-fc-violet-dark hover:shadow-md hover:shadow-fc-violet/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] sm:w-auto"
            >
              Jetzt registrieren
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-fc-violet/30 bg-fc-violet/10 px-7 py-3 text-base font-semibold text-fc-fg transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-fc-violet/45 hover:bg-fc-violet/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] sm:w-auto"
            >
              Anmelden
            </Link>
          </div>
        </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="text-center border-fc-border/50 hover:border-fc-violet/50 transition-colors">
      <CardContent className="py-6">
        <div className="mx-auto mb-3 w-12 h-12 rounded-lg bg-fc-violet/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-fc-violet" aria-hidden="true" />
        </div>
        <p className="text-2xl md:text-3xl font-bold text-fc-fg">{value}</p>
        <p className="text-sm text-fc-fg/60 mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}