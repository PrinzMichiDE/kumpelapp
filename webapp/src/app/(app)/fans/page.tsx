import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { Users, MapPin, Heart, Shield, Volume2, Brain, Baby, Ticket, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@kumpelapp/utils'

const fanclubs = [
  { name: 'Veilelchen Aue', city: 'Aue', members: 120 },
  { name: 'Schachtfreunde', city: 'Aue', members: 85 },
  { name: 'Lila-Weiße Herzen', city: 'Chemnitz', members: 60 },
  { name: 'Erzgebirgsveilchen Dresden', city: 'Dresden', members: 45 },
  { name: 'Veilchenpower Berlin', city: 'Berlin', members: 70 },
  { name: 'Kumpels aus Bayern', city: 'München', members: 35 },
]

export default function FansPage() {
  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fc-fg">Fans & Fanclubs</h1>
          <p className="mt-2 text-fc-fg/70">Die Kumpel-Gemeinschaft – organisiert, vernetzt, leidenschaftlich</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/fans/fanclubs">
            <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-fc-violet" />
                  </div>
                  <CardTitle>Offizielle Fanclubs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-fc-fg/70 mb-4">12 offizielle Fanclubs mit über 400 Mitgliedern</p>
                <div className="space-y-2">
                  {fanclubs.slice(0, 3).map((fc) => (
                    <div key={fc.name} className="flex items-center justify-between py-2 border-b border-fc-border/50 last:border-0">
                      <span className="text-sm font-medium text-fc-fg">{fc.name}</span>
                      <span className="text-sm text-fc-fg/60">{fc.city} • {fc.members} Mitglieder</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fans/fanbeauftragter">
            <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle>Fanbeauftragter</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-fc-fg/70 mb-4">Dein direkter Draht zum Verein</p>
                <ul className="space-y-2 text-sm text-fc-fg/70">
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Ansprechpartner für Fanbelange</li>
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Vermittlung bei Konflikten</li>
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Fanclub-Unterstützung</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fans/fanprojekt">
            <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle>Fanprojekt Aue</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-fc-fg/70 mb-4">Sozialpädagogische Fanarbeit</p>
                <ul className="space-y-2 text-sm text-fc-fg/70">
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Begleitung zu Auswärtsspielen</li>
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Beratung & Unterstützung</li>
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Präventionsarbeit</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fans/barrierefreiheit">
            <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle>Team Barrierefrei</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-fc-fg/70 mb-4">Inklusion im Stadion</p>
                <ul className="space-y-2 text-sm text-fc-fg/70">
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Rollstuhlplätze & Begleitung</li>
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Audioguide für Sehbehinderte</li>
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Induktionsschleifen</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fans/steigerfunk">
            <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 flex items-center justify-center">
                    <Volume2 className="h-6 w-6" />
                  </div>
                  <CardTitle>Steigerfunk</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-fc-fg/70 mb-4">Das Fanradio live am Spieltag</p>
                <ul className="space-y-2 text-sm text-fc-fg/70">
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Live-Kommentierung</li>
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Interviews & Hintergründe</li>
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Auch in der App hörbar</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fans/kidsclub">
            <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300 flex items-center justify-center">
                    <Baby className="h-6 w-6" />
                  </div>
                  <CardTitle>KidsClub</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-fc-fg/70 mb-4">Für die jüngsten Veilchen-Fans</p>
                <ul className="space-y-2 text-sm text-fc-fg/70">
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Kindergeburtstage im Stadion</li>
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Exklusive Aktionen</li>
                  <li className="flex items-center gap-2"><Heart className="h-4 w-4" /> Maskottchen-Besuche</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-fc-fg mb-6">Fanclub-Karte</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="aspect-video rounded-lg bg-fc-surface border border-fc-border flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="h-12 w-12 text-fc-fg/30 mx-auto mb-4" />
                  <p className="text-fc-fg/60 mb-4">Interaktive Karte der Fanclubs</p>
                  <p className="text-sm text-fc-fg/50">Klicke auf einen Marker für Details</p>
                  <Link href="/fans/fanclubs" className="mt-4 inline-flex items-center gap-2 text-fc-violet hover:underline font-medium">
                    Zur vollständigen Karte
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-fc-fg mb-6">Wichtige Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="https://www.fc-erzgebirge.de/fans/offizielle-fanclubs" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-fc-violet" />
                    </div>
                    <div>
                      <p className="font-medium text-fc-fg">Offizielle Fanclubs</p>
                      <p className="text-sm text-fc-fg/60">Liste & Kontakte auf fc-erzgebirge.de</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="https://www.fc-erzgebirge.de/fans/fanbeauftragter" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-fc-fg">Fanbeauftragter</p>
                      <p className="text-sm text-fc-fg/60">Kontakt & Infos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="https://www.fc-erzgebirge.de/fans/fanprojekt" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-fc-fg">Fanprojekt</p>
                      <p className="text-sm text-fc-fg/60">Angebote & Termine</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="https://www.fc-erzgebirge.de/fans/team-barrierefrei" target="_blank" rel="noopener noreferrer" className="block">
              <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-fc-fg">Barrierefreiheit</p>
                      <p className="text-sm text-fc-fg/60">Infos & Services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}