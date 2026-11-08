import { Card, CardContent } from '@kumpelapp/ui'
import { Building2, FileText, MapPin, MessageSquare, Shield, Trophy, Users } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@kumpelapp/utils'

const accent = {
  violet: 'bg-fc-violet/12 text-fc-violet ring-fc-violet/20',
  blue: 'bg-sky-500/12 text-sky-300 ring-sky-400/20',
  green: 'bg-emerald-500/12 text-emerald-300 ring-emerald-400/20',
  orange: 'bg-orange-500/12 text-orange-300 ring-orange-400/20',
  purple: 'bg-purple-500/12 text-purple-300 ring-purple-400/20',
  yellow: 'bg-fc-draw/12 text-fc-draw ring-fc-draw/20',
  red: 'bg-fc-loss/12 text-fc-loss ring-fc-loss/20',
  pink: 'bg-pink-500/12 text-pink-300 ring-pink-400/20',
} as const

const stats = [
  { label: 'Teams', value: '14', icon: Users, href: '/admin/teams', tone: 'violet' as const },
  { label: 'Stadien', value: '13', icon: MapPin, href: '/admin/venues', tone: 'blue' as const },
  { label: 'Fanclubs', value: '12', icon: Users, href: '/admin/fanclubs', tone: 'green' as const },
  { label: 'Kontakte', value: '6', icon: MessageSquare, href: '/admin/contacts', tone: 'orange' as const },
  { label: 'Links', value: '20+', icon: FileText, href: '/admin/links', tone: 'purple' as const },
  { label: 'Titel', value: '4', icon: Trophy, href: '/admin/tradition', tone: 'yellow' as const },
  { label: 'Abteilungen', value: '8', icon: Building2, href: '/admin/departments', tone: 'red' as const },
  { label: 'Legenden', value: '5', icon: Shield, href: '/admin/tradition', tone: 'pink' as const },
]

const quickActions = [
  { label: 'Neues Team anlegen', href: '/admin/teams/new', icon: Users },
  { label: 'Stadion hinzufügen', href: '/admin/venues/new', icon: MapPin },
  { label: 'Fanclub eintragen', href: '/admin/fanclubs/new', icon: Users },
  { label: 'Link hinzufügen', href: '/admin/links/new', icon: FileText },
  { label: 'Titel eintragen', href: '/admin/tradition/titles/new', icon: Trophy },
  { label: 'Quiz-Frage erstellen', href: '/admin/tradition/quiz/new', icon: Shield },
]

const activities = [
  {
    title: 'Neues Team angelegt',
    detail: 'FC Erzgebirge Aue U15 • vor 2 Stunden',
    icon: Users,
    tone: 'violet' as const,
  },
  {
    title: 'Stadion aktualisiert',
    detail: 'Preußenstadion Stahnsdorf • vor 5 Stunden',
    icon: MapPin,
    tone: 'blue' as const,
  },
  {
    title: 'Fanclub hinzugefügt',
    detail: 'Veilchenfreunde Leipzig • vor 1 Tag',
    icon: Users,
    tone: 'green' as const,
  },
  {
    title: 'Quiz-Frage erstellt',
    detail: '"Wie oft gewann Aue den FDGB-Pokal?" • vor 2 Tagen',
    icon: Shield,
    tone: 'purple' as const,
  },
]

const cardLink =
  'group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg'

const interactiveCard =
  'h-full transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:border-fc-violet/45 group-hover:shadow-lg group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-0.5 group-focus-visible:border-fc-violet/45'

export default function AdminDashboardPage() {
  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-fc-fg">Admin Dashboard</h1>
        <p className="mt-2 text-fc-fg/70">Übersicht und Verwaltung aller Inhalte</p>
      </div>

      <section aria-labelledby="admin-stats-heading" className="mb-8">
        <h2 id="admin-stats-heading" className="sr-only">
          Kennzahlen
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.label} href={stat.href} className={cardLink} aria-label={`${stat.label}: ${stat.value}`}>
                <Card className={interactiveCard}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-fc-fg/65">{stat.label}</p>
                        <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-fc-fg">{stat.value}</p>
                      </div>
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-colors group-hover:bg-fc-violet group-hover:text-white group-hover:ring-fc-violet/30 group-focus-visible:bg-fc-violet group-focus-visible:text-white',
                          accent[stat.tone]
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="admin-quick-actions-heading">
          <h2 id="admin-quick-actions-heading" className="mb-4 text-xl font-bold tracking-tight text-fc-fg">
            Schnellzugriff
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.label} href={action.href} className={cardLink} aria-label={action.label}>
                  <Card className={interactiveCard}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 text-fc-violet ring-1 ring-inset ring-fc-violet/20 transition-colors group-hover:bg-fc-violet group-hover:text-white group-hover:ring-fc-violet/30 group-focus-visible:bg-fc-violet group-focus-visible:text-white">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="font-medium leading-snug text-fc-fg transition-colors group-hover:text-fc-violet group-focus-visible:text-fc-violet">
                        {action.label}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="admin-activity-heading">
          <h2 id="admin-activity-heading" className="mb-4 text-xl font-bold tracking-tight text-fc-fg">
            Letzte Aktivitäten
          </h2>
          <Card className="border-fc-border/80">
            <CardContent className="p-0">
              <ul className="divide-y divide-fc-border/60">
                {activities.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={`${item.title}-${item.detail}`} className="flex items-start gap-3 p-4 transition-colors hover:bg-fc-bg/20">
                      <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset', accent[item.tone])}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium leading-snug text-fc-fg">{item.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-fc-fg/65">{item.detail}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}