'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge, Button, Card, CardContent } from '@kumpelapp/ui'
import { formatDate, formatKickoff } from '@kumpelapp/utils'
import { Filter, Loader2, Trash2 } from 'lucide-react'

type RideRow = {
  id: string
  kind: 'OFFER' | 'REQUEST'
  fromPlace: string
  departAt: string
  seats: number | null
  note: string | null
  user: { id?: string; name: string | null } | null
  match: { homeTeam: { shortName: string | null; name: string }; awayTeam: { shortName: string | null; name: string } } | null
  userId?: string
}

export function MitfahrtenClient({ rides, currentUserId }: { rides: RideRow[]; currentUserId: string | null }) {
  const router = useRouter()
  const [items, setItems] = useState(rides)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [onlyMine, setOnlyMine] = useState(false)

  const visibleItems = useMemo(() => {
    if (!onlyMine || !currentUserId) return items
    return items.filter((r) => r.userId === currentUserId || r.user?.id === currentUserId)
  }, [items, onlyMine, currentUserId])

  async function remove(id: string) {
    setError(null)
    setPendingId(id)
    try {
      const res = await fetch(`/api/v1/rides/${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error?.message || 'Löschen fehlgeschlagen')
      setItems((prev) => prev.filter((r) => r.id !== id))
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Eintrag konnte nicht gelöscht werden.')
    } finally {
      setPendingId(null)
    }
  }

  if (items.length === 0) {
    return <Card className="border-fc-border/70"><CardContent className="py-6 text-fc-fg/70">Noch keine passenden Einträge.</CardContent></Card>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-fc-fg/65">{visibleItems.length} {visibleItems.length === 1 ? 'Eintrag' : 'Einträge'}{onlyMine ? ' (nur meine)' : ''}</p>
        {currentUserId ? (
          <Button
            type="button"
            variant={onlyMine ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyMine((v) => !v)}
            className="gap-1.5"
            aria-pressed={onlyMine}
          >
            <Filter className="h-4 w-4" aria-hidden="true" /> Nur meine
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-fc-loss" role="alert">{error}</p> : null}
      {visibleItems.length === 0 ? (
        <Card className="border-fc-border/70"><CardContent className="py-6 text-fc-fg/70">Keine eigenen Einträge in dieser Ansicht.</CardContent></Card>
      ) : null}
      {visibleItems.map((r) => {
        const isMine = !!currentUserId && (r.userId === currentUserId || r.user?.id === currentUserId)
        const busy = pendingId === r.id
        return (
          <Card key={r.id} className="border-fc-border/70">
            <CardContent className="py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={r.kind === 'OFFER' ? 'secondary' : 'outline'}>{r.kind === 'OFFER' ? 'Angebot' : 'Gesuch'}</Badge>
                    <span className="font-medium text-fc-fg">{r.fromPlace}</span>
                    <span className="text-sm text-fc-fg/60">· {formatDate(r.departAt)} {formatKickoff(r.departAt)} Uhr</span>
                    {isMine ? <Badge className="border-fc-violet/30 bg-fc-violet/10 text-fc-violet-light">Mein Eintrag</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-fc-fg/70">
                    {r.match ? `${r.match.homeTeam.shortName || r.match.homeTeam.name} – ${r.match.awayTeam.shortName || r.match.awayTeam.name}` : 'Spiel'}
                    {' · '}{r.seats ? `${r.seats} Plätze` : 'Plätze n/a'} · von {r.user?.name || 'Fan'}
                  </p>
                  {r.note ? <p className="mt-1 text-sm text-fc-fg/60">{r.note}</p> : null}
                </div>
                {isMine ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => remove(r.id)} disabled={busy} className="gap-1.5 shrink-0">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                    Löschen
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
