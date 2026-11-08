import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Trophy, Users, Newspaper, MapPin, Building, History, Heart, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { formatDate, formatKickoff, formatMatchDay } from '@kumpelapp/utils'
import { cn } from '@kumpelapp/utils'

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
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/spielplan">
                <button className="w-full sm:w-auto px-8 py-3 text-base font-medium text-white bg-fc-violet rounded-lg hover:bg-fc-violet-dark transition-colors focus:outline-none focus:ring-2 focus:ring-fc-violet focus:ring-offset-2 focus:ring-offset-fc-bg">
                  Zum Spieltag
                </button>
              </Link>
              <Link href="/tabelle">
                <button className="w-full sm:w-auto px-8 py-3 text-base font-medium text-fc-violet bg-fc-violet/10 rounded-lg hover:bg-fc-violet/20 transition-colors focus:outline-none focus:ring-2 focus:ring-fc-violet focus:ring-offset-2 focus:ring-offset-fc-bg">
                  Tabelle ansehen
                </button>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link key={feature.name} href={feature.href} className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50 group-hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="mx-auto mb-3 w-12 h-12 rounded-lg bg-fc-violet/10 flex items-center justify-center group-hover:bg-fc-violet group-hover:text-white transition-colors">
                      <feature.icon className="h-6 w-6 text-fc-violet group-hover:text-white transition-colors" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-center text-lg">{feature.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-sm text-fc-fg/60">{feature.description}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {quickLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="group flex flex-col items-center p-6 rounded-lg bg-fc-bg border border-fc-border hover:border-fc-violet/50 hover:shadow-lg transition-all"
              >
                <div className="mb-3 w-12 h-12 rounded-lg bg-fc-violet/10 flex items-center justify-center group-hover:bg-fc-violet group-hover:text-white transition-colors">
                  <link.icon className="h-6 w-6 text-fc-violet group-hover:text-white transition-colors" aria-hidden="true" />
                </div>
                <span className="font-medium text-fc-fg text-center">{link.name}</span>
                {link.external && (
                  <svg className="mt-2 h-4 w-4 text-fc-fg/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                )}
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
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <button className="w-full sm:w-auto px-8 py-3 text-base font-medium text-white bg-fc-violet rounded-lg hover:bg-fc-violet-dark transition-colors focus:outline-none focus:ring-2 focus:ring-fc-violet focus:ring-offset-2 focus:ring-offset-fc-bg">
                Jetzt registrieren
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full sm:w-auto px-8 py-3 text-base font-medium text-fc-violet bg-fc-violet/10 rounded-lg hover:bg-fc-violet/20 transition-colors focus:outline-none focus:ring-2 focus:ring-fc-violet focus:ring-offset-2 focus:ring-offset-fc-bg">
                Anmelden
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
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