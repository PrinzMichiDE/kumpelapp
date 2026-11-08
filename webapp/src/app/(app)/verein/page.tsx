import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Building, ChevronRight, ExternalLink, GraduationCap, Heart, MapPin, Shield, Users } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@kumpelapp/utils'

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
  icon: React.ComponentType<{ className?: string }>
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

export default function VereinPage() {
  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fc-fg">Verein</h1>
          <p className="mt-2 text-fc-fg/70">FC Erzgebirge Aue – Mehr als nur die erste Mannschaft</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <SectionCard title="1. Mannschaft" icon={Shield} href="/teams/erc-erzgebirge-aue">
            <p className="text-fc-fg/70">Regionalliga Nordost – Kader, Spiele, Statistiken</p>
          </SectionCard>
          <SectionCard title="Nachwuchs" icon={GraduationCap} href="/teams/nachwuchs">
            <p className="text-fc-fg/70">U19, U17, U15 & weitere Jugendteams</p>
          </SectionCard>
          <SectionCard title="Traditionsteam" icon={BookOpen} href="/teams/traditionsteam">
            <p className="text-fc-fg/70">Legenden & Ehemalige im Einsatz</p>
          </SectionCard>
          <SectionCard title="Abteilungen" icon={Building} href="/verein/abteilungen">
            <p className="text-fc-fg/70">Weitere Sportarten im Verein</p>
          </SectionCard>
          <SectionCard title="Mitgliedschaft" icon={Users} href="/verein/mitgliedschaft">
            <p className="text-fc-fg/70">Jetzt Mitglied werden – 9.648 Kumpels</p>
          </SectionCard>
          <SectionCard title="Gremien & Satzung" icon={Shield} href="/verein/gremien">
            <p className="text-fc-fg/70">Vorstand, Aufsichtsrat, Satzung & Ordnungen</p>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="contacts-heading">
            <h2 id="contacts-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">
              Kontakte &amp; Ansprechpartner
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Fanbeauftragter', description: 'Ansprechpartner für Fans & Fanclubs', icon: Users },
                { title: 'Fanprojekt', description: 'Sozialpädagogische Begleitung', icon: Heart },
                { title: 'Team Barrierefrei', description: 'Inklusion & Barrierefreiheit', icon: Shield },
              ].map((item) => (
                <Card key={item.title} className="h-full">
                  <CardContent className="flex items-center gap-3 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/15">
                      <item.icon className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-fc-fg">{item.title}</p>
                      <p className="text-sm leading-relaxed text-fc-fg/65">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section aria-labelledby="official-links-heading">
            <h2 id="official-links-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">
              Offizielle Links
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Ticketshop',
                  description: 'Offizieller Vorverkauf',
                  href: 'https://customer59.ticketing.cloud.sap/shop?shopid=103',
                  icon: ExternalLink,
                },
                {
                  title: 'Fanshop',
                  description: 'Offizieller Merchandise',
                  href: 'https://www.fc-erzgebirge.shop',
                  icon: Heart,
                },
                {
                  title: 'Mitglied werden',
                  description: 'Jetzt Kumpel werden',
                  href: 'https://www.fc-erzgebirge.de/verein/mitglieder',
                  icon: Users,
                },
                {
                  title: 'Stadionführungen',
                  description: 'Blick hinter die Kulissen',
                  href: 'https://www.fc-erzgebirge.de/verein/stadion/erzgebirgsstadion',
                  icon: MapPin,
                },
              ].map((item) => (
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