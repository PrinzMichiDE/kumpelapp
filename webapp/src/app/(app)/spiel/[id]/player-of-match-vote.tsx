'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Loader2, Trophy, Vote } from 'lucide-react'

type Player = { id: string; name: string; number: number | null; position: string }

type ResultEntry = { playerId: string; votes: number; share: number; player: Player | null }

export function PlayerOfMatchVote({
  matchId,
  initialResults,
  initialTotal,
  initialMyPlayerId,
  isAuthenticated,
}: {
  matchId: string
  initialResults: ResultEntry[]
  initialTotal: number
  initialMyPlayerId: string | null
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [selected, setSelected] = useState(initialMyPlayerId ?? '')
  const [results, setResults] = useState<ResultEntry[]>(initialResults)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [squadRes, votesRes] = await Promise.all([
          fetch('/api/v1/squad', { cache: 'no-store' }),
          fetch(`/api/v1/matches/${encodeURIComponent(matchId)}/votes`, { cache: 'no-store' }),
        ])
        const squadJson = await squadRes.json().catch(() => ({}))
        const votesJson = await votesRes.json().catch(() => ({}))
        if (cancelled) return
        const list = Array.isArray(squadJson?.data) ? squadJson.data : []
        setPlayers(list.map((p: any) => ({ id: p.id, name: p.name, number: p.number ?? null, position: p.position })))
        const r = Array.isArray(votesJson?.data?.results) ? votesJson.data.results : []
        setResults(r)
        setTotal(Number(votesJson?.data?.totalVotes || 0))
        const mine = votesJson?.data?.myVote?.playerId
        if (typeof mine === 'string') setSelected(mine)
      } catch {
        // keep initial server data
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [matchId])

  const sortedPlayers = useMemo(() => {
    const posOrder: Record<string, number> = { GOALKEEPER: 0, DEFENDER: 1, MIDFIELDER: 2, FORWARD: 3 }
    return [...players].sort((a, b) => (posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9) || (a.number ?? 999) - (b.number ?? 999) || a.name.localeCompare(b.name, 'de'))
  }, [players])

  async function submit() {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/spiel/${matchId}`)
      return
    }
    if (!selected) {
      setError('Bitte wähle einen Spieler aus.')
      return
    }
    setError(null)
    setOk(null)
    setSaving(true)
    try {
      const res = await fetch('/api/v1/me/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, playerId: selected }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error?.message || 'Abstimmung fehlgeschlagen')
      setOk('Deine Stimme wurde gespeichert.')
      const votesRes = await fetch(`/api/v1/matches/${encodeURIComponent(matchId)}/votes`, { cache: 'no-store' })
      const votesJson = await votesRes.json().catch(() => ({}))
      const r = Array.isArray(votesJson?.data?.results) ? votesJson.data.results : []
      setResults(r)
      setTotal(Number(votesJson?.data?.totalVotes || 0))
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Abstimmung fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mt-6 border-fc-violet/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Vote className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Spieler des Spiels wählen
        </CardTitle>
        <p className="text-sm text-fc-fg/60">Stimme für deinen besten Aue-Spieler dieser Partie ab. {total} {total === 1 ? 'Stimme' : 'Stimmen'} insgesamt.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="inline-flex items-center gap-2 text-sm text-fc-fg/70"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Lade Kader & Stimmen…</p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="potm-player" className="block text-sm font-medium text-fc-fg/80">Dein Vote</label>
            <select
              id="potm-player"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-lg border border-fc-border bg-fc-bg/40 px-3 py-2.5 text-sm text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
              disabled={saving}
            >
              <option value="">Spieler auswählen…</option>
              {sortedPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.number != null ? `#${p.number} ` : ''}{p.name}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" onClick={submit} disabled={saving || !selected} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trophy className="h-4 w-4" aria-hidden="true" />}
                {isAuthenticated ? 'Stimme speichern' : 'Anmelden & abstimmen'}
              </Button>
              {selected && isAuthenticated ? <span className="text-xs text-fc-fg/55">Du kannst deine Stimme jederzeit ändern.</span> : null}
            </div>
            {error ? <p className="text-sm text-fc-loss">{error}</p> : null}
            {ok ? <p className="text-sm text-fc-win">{ok}</p> : null}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-fc-fg/80">Aktuelle Top-Ergebnisse</p>
            {results.length > 0 ? (
              <ol className="space-y-2">
                {results.slice(0, 5).map((entry, idx) => {
                  const pct = total > 0 ? Math.round(entry.share * 100) : 0
                  const mine = selected && entry.playerId === selected
                  return (
                    <li key={entry.playerId} className={`rounded-lg border p-2.5 ${mine ? 'border-fc-violet/40 bg-fc-violet/10' : 'border-fc-border/70 bg-fc-surface/40'}`}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate font-medium text-fc-fg">
                          <span className="mr-1.5 text-fc-fg/55">{idx + 1}.</span>
                          {entry.player ? `${entry.player.number != null ? `#${entry.player.number} ` : ''}${entry.player.name}` : 'Unbekannt'}
                          {mine ? <span className="ml-2 text-xs font-semibold text-fc-violet">Deine Wahl</span> : null}
                        </span>
                        <span className="shrink-0 tabular-nums text-fc-fg/65">{entry.votes} · {pct}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fc-border/40" aria-hidden="true">
                        <div className="h-full rounded-full bg-fc-violet" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="text-sm text-fc-fg/60">Noch keine Stimmen – sei der Erste.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
