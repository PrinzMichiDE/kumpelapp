import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Baby, ChevronRight, ExternalLink, Heart, MapPin, Shield, Users, Volume2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@kumpelapp/utils'

const focusRing =
  'group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg'

const cardHover =
  'h-full transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:border-fc-violet/45 group-hover:shadow-lg group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-0.5 group-focus-visible:border-fc-violet/45 group-focus-visible:shadow-lg'

const accentStyles = {
  violet: 'bg-fc-violet/12 text-fc-violet ring-fc-violet/20',
  sky: 'bg-sky-500/12 text-sky-300 ring-sky-400/20',
  emerald: 'bg-emerald-500/12 text-emerald-300 ring-emerald-400/20',
  purple: 'bg-purple-500/12 text-purple-300 ring-purple-400/20',
  orange: 'bg-orange-500/12 text-orange-300 ring-orange-400/20',
  pink: 'bg-pink-500/12 text-pink-300 ring-pink-400/20',
} as const

const fanclubs = [
  { name: 'Veilelchen Aue', city: 'Aue', members: 120 },
  { name: 'Schachtfreunde', city: 'Aue', members: 85 },
  { name: 'Lila-Weiße Herzen', city: 'Chemnitz', members: 60 },
  { name: 'Erzgebirgsveilchen Dresden', city: 'Dresden', members: 45 },
  { name: 'Veilchenpower Berlin', city: 'Berlin', members: 70 },
  { name: 'Kumpels aus Bayern', city: 'München', members: 35 },
]

function AccentIcon({
  icon: Icon,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  accent: keyof typeof accentStyles
}) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-[background-color,color] duration-200 group-hover:bg-fc-violet group-hover:text-white group-hover:ring-fc-violet/30 group-focus-visible:bg-fc-violet group-focus-visible:text-white',
        accentStyles[accent]
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
  )
}

export default function FansPage() {
  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Fans &amp; Fanclubs</h1>
          <p className="mt-2 text-fc-fg/70">Die Kumpel-Gemeinschaft – organisiert, vernetzt, leidenschaftlich</p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          <Link href="/fans/fanclubs" className={focusRing} aria-label="Offizielle Fanclubs">
            <Card className={cardHover}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <AccentIcon icon={Users} accent="violet" />
                  <CardTitle className="text-lg">Offizielle Fanclubs</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="mb-4 text-sm leading-relaxed text-fc-fg/70">12 offizielle Fanclubs mit über 400 Mitgliedern</p>
                <ul className="space-y-0">
                  {fanclubs.slice(0, 3).map((fc) => (
                    <li key={fc.name} className="flex items-center justify-between gap-3 border-b border-fc-border/50 py-2 last:border-0">
                      <span className="text-sm font-medium text-fc-fg">{fc.name}</span>
                      <span className="shrink-0 text-xs text-fc-fg/55">
                        {fc.city} • {fc.members}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fans/fanbeauftragter" className={focusRing} aria-label="Fanbeauftragter">
            <Card className={cardHover}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <AccentIcon icon={Shield} accent="sky" />
                  <CardTitle className="text-lg">Fanbeauftragter</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="mb-4 text-sm leading-relaxed text-fc-fg/70">Dein direkter Draht zum Verein</p>
                <ul className="space-y-2 text-sm text-fc-fg/70">
                  {['Ansprechpartner für Fanbelange', 'Vermittlung bei Konflikten', 'Fanclub-Unterstützung'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Heart className="mt-0.5 h-4 w-4 shrink-0 text-fc-violet/70" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fans/fanprojekt" className={focusRing} aria-label="Fanprojekt Aue">
            <Card className={cardHover}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <AccentIcon icon={Users} accent="emerald" />
                  <CardTitle className="text-lg">Fanprojekt Aue</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="mb-4 text-sm leading-relaxed text-fc-fg/70">Sozialpädagogische Fanarbeit</p>
                <ul className="space-y-2 text-sm text-fc-fg/70">
                  {['Begleitung zu Auswärtsspielen', 'Beratung & Unterstützung', 'Präventionsarbeit'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Heart className="mt-0.5 h-4 w-4 shrink-0 text-fc-violet/70" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fans/barrierefreiheit" className={focusRing} aria-label="Team Barrierefrei">
            <Card className={cardHover}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <AccentIcon icon={Shield} accent="purple" />
                  <CardTitle className="text-lg">Team Barrierefrei</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="mb-4 text-sm leading-relaxed text-fc-fg/70">Inklusion im Stadion</p>
                <ul className="space-y-2 text-sm text-fc-fg/70">
                  {['Rollstuhlplätze & Begleitung', 'Audioguide für Sehbehinderte', 'Induktionsschleifen'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Heart className="mt-0.5 h-4 w-4 shrink-0 text-fc-violet/70" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fans/steigerfunk" className={focusRing} aria-label="Steigerfunk">
            <Card className={cardHover}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <AccentIcon icon={Volume2} accent="orange" />
                  <CardTitle className="text-lg">Steigerfunk</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="mb-4 text-sm leading-relaxed text-fc-fg/70">Das Fanradio live am Spieltag</p>
                <ul className="space-y-2 text-sm text-fc-fg/70">
                  {['Live-Kommentierung', 'Interviews & Hintergründe', 'Auch in der App hörbar'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Heart className="mt-0.5 h-4 w-4 shrink-0 text-fc-violet/70" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fans/kidsclub" className={focusRing} aria-label="KidsClub">
            <Card className={cardHover}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <AccentIcon icon={Baby} accent="pink" />
                  <CardTitle className="text-lg">KidsClub</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="mb-4 text-sm leading-relaxed text-fc-fg/70">Für die jüngsten Veilchen-Fans</p>
                <ul className="space-y-2 text-sm text-fc-fg/70">
                  {['Kindergeburtstage im Stadion', 'Exklusive Aktionen', 'Maskottchen-Besuche'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Heart className="mt-0.5 h-4 w-4 shrink-0 text-fc-violet/70" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        <section className="mb-12" aria-labelledby="fanclub-map-heading">
          <h2 id="fanclub-map-heading" className="mb-5 text-2xl font-bold tracking-tight text-fc-fg">
            Fanclub-Karte
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex aspect-[16/9] min-h-[220px] items-center justify-center border-b border-fc-border/70 bg-[radial-gradient(circle_at_top,_rgba(124,63,191,0.12),_transparent_55%),linear-gradient(180deg,_rgba(26,19,37,0.9),_rgba(15,10,20,1))]">
                <div className="max-w-md p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-fc-violet/12 ring-1 ring-fc-violet/20">
                    <MapPin className="h-7 w-7 text-fc-violet" aria-hidden="true" />
                  </div>
                  <p className="text-base font-medium text-fc-fg">Interaktive Karte der Fanclubs</p>
                  <p className="mt-1 text-sm text-fc-fg/60">Entdecke Fanclubs in deiner Nähe und öffne Details.</p>
                  <Link
                    href="/fans/fanclubs"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-fc-violet/12 px-4 py-2 text-sm font-semibold text-fc-violet transition-colors hover:bg-fc-violet/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                  >
                    Zur vollständigen Karte
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="important-links-heading">
          <h2 id="important-links-heading" className="mb-5 text-2xl font-bold tracking-tight text-fc-fg">
            Wichtige Links
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Offizielle Fanclubs',
                description: 'Liste & Kontakte auf fc-erzgebirge.de',
                href: 'https://www.fc-erzgebirge.de/fans/offizielle-fanclubs',
                icon: Users,
                accent: 'violet' as const,
              },
              {
                title: 'Fanbeauftragter',
                description: 'Kontakt & Infos',
                href: 'https://www.fc-erzgebirge.de/fans/fanbeauftragter',
                icon: Shield,
                accent: 'sky' as const,
              },
              {
                title: 'Fanprojekt',
                description: 'Angebote & Termine',
                href: 'https://www.fc-erzgebirge.de/fans/fanprojekt',
                icon: Users,
                accent: 'emerald' as const,
              },
              {
                title: 'Barrierefreiheit',
                description: 'Infos & Services',
                href: 'https://www.fc-erzgebirge.de/fans/team-barrierefrei',
                icon: Shield,
                accent: 'purple' as const,
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={focusRing}
                aria-label={`${item.title} (öffnet in neuem Tab)`}
              >
                <Card className={cardHover}>
                  <CardContent className="flex items-center gap-3 pt-6">
                    <AccentIcon icon={item.icon} accent={item.accent} />
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1 font-medium text-fc-fg">
                        {item.title}
                        <ExternalLink className="h-3.5 w-3.5 text-fc-fg/45" aria-hidden="true" />
                      </p>
                      <p className="text-sm leading-relaxed text-fc-fg/65">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}