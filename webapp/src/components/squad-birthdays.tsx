import { Cake, CalendarDays, PartyPopper } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { cn } from '@kumpelapp/utils'
import { getUpcomingSquadBirthdays, type SquadBirthdayPlayer } from '@/lib/squad-birthdays'

const positionLabel: Record<string, string> = {
  GOALKEEPER: 'Torwart',
  DEFENDER: 'Abwehr',
  MIDFIELDER: 'Mittelfeld',
  FORWARD: 'Sturm',
}

function playerMeta(position: string | null, number: number | null) {
  const parts: string[] = []
  if (number != null) parts.push(`#${number}`)
  if (position && positionLabel[position]) parts.push(positionLabel[position])
  return parts.join(' · ')
}

function BirthdayRow({
  item,
  highlight = false,
}: {
  item: ReturnType<typeof getUpcomingSquadBirthdays>['upcoming'][number] | ReturnType<typeof getUpcomingSquadBirthdays>['today'][number]
  highlight?: boolean
}) {
  const meta = playerMeta(item.player.position, item.player.number)
  return (
    <li
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5',
        highlight
          ? 'border-fc-violet/30 bg-fc-violet/[0.12]'
          : 'border-fc-border/60 bg-fc-bg/20',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-fc-fg">{item.player.name}</p>
        <p className="mt-0.5 text-xs text-fc-fg/60">
          {meta || 'Kader'}
          {item.turningAge != null ? ` · wird ${item.turningAge}` : ''}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums text-fc-fg">{item.nextBirthdayLabel}</p>
        <p className={cn('text-xs', highlight ? 'font-medium text-fc-violet-light' : 'text-fc-fg/55')}>
          {item.isToday ? 'Heute' : item.daysUntil === 1 ? 'Morgen' : `in ${item.daysUntil} Tagen`}
        </p>
      </div>
    </li>
  )
}

export function SquadBirthdaysCard({ players }: { players: SquadBirthdayPlayer[] }) {
  const { today, upcoming } = getUpcomingSquadBirthdays(players, new Date(), 6)
  if (today.length === 0 && upcoming.length === 0) return null

  return (
    <Card className="border-fc-violet/20 bg-gradient-to-b from-fc-violet/[0.06] to-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cake className="h-5 w-5 text-fc-violet" aria-hidden="true" />
          Geburtstage im Kader
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {today.length > 0 ? (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fc-violet-light">
              <PartyPopper className="h-3.5 w-3.5" aria-hidden="true" />
              Heute feiern
            </p>
            <ul className="space-y-2">
              {today.map((item) => (
                <BirthdayRow key={item.player.id} item={item} highlight />
              ))}
            </ul>
          </div>
        ) : null}

        {upcoming.length > 0 ? (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fc-fg/55">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Nächste Geburtstage
            </p>
            <ul className="space-y-2">
              {upcoming.map((item) => (
                <BirthdayRow key={item.player.id} item={item} />
              ))}
            </ul>
          </div>
        ) : null}

        {today.length === 0 ? (
          <p className="text-xs text-fc-fg/55">Basierend auf hinterlegten Geburtsdaten im aktuellen Kader.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
