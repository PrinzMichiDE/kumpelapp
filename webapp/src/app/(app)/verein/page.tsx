import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { BookOpen, Building, Building2, ChevronRight, ExternalLink, Globe, GraduationCap, Heart, Mail, MapPin, Phone, SearchX, Shield, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

export const dynamic = 'force-dynamic'

const focusRing =
  'rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg'

function SectionCard({
  title,
  icon: Icon,
  children,
  href,
  external,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  href?: string
  external?: boolean
}) {
  const content = (
    <Card
      className={cn(
        'group h-full transition-[transform,border-color,box-shadow] duration-200',
        href &&
          'group-hover:-translate-y-0.5 group-hover:border-fc-violet/45 group-hover:shadow-lg group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-0.5 group-focus-visible:border-fc-violet/45 group-focus-visible:shadow-lg'
      )}
    >
      <CardHeader className="pb-3">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/15 transition-[background-color,color,box-shadow] duration-200 group-hover:bg-fc-violet group-hover:shadow-sm group-hover:shadow-fc-violet/20 group-focus-visible:bg-fc-violet">
            <Icon
              className="h-5 w-5 text-fc-violet transition-colors duration-200 group-hover:text-white group-focus-visible:text-white"
              aria-hidden="true"
            />
          </div>
          <CardTitle className="text-lg leading-tight">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm leading-relaxed text-fc-fg/70">{children}</div>
        {href ? (
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-fc-violet transition-colors group-hover:text-fc-violet-light group-focus-visible:text-fc-violet-light">
            {external ? (
              <>
                Zur Website
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">(öffnet in neuem Tab)</span>
              </>
            ) : (
              <>
                Mehr erfahren
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )

  if (!href) return content

  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn('group block', focusRing)}
      aria-label={`${title}${external ? ' (öffnet in neuem Tab)' : ''}`}
    >
      {content}
    </Link>
  )
}

const fallbackContacts = [
  { title: 'Fanbeauftragter', description: 'Ansprechpartner für Fans & Fanclubs', icon: Users },
  { title: 'Fanprojekt', description: 'Sozialpädagogische Begleitung', icon: Heart },
  { title: 'Team Barrierefrei', description: 'Inklusion & Barrierefreiheit', icon: Shield },
]

const fallbackLinks = [
  { title: 'Ticketshop', description: 'Offizieller Vorverkauf', href: 'https://customer59.ticketing.cloud.sap/shop?shopid=103', icon: ExternalLink },
  { title: 'Fanshop', description: 'Offizieller Merchandise', href: 'https://www.fc-erzgebirge.shop', icon: Heart },
  { title: 'Mitglied werden', description: 'Jetzt Kumpel werden', href: 'https://www.fc-erzgebirge.de/verein/mitglieder', icon: Users },
  { title: 'Stadionführungen', description: 'Blick hinter die Kulissen', href: 'https://www.fc-erzgebirge.de/verein/stadion/erzgebirgsstadion', icon: MapPin },
]

export default async function VereinPage() {
  let contacts: { id: string; role: string; name: string | null; email: string | null; phone: string | null; url: string | null; note: string | null }[] = []
  let departments: { id: string; name: string; description: string | null; contactUrl: string | null }[] = []
  let links: { id: string; label: string; url: string; description: string | null; category: string }[] = []
  let loadError = false

  try {
    const [contactRows, deptRows, linkRows] = await Promise.all([
      prisma.clubContact.findMany({ orderBy: { role: 'asc' }, take: 30 }),
      prisma.department.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], take: 30 }),
      prisma.staticLink.findMany({
        where: { category: { in: ['verein', 'Verein', 'club', 'Club', 'official', 'links', 'kontakt', 'shop', 'tickets', 'membership'] } },
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
        take: 16,
      }),
    ])
    contacts = contactRows.map((c) => ({ id: c.id, role: c.role, name: c.name, email: c.email, phone: c.phone, url: c.url, note: c.note }))
    departments = deptRows.map((d) => ({ id: d.id, name: d.name, description: d.description, contactUrl: d.contactUrl }))
    links = linkRows.map((l) => ({ id: l.id, label: l.label, url: l.url, description: l.description, category: l.category }))
  } catch (e) {
    console.error('Verein page load error', e)
    loadError = true
  }

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fc-fg">Verein</h1>
          <p className="mt-2 text-fc-fg/70">FC Erzgebirge Aue – Mehr als nur die erste Mannschaft</p>
          {(contacts.length > 0 || departments.length > 0 || links.length > 0) && (
            <p className="mt-2 text-sm text-fc-fg/55">
              {contacts.length} Kontakte • {departments.length} Abteilungen • {links.length} Links aus der Datenbank
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <SectionCard title="1. Mannschaft" icon={Shield} href="/teams/erc-erzgebirge-aue">
            <p>Regionalliga Nordost – Kader, Spiele, Statistiken</p>
          </SectionCard>
          <SectionCard title="Nachwuchs" icon={GraduationCap} href="/teams/nachwuchs">
            <p>U19, U17, U15 & weitere Jugendteams</p>
          </SectionCard>
          <SectionCard title="Traditionsteam" icon={BookOpen} href="/teams/traditionsteam">
            <p>Legenden & Ehemalige im Einsatz</p>
          </SectionCard>
          <SectionCard title="Abteilungen" icon={Building} href="/verein/abteilungen">
            <p>Weitere Sportarten im Verein</p>
          </SectionCard>
          <SectionCard title="Mitgliedschaft" icon={Users} href="/verein/mitgliedschaft">
            <p>Jetzt Mitglied werden – werde Teil der Veilchen-Familie</p>
          </SectionCard>
          <SectionCard title="Gremien & Satzung" icon={Shield} href="/verein/gremien">
            <p>Vorstand, Aufsichtsrat, Satzung & Ordnungen</p>
          </SectionCard>
        </div>

        <div className="space-y-10">
          <section aria-labelledby="contacts-heading">
            <h2 id="contacts-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">
              Kontakte &amp; Ansprechpartner
            </h2>
            {contacts.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contacts.map((c) => (
                  <Card key={c.id} className="h-full">
                    <CardContent className="pt-6">
                      <p className="font-medium text-fc-fg">{c.role}{c.name ? ` – ${c.name}` : ''}</p>
                      {c.note ? <p className="mt-1 text-sm text-fc-fg/65">{c.note}</p> : null}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-fc-fg/65">
                        {c.email && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded"><Mail className="h-3.5 w-3.5" aria-hidden="true" />{c.email}</a>}
                        {c.phone && <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded"><Phone className="h-3.5 w-3.5" aria-hidden="true" />{c.phone}</a>}
                        {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded"><Globe className="h-3.5 w-3.5" aria-hidden="true" />Website</a>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-10 text-center text-fc-fg/70">
                <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
                <p className="text-base font-medium text-fc-fg">Kontakte konnten nicht geladen werden</p>
                <p className="max-w-md text-sm text-fc-fg/60">Bitte später erneut versuchen oder Datenbankverbindung prüfen.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {fallbackContacts.map((item) => (
                  <Card key={item.title} className="h-full">
                    <CardContent className="flex items-center gap-3 pt-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/15">
                        <item.icon className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-fc-fg">{item.title}</p>
                        <p className="text-sm leading-relaxed text-fc-fg/65">{item.description}</p>
                        <p className="mt-1 text-xs text-fc-fg/45">Beispiel (nicht aus Datenbank)</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="departments-heading">
            <h2 id="departments-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">
              Abteilungen
            </h2>
            {departments.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((d) => (
                  <Card key={d.id} className="h-full transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/15">
                          <Building2 className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-fc-fg">{d.name}</p>
                          {d.description ? <p className="mt-1 text-sm leading-relaxed text-fc-fg/65">{d.description}</p> : <p className="mt-1 text-sm text-fc-fg/50">Keine Beschreibung hinterlegt</p>}
                          {d.contactUrl ? (
                            <a href={d.contactUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded">
                              Mehr Infos <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-10 text-center text-fc-fg/70">
                <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
                <p className="text-base font-medium text-fc-fg">Keine Abteilungen hinterlegt</p>
                <p className="max-w-md text-sm text-fc-fg/60">Synchronisiere Vereinsdaten im Admin-Bereich, um Abteilungen anzuzeigen.</p>
              </div>
            )}
          </section>

          <section aria-labelledby="official-links-heading">
            <h2 id="official-links-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">
              Offizielle Links
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(links.length ? links.map((l) => ({ title: l.label, description: l.description || l.category, href: l.url, icon: ExternalLink as LucideIcon })) : fallbackLinks).map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('group block', focusRing)}
                  aria-label={`${item.title} (öffnet in neuem Tab)`}
                >
                  <Card className="h-full transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:border-fc-violet/45 group-hover:shadow-lg group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-0.5 group-focus-visible:border-fc-violet/45 group-focus-visible:shadow-lg">
                    <CardContent className="flex items-center gap-3 pt-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/15 transition-[background-color,color] duration-200 group-hover:bg-fc-violet group-focus-visible:bg-fc-violet">
                        <item.icon
                          className="h-5 w-5 text-fc-violet transition-colors duration-200 group-hover:text-white group-focus-visible:text-white"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-fc-fg">{item.title}</p>
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
    </div>
  )
}
