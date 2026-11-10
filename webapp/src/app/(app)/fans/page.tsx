import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Baby, ChevronRight, ExternalLink, Heart, MapPin, Phone, SearchX, Shield, Users, Volume2, Building2, Mail, Globe, type LucideIcon } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

export const dynamic = 'force-dynamic'

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

const fallbackFanclubs = [
  { name: 'Veilchen Aue', city: 'Aue' },
  { name: 'Schachtfreunde', city: 'Aue' },
  { name: 'Lila-Weiße Herzen', city: 'Chemnitz' },
]

const fallbackLinks = [
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
]

function AccentIcon({
  icon: Icon,
  accent,
}: {
  icon: LucideIcon
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

function accentForCategory(category: string): keyof typeof accentStyles {
  const c = category.toLowerCase()
  if (c.includes('fan')) return 'violet'
  if (c.includes('kontakt') || c.includes('support')) return 'sky'
  if (c.includes('barriere')) return 'purple'
  if (c.includes('kids') || c.includes('nachwuchs')) return 'pink'
  return 'emerald'
}

export default async function FansPage() {
  let fanclubs: { id: string; name: string; city: string | null; lat: number | null; lng: number | null; contactUrl: string | null; isOfficial: boolean }[] = []
  let contacts: { id: string; role: string; name: string | null; email: string | null; phone: string | null; url: string | null }[] = []
  let departments: { id: string; name: string; description: string | null; contactUrl: string | null }[] = []
  let links: { id: string; label: string; url: string; description: string | null; category: string }[] = []
  let loadError = false

  try {
    const [fcRows, contactRows, deptRows, linkRows] = await Promise.all([
      prisma.fanClub.findMany({ orderBy: [{ isOfficial: 'desc' }, { city: 'asc' }, { name: 'asc' }], take: 50 }),
      prisma.clubContact.findMany({ orderBy: { role: 'asc' }, take: 20 }),
      prisma.department.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], take: 20 }),
      prisma.staticLink.findMany({
        where: { category: { in: ['fans', 'fan', 'FANS', 'community', 'kontakt', 'links'] } },
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
        take: 12,
      }),
    ])
    fanclubs = fcRows.map((f) => ({ id: f.id, name: f.name, city: f.city, lat: f.lat, lng: f.lng, contactUrl: f.contactUrl, isOfficial: f.isOfficial }))
    contacts = contactRows.map((c) => ({ id: c.id, role: c.role, name: c.name, email: c.email, phone: c.phone, url: c.url }))
    departments = deptRows.map((d) => ({ id: d.id, name: d.name, description: d.description, contactUrl: d.contactUrl }))
    links = linkRows.map((l) => ({ id: l.id, label: l.label, url: l.url, description: l.description, category: l.category }))
  } catch (e) {
    console.error('Fans page load error', e)
    loadError = true
  }

  const displayFanclubs = fanclubs.length ? fanclubs.slice(0, 6) : []
  const officialCount = fanclubs.filter((f) => f.isOfficial).length
  const cityCount = new Set(fanclubs.map((f) => f.city).filter(Boolean)).size

  const navCards: { href: string; label: string; icon: LucideIcon; accent: keyof typeof accentStyles; desc: string; bullets: string[] }[] = [
    { href: '/fans/fanclubs', label: 'Offizielle Fanclubs', icon: Users, accent: 'violet', desc: 'Fanclubs, Standorte und Kontakte', bullets: ['Fanclub-Übersicht', 'Regionale Gruppen', 'Gemeinsam zu Auswärtsspielen'] },
    { href: '/fans/fanbeauftragter', label: 'Fanbeauftragter', icon: Shield, accent: 'sky', desc: 'Dein direkter Draht zum Verein', bullets: ['Ansprechpartner für Fanbelange', 'Vermittlung bei Konflikten', 'Fanclub-Unterstützung'] },
    { href: '/fans/fanprojekt', label: 'Fanprojekt Aue', icon: Users, accent: 'emerald', desc: 'Sozialpädagogische Fanarbeit', bullets: ['Begleitung zu Auswärtsspielen', 'Beratung & Unterstützung', 'Präventionsarbeit'] },
    { href: '/fans/barrierefreiheit', label: 'Team Barrierefrei', icon: Shield, accent: 'purple', desc: 'Inklusion im Stadion', bullets: ['Rollstuhlplätze & Begleitung', 'Audioguide für Sehbehinderte', 'Induktionsschleifen'] },
    { href: '/fans/steigerfunk', label: 'Steigerfunk', icon: Volume2, accent: 'orange', desc: 'Das Fanradio live am Spieltag', bullets: ['Live-Kommentierung', 'Interviews & Hintergründe', 'Auch in der App hörbar'] },
    { href: '/fans/kidsclub', label: 'KidsClub', icon: Baby, accent: 'pink', desc: 'Für die jüngsten Veilchen-Fans', bullets: ['Kindergeburtstage im Stadion', 'Exklusive Aktionen', 'Maskottchen-Besuche'] },
  ]

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Fans &amp; Fanclubs</h1>
          <p className="mt-2 text-fc-fg/70">Die Kumpel-Gemeinschaft – organisiert, vernetzt, leidenschaftlich</p>
          {fanclubs.length > 0 && (
            <p className="mt-2 text-sm text-fc-fg/55">
              {fanclubs.length} Fanclubs{officialCount ? ` • ${officialCount} offiziell` : ''}{cityCount ? ` • ${cityCount} Städte` : ''}
            </p>
          )}
        </div>

        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {navCards.map((card) => (
            <Link key={card.href} href={card.href} className={focusRing} aria-label={card.label}>
              <Card className={cardHover}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <AccentIcon icon={card.icon} accent={card.accent} />
                    <CardTitle className="text-lg">{card.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-4 text-sm leading-relaxed text-fc-fg/70">{card.desc}</p>
                  <ul className="space-y-2 text-sm text-fc-fg/70">
                    {card.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Heart className="mt-0.5 h-4 w-4 shrink-0 text-fc-violet/70" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <section className="mb-12" aria-labelledby="fanclub-list-heading">
          <h2 id="fanclub-list-heading" className="mb-5 text-2xl font-bold tracking-tight text-fc-fg">Fanclubs aus der Datenbank</h2>
          {displayFanclubs.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayFanclubs.map((fc) => (
                <Card key={fc.id} className="transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 text-fc-violet ring-1 ring-inset ring-fc-violet/20">
                        <Users className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-fc-fg">{fc.name}</p>
                          {fc.isOfficial && <span className="rounded-full bg-fc-violet/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fc-violet">Offiziell</span>}
                        </div>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-fc-fg/65">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {fc.city || 'Ort unbekannt'}
                        </p>
                        {fc.contactUrl ? (
                          <a href={fc.contactUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface rounded">
                            Kontakt <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
              <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
              <p className="text-base font-medium text-fc-fg">Fanclubs konnten nicht geladen werden</p>
              <p className="max-w-md text-sm text-fc-fg/60">Bitte später erneut versuchen oder Datenbankverbindung prüfen.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-10 text-center text-fc-fg/70">
                <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
                <p className="text-base font-medium text-fc-fg">Noch keine Fanclubs synchronisiert</p>
                <p className="max-w-md text-sm text-fc-fg/60">Synchronisiere Fanclub-Daten im Admin-Bereich, um offizielle Fanclubs und Standorte anzuzeigen.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {fallbackFanclubs.map((fc) => (
                  <Card key={fc.name} className="opacity-80">
                    <CardContent className="pt-6">
                      <p className="font-semibold text-fc-fg">{fc.name}</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-fc-fg/65"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{fc.city}</p>
                      <p className="mt-2 text-xs text-fc-fg/45">Beispiel (nicht aus Datenbank)</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </section>

        {(contacts.length > 0 || departments.length > 0) && (
          <section className="mb-12" aria-labelledby="contacts-heading">
            <h2 id="contacts-heading" className="mb-5 text-2xl font-bold tracking-tight text-fc-fg">Kontakte & Abteilungen</h2>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {contacts.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg"><Phone className="h-5 w-5 text-fc-violet" aria-hidden="true" />Ansprechpartner</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {contacts.map((c) => (
                        <li key={c.id} className="rounded-lg border border-fc-border/60 bg-fc-bg/30 p-3">
                          <p className="font-medium text-fc-fg">{c.role}{c.name ? ` – ${c.name}` : ''}</p>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-fc-fg/65">
                            {c.email && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-fc-violet"><Mail className="h-3.5 w-3.5" aria-hidden="true" />{c.email}</a>}
                            {c.phone && <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-fc-violet"><Phone className="h-3.5 w-3.5" aria-hidden="true" />{c.phone}</a>}
                            {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-fc-violet"><Globe className="h-3.5 w-3.5" aria-hidden="true" />Website</a>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {departments.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5 text-fc-violet" aria-hidden="true" />Abteilungen & Bereiche</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {departments.map((d) => (
                        <li key={d.id} className="rounded-lg border border-fc-border/60 bg-fc-bg/30 p-3">
                          <p className="font-medium text-fc-fg">{d.name}</p>
                          {d.description && <p className="mt-1 text-sm text-fc-fg/65">{d.description}</p>}
                          {d.contactUrl && <a href={d.contactUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />Mehr Infos</a>}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        )}

        <section className="mb-12" aria-labelledby="fanclub-map-heading">
          <h2 id="fanclub-map-heading" className="mb-5 text-2xl font-bold tracking-tight text-fc-fg">Fanclub-Karte</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex aspect-[16/9] min-h-[220px] items-center justify-center border-b border-fc-border/70 bg-[radial-gradient(circle_at_top,_rgba(124,63,191,0.12),_transparent_55%),linear-gradient(180deg,_rgba(26,19,37,0.9),_rgba(15,10,20,1))]">
                <div className="max-w-md p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-fc-violet/12 ring-1 ring-fc-violet/20">
                    <MapPin className="h-7 w-7 text-fc-violet" aria-hidden="true" />
                  </div>
                  <p className="text-base font-medium text-fc-fg">Interaktive Karte der Fanclubs</p>
                  <p className="mt-1 text-sm text-fc-fg/60">
                    {fanclubs.length
                      ? `${fanclubs.length} Fanclubs${fanclubs.filter((f) => f.lat != null && f.lng != null).length ? `, ${fanclubs.filter((f) => f.lat != null && f.lng != null).length} mit Standortdaten` : ''} in der Datenbank.`
                      : 'Entdecke Fanclubs in deiner Nähe und öffne Details.'}
                  </p>
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
          <h2 id="important-links-heading" className="mb-5 text-2xl font-bold tracking-tight text-fc-fg">Wichtige Links</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {links.length
              ? links.map((l) => (
                  <Link
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={focusRing}
                    aria-label={`${l.label} (öffnet in neuem Tab)`}
                  >
                    <Card className={cardHover}>
                      <CardContent className="flex items-center gap-3 pt-6">
                        <AccentIcon icon={ExternalLink} accent={accentForCategory(l.category)} />
                        <div className="min-w-0">
                          <p className="inline-flex items-center gap-1 font-medium text-fc-fg">
                            {l.label}
                            <ExternalLink className="h-3.5 w-3.5 text-fc-fg/45" aria-hidden="true" />
                          </p>
                          <p className="text-sm leading-relaxed text-fc-fg/65">{l.description || l.category}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              : fallbackLinks.map((item) => (
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
