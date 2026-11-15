'use client'

import { useMemo, useState } from 'react'
import type { PlayerDto } from '@kumpelapp/api-contracts'
import { Badge, Card, Input } from '@kumpelapp/ui'
import { cn } from '@kumpelapp/utils'
import { Cake, Goal, Search, SearchX, Shield, Star, User, X } from 'lucide-react'

const positionConfig = {
  GOALKEEPER: {
    label: 'Torwart',
    icon: Shield,
    chip: 'bg-fc-violet/12 text-fc-violet ring-1 ring-inset ring-fc-violet/20',
    badge: 'border-fc-violet/25 bg-fc-violet/10 text-fc-violet-light',
  },
  DEFENDER: {
    label: 'Abwehr',
    icon: Shield,
    chip: 'bg-sky-500/12 text-sky-300 ring-1 ring-inset ring-sky-400/20',
    badge: 'border-sky-400/25 bg-sky-500/10 text-sky-200',
  },
  MIDFIELDER: {
    label: 'Mittelfeld',
    icon: Goal,
    chip: 'bg-emerald-500/12 text-emerald-300 ring-1 ring-inset ring-emerald-400/20',
    badge: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200',
  },
  FORWARD: {
    label: 'Sturm',
    icon: Goal,
    chip: 'bg-rose-500/12 text-rose-300 ring-1 ring-inset ring-rose-400/20',
    badge: 'border-rose-400/25 bg-rose-500/10 text-rose-200',
  },
} as const

type PositionKey = keyof typeof positionConfig

function formatBirthInfo(birthDate: string | null) {
  if (!birthDate) return null
  const d = new Date(birthDate)
  if (Number.isNaN(d.getTime())) return null
  const birth = /^\d{4}-\d{2}-\d{2}/.test(birthDate)
    ? new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    : new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1
  const label = `${String(birth.getDate()).padStart(2, '0')}.${String(birth.getMonth() + 1).padStart(2, '0')}.${birth.getFullYear()}`
  return age >= 0 && age < 120 ? `${label} (${age})` : label
}

function PlayerCard({ player }: { player: PlayerDto }) {
  const config = positionConfig[player.position as PositionKey] ?? positionConfig.MIDFIELDER
  const Icon = config.icon
  const birthInfo = formatBirthInfo(player.birthDate)

  return (
    <Card className="group flex flex-col items-center gap-4 p-4 transition-[border-color,box-shadow,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/40 hover:shadow-lg hover:shadow-fc-violet/5 sm:flex-row sm:items-center">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fc-surface ring-1 ring-fc-border/70">
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={`Foto von ${player.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={cn('flex h-full w-full items-center justify-center', config.chip)}>
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="mb-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="text-lg font-bold leading-tight text-fc-fg">{player.name}</span>
          {player.number != null ? (
            <Badge variant="secondary" className="tabular-nums text-xs">
              #{player.number}
            </Badge>
          ) : null}
          {player.isLegend ? (
            <Badge variant="outline" className="border-amber-400/30 bg-amber-500/10 text-amber-200">
              Legende
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-fc-fg/65 sm:justify-start">
          <Badge variant="outline" className={cn('font-medium', config.badge)}>
            <Icon className="mr-1 h-3 w-3" aria-hidden="true" />
            {config.label}
          </Badge>
          {player.nationality ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-fc-bg/35 px-2 py-0.5">
              <User className="h-3 w-3" aria-hidden="true" />
              {player.nationality}
            </span>
          ) : null}
          {birthInfo ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-fc-bg/35 px-2 py-0.5">
              <Cake className="h-3 w-3" aria-hidden="true" />
              {birthInfo}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

export function KaderExplorer({ players }: { players: PlayerDto[] }) {
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState<PositionKey | 'all'>('all')
  const [legendsOnly, setLegendsOnly] = useState(false)

  const normalized = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (position !== 'all' && p.position !== position) return false
      if (legendsOnly && !p.isLegend) return false
      if (!normalized) return true
      const haystack = [p.name, p.nationality ?? '', p.number != null ? String(p.number) : '', positionConfig[p.position as PositionKey]?.label ?? '']
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    })
  }, [players, position, legendsOnly, normalized])

  const grouped = (['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'] as const).map((pos) => ({
    position: pos,
    players: filtered.filter((p) => p.position === pos),
  }))

  const hasFilters = position !== 'all' || legendsOnly || normalized.length > 0
  const legendCount = players.filter((p) => p.isLegend).length

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-fc-border/70 bg-fc-surface/50 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fc-fg/80">Spieler suchen</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45" aria-hidden="true" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, Nummer oder Nation"
                className="pl-9 pr-9"
                aria-label="Spieler suchen"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-fc-fg/55 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                  aria-label="Suche zurücksetzen"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </label>

          <div className="flex flex-wrap items-end gap-2">
            {legendCount > 0 ? (
              <button
                type="button"
                onClick={() => setLegendsOnly((v) => !v)}
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface',
                  legendsOnly
                    ? 'border-amber-400/35 bg-amber-500/15 text-amber-100'
                    : 'border-fc-border bg-fc-bg/40 text-fc-fg/80 hover:border-fc-violet/35 hover:bg-fc-violet/10'
                )}
                aria-pressed={legendsOnly}
              >
                <Star className="h-4 w-4" aria-hidden="true" />
                Nur Legenden
              </button>
            ) : null}
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setPosition('all')
                  setLegendsOnly(false)
                }}
                className="inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium text-fc-fg/70 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
              >
                Filter zurücksetzen
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Position filtern">
          <button
            type="button"
            onClick={() => setPosition('all')}
            className={cn(
              'inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface',
              position === 'all' ? 'bg-fc-violet text-white' : 'border border-fc-border bg-fc-bg/40 text-fc-fg/80 hover:bg-fc-violet/10',
            )}
            aria-pressed={position === 'all'}
          >
            Alle Positionen
          </button>
          {(Object.keys(positionConfig) as PositionKey[]).map((pos) => {
            const cfg = positionConfig[pos]
            const Icon = cfg.icon
            const count = players.filter((p) => p.position === pos).length
            return (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(pos)}
                className={cn(
                  'inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface',
                  position === pos ? 'bg-fc-violet text-white' : 'border border-fc-border bg-fc-bg/40 text-fc-fg/80 hover:bg-fc-violet/10',
                )}
                aria-pressed={position === pos}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {cfg.label}
                <span className={cn('text-xs', position === pos ? 'text-white/80' : 'text-fc-fg/50')}>{count}</span>
              </button>
            )
          })}
        </div>

        <p className="mt-3 text-sm text-fc-fg/60" aria-live="polite">
          {filtered.length} von {players.length} {players.length === 1 ? 'Spieler' : 'Spielern'} angezeigt
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
          <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
          <p className="text-base font-medium text-fc-fg">Keine Spieler gefunden</p>
          <p className="max-w-md text-sm text-fc-fg/60">Passe Suche oder Filter an, um Ergebnisse zu sehen.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ position: pos, players: list }) => {
            const config = positionConfig[pos]
            const Icon = config.icon
            return (
              <section key={pos} aria-labelledby={`${pos}-heading`} className={list.length === 0 ? 'hidden' : undefined}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', config.chip)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id={`${pos}-heading`} className="text-xl font-bold tracking-tight text-fc-fg sm:text-2xl">
                      {config.label}
                    </h2>
                    <p className="text-sm text-fc-fg/55">
                      {list.length} {list.length === 1 ? 'Spieler' : 'Spieler'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
