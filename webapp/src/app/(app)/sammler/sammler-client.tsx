'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge, Button, Card, CardContent } from '@kumpelapp/ui'
import { CheckCircle2, Loader2, MapPin, Plus, Trash2 } from 'lucide-react'

type VenueItem = {
  id: string
  slug: string
  name: string
  city: string
  imageUrl: string | null
}

type VisitRow = {
  id: string
  venueId: string
  visitedAt: string
  note: string | null
}

export function SammlerClient({
  venues,
  initialVisits,
  isAuthenticated,
}: {
  venues: VenueItem[]
  initialVisits: VisitRow[]
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [visits, setVisits] = useState<VisitRow[]>(initialVisits)
  const [pendingVenueId, setPendingVenueId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const visitsByVenue = useMemo(() => {
    const map = new Map<string, VisitRow[]>()
    for (const v of visits) {
      const arr = map.get(v.venueId) ?? []
      arr.push(v)
      map.set(v.venueId, arr)
    }
    for (const [k, arr] of map) arr.sort((a, b) => +new Date(b.visitedAt) - +new Date(a.visitedAt))
    return map
  }, [visits])

  async function addVisit(venueId: string) {
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/sammler')
      return
    }
    setError(null)
    setPendingVenueId(venueId)
    try {
      const res = await fetch('/api/v1/me/venue-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId, visitedAt: new Date().toISOString() }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error?.message || 'Speichern fehlgeschlagen')
      const v = json?.data
      if (v?.id) {
        setVisits((prev) => [{ id: v.id, venueId: v.venueId, visitedAt: v.visitedAt, note: v.note ?? null }, ...prev])
      } else {
        router.refresh()
      }
    } catch (e: any) {
      setError(e?.message || 'Besuch konnte nicht gespeichert werden.')
    } finally {
      setPendingVenueId(null)
    }
  }

  async function removeLatest(visitId: string) {
    setError(null)
    setPendingVenueId(`del:${visitId}`)
    try {
      const res = await fetch(`/api/v1/me/venue-visits?id=${encodeURIComponent(visitId)}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error?.message || 'Löschen fehlgeschlagen')
      setVisits((prev) => prev.filter((v) => v.id !== visitId))
    } catch (e: any) {
      setError(e?.message || 'Eintrag konnte nicht gelöscht werden.')
    } finally {
      setPendingVenueId(null)
    }
  }

  const uniqueVisited = visitsByVenue.size
  const total = venues.length
  const pct = total > 0 ? Math.round((uniqueVisited / total) * 100) : 0

  return (
    <div className="space-y-6">
      <Card className="border-fc-violet/25 bg-gradient-to-r from-fc-violet/[0.10] via-fc-surface/60 to-fc-surface/40">
        <CardContent className="py-5 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-fc-fg/70">Sammler-Fortschritt</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-fc-fg">
                {uniqueVisited} <span className="text-lg font-semibold text-fc-fg/60">/ {total} Stadien</span>
              </p>
              <p className="mt-1 text-sm text-fc-fg/65">{visits.length} Besuche insgesamt erfasst</p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-fc-fg/60">
                <span>Abdeckung</span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-fc-border/40 ring-1 ring-inset ring-fc-border/60" aria-hidden="true">
                <div className="h-full rounded-full bg-fc-violet transition-all" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
              </div>
            </div>
          </div>
          {!isAuthenticated ? (
            <p className="mt-4 rounded-lg border border-fc-border/70 bg-fc-bg/30 px-3 py-2 text-sm text-fc-fg/75">
              <a href="/login?callbackUrl=/sammler" className="font-semibold text-fc-violet hover:underline">Melde dich an</a>, um deine Stadionbesuche zu speichern und deinen Fortschritt zu verfolgen.
            </p>
          ) : null}
          {error ? <p className="mt-3 text-sm text-fc-loss">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue) => {
          const venueVisits = visitsByVenue.get(venue.id) ?? []
          const visited = venueVisits.length > 0
          const latest = venueVisits[0]
          const busy = pendingVenueId === venue.id
          const deleting = latest ? pendingVenueId === `del:${latest.id}` : false
          return (
            <Card key={venue.id} className={visited ? 'border-fc-win/30' : 'border-fc-border/70'}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {visited ? (
                        <Badge className="border-fc-win/30 bg-fc-win/10 text-fc-win">
                          <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" /> Besucht
                        </Badge>
                      ) : (
                        <Badge variant="outline">Offen</Badge>
                      )}
                      {visited ? <span className="text-xs text-fc-fg/55">{venueVisits.length}×</span> : null}
                    </div>
                    <a href={`/auswaerts/${venue.slug}`} className="font-semibold text-fc-fg hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded-sm">
                      {venue.name}
                    </a>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-fc-fg/65">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {venue.city}
                    </p>
                    {latest ? (
                      <p className="mt-2 text-xs text-fc-fg/55">
                        Zuletzt: {new Date(latest.visitedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addVisit(venue.id)}
                    disabled={busy || deleting}
                    className="gap-1.5"
                    aria-label={`Besuch für ${venue.name} erfassen`}
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                    Besuch erfassen
                  </Button>
                  {visited && latest ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeLatest(latest.id)}
                      disabled={busy || deleting}
                      className="gap-1.5 text-fc-fg/80"
                      aria-label={`Letzten Besuch für ${venue.name} entfernen`}
                    >
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                      Letzten entfernen
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
