import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { Building, Users, Shield, BookOpen, GraduationCap, Heart, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@kumpelapp/utils'

function SectionCard({ title, icon: Icon, children, href, external }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; href?: string; external?: boolean }) {
  return (
    <Link href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="block">
      <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50 group">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center group-hover:bg-fc-violet group-hover:text-white transition-colors">
              <Icon className="h-6 w-6 text-fc-violet group-hover:text-white transition-colors" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {children}
          {href && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-fc-violet hover:text-fc-violet-light font-medium flex items-center gap-1">
                {external ? 'Zur Website' : 'Mehr erfahren'}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          )}
        </CardContent>
      </Card>
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
          <section>
            <h2 className="text-2xl font-bold text-fc-fg mb-4">Kontakte & Ansprechpartner</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-fc-violet" />
                    </div>
                    <div>
                      <p className="font-medium text-fc-fg">Fanbeauftragter</p>
                      <p className="text-sm text-fc-fg/60">Ansprechpartner für Fans & Fanclubs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-fc-violet" />
                    </div>
                    <div>
                      <p className="font-medium text-fc-fg">Fanprojekt</p>
                      <p className="text-sm text-fc-fg/60">Sozialpädagogische Begleitung</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-fc-violet" />
                    </div>
                    <div>
                      <p className="font-medium text-fc-fg">Team Barrierefrei</p>
                      <p className="text-sm text-fc-fg/60">Inklusion & Barrierefreiheit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-fc-fg mb-4">Offizielle Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="https://customer59.ticketing.cloud.sap/shop?shopid=103" target="_blank" rel="noopener noreferrer">
                <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                        <ExternalLink className="h-6 w-6 text-fc-violet" />
                      </div>
                      <div>
                        <p className="font-medium text-fc-fg">Ticketshop</p>
                        <p className="text-sm text-fc-fg/60">Offizieller Vorverkauf</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="https://www.fc-erzgebirge.shop" target="_blank" rel="noopener noreferrer">
                <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-fc-violet" />
                      </div>
                      <div>
                        <p className="font-medium text-fc-fg">Fanshop</p>
                        <p className="text-sm text-fc-fg/60">Offizieller Merchandise</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="https://www.fc-erzgebirge.de/verein/mitglieder" target="_blank" rel="noopener noreferrer">
                <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-fc-violet" />
                      </div>
                      <div>
                        <p className="font-medium text-fc-fg">Mitglied werden</p>
                        <p className="text-sm text-fc-fg/60">Jetzt Kumpel werden</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="https://www.fc-erzgebirge.de/verein/stadion/erzgebirgsstadion" target="_blank" rel="noopener noreferrer">
                <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-fc-violet" />
                      </div>
                      <div>
                        <p className="font-medium text-fc-fg">Stadionführungen</p>
                        <p className="text-sm text-fc-fg/60">Blick hinter die Kulissen</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}