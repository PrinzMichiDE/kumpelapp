import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Users, Building, MapPin, MessageSquare, FileText, Shield, Building2, Trophy, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@kumpelapp/utils'

const stats = [
  { label: 'Teams', value: '14', icon: Users, href: '/admin/teams', color: 'text-fc-violet' },
  { label: 'Stadien', value: '13', icon: MapPin, href: '/admin/venues', color: 'text-blue-500' },
  { label: 'Fanclubs', value: '12', icon: Users, href: '/admin/fanclubs', color: 'text-green-500' },
  { label: 'Kontakte', value: '6', icon: MessageSquare, href: '/admin/contacts', color: 'text-orange-500' },
  { label: 'Links', value: '20+', icon: FileText, href: '/admin/links', color: 'text-purple-500' },
  { label: 'Titel', value: '4', icon: Trophy, href: '/admin/tradition', color: 'text-yellow-500' },
  { label: 'Abteilungen', value: '8', icon: Building2, href: '/admin/departments', color: 'text-red-500' },
  { label: 'Legenden', value: '5', icon: Shield, href: '/admin/tradition', color: 'text-pink-500' },
]

const quickActions = [
  { label: 'Neues Team anlegen', href: '/admin/teams/new', icon: Users },
  { label: 'Stadion hinzufügen', href: '/admin/venues/new', icon: MapPin },
  { label: 'Fanclub eintragen', href: '/admin/fanclubs/new', icon: Users },
  { label: 'Link hinzufügen', href: '/admin/links/new', icon: FileText },
  { label: 'Titel eintragen', href: '/admin/tradition/titles/new', icon: Trophy },
  { label: 'Quiz-Frage erstellen', href: '/admin/tradition/quiz/new', icon: Shield },
]

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fc-fg">Admin Dashboard</h1>
        <p className="mt-2 text-fc-fg/70">Übersicht und Verwaltung aller Inhalte</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card className="transition-all hover:shadow-lg hover:border-fc-violet/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-fc-fg/60">{stat.label}</p>
                    <p className="text-3xl font-bold text-fc-fg mt-1">{stat.value}</p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.color + ' bg-opacity-10 group-hover:bg-opacity-20 transition-colors')}>
                    <stat.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold text-fc-fg mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:border-fc-violet/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-12 h-12 rounded-lg bg-fc-violet/10 flex items-center justify-center group-hover:bg-fc-violet group-hover:text-white transition-colors')}>
                        <action.icon className="h-6 w-6 text-fc-violet group-hover:text-white transition-colors" aria-hidden="true" />
                      </div>
                      <span className="font-medium text-fc-fg group-hover:text-fc-violet transition-colors">{action.label}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-fc-fg mb-4">Letzte Aktivitäten</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-fc-surface border border-fc-border">
                  <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-fc-violet" />
                  </div>
                  <div>
                    <p className="font-medium text-fc-fg">Neues Team angelegt</p>
                    <p className="text-sm text-fc-fg/60">FC Erzgebirge Aue U15 • vor 2 Stunden</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-fc-surface border border-fc-border">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-fc-fg">Stadion aktualisiert</p>
                    <p className="text-sm text-fc-fg/60">Preußenstadion Stahnsdorf • vor 5 Stunden</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-fc-surface border border-fc-border">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-fc-fg">Fanclub hinzugefügt</p>
                    <p className="text-sm text-fc-fg/60">Veilchenfreunde Leipzig • vor 1 Tag</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-fc-surface border border-fc-border">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-fc-fg">Quiz-Frage erstellt</p>
                    <p className="text-sm text-fc-fg/60">"Wie oft gewann Aue den FDGB-Pokal?" • vor 2 Tagen</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}