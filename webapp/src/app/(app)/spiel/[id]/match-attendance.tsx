'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { CheckCircle2, HelpCircle, Loader2, Users, XCircle } from 'lucide-react'

type Status = 'GOING' | 'MAYBE' | 'NOT_GOING'

const labels: Record<Status, string> = {
  GOING: 'Bin dabei',
  MAYBE: 'Vielleicht',
  NOT_GOING: 'Nicht dabei',
}

export function MatchAttendance({
  matchId,
  initialCounts,
  initialMyStatus,
  isAuthenticated,
}: {
  matchId: string
  initialCounts: { GOING: number; MAYBE: number; NOT_GOING: number; total: number }
  initialMyStatus: Status | null
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [counts, setCounts] = useState(initialCounts)
  const [myStatus, setMyStatus] = useState<Status | null>(initialMyStatus)
  const [pending, setPending] = useState<Status | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/v1/matches/${encodeURIComponent(matchId)}/attendance`, { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (cancelled || !res.ok) return
        if (json?.data?.counts) setCounts(json.data.counts)
        if (json?.data?.auth) setMyStatus(json.data.myStatus ?? null)
      } catch {
        // keep initial
      }
    }
    load()
    return () => { cancelled = true }
  }, [matchId])

  async function setStatus(status: Status) {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/spiel/${matchId}`)
      return
    }
    setError(null)
    setPending(status)
    try {
      const res = await fetch('/api/v1/me/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, status }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error?.message || 'Speichern fehlgeschlagen')
      setMyStatus(status)
      const sumRes = await fetch(`/api/v1/matches/${encodeURIComponent(matchId)}/attendance`, { cache: 'no-store' })
      const sumJson = await sumRes.json().catch(() => ({}))
      if (sumJson?.data?.counts) setCounts(sumJson.data.counts)
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Status konnte nicht gespeichert werden.')
    } finally {
      setPending(null)
    }
  }

  const Btn = ({ status, icon: Icon }: { status: Status; icon: any }) => {
    const active = myStatus === status
    return (
      <Button
        type="button"
        variant={active ? 'default' : 'outline'}
        size="sm"
        onClick={() => setStatus(status)}
        disabled={!!pending}
        className={`gap-1.5 ${active ? 'shadow-sm' : ''}`}
        aria-pressed={active}
      >
        {pending === status ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
        {labels[status]}
      </Button>
    )
  }

  return (
    <Card id="match-attendance" className="mt-6 scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Wer ist dabei?
        </CardTitle>
        <p className="text-sm text-fc-fg/60">Check-in für dieses Spiel – teile deinen Status mit der Community (aggregiert angezeigt).</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Btn status="GOING" icon={CheckCircle2} />
          <Btn status="MAYBE" icon={HelpCircle} />
          <Btn status="NOT_GOING" icon={XCircle} />
        </div>
        {error ? <p className="text-sm text-fc-loss" role="alert">{error}</p> : null}
        {!isAuthenticated ? <p className="text-xs text-fc-fg/55">Melde dich an, um deinen Status zu speichern.</p> : myStatus ? <p className="text-xs text-fc-fg/60">Dein Status: <span className="font-medium text-fc-fg">{labels[myStatus]}</span></p> : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-fc-border/60 bg-fc-bg/25 p-3 text-center">
            <p className="text-xl font-bold tabular-nums text-fc-fg">{counts.GOING}</p>
            <p className="text-xs text-fc-fg/60">Dabei</p>
          </div>
          <div className="rounded-lg border border-fc-border/60 bg-fc-bg/25 p-3 text-center">
            <p className="text-xl font-bold tabular-nums text-fc-fg">{counts.MAYBE}</p>
            <p className="text-xs text-fc-fg/60">Vielleicht</p>
          </div>
          <div className="rounded-lg border border-fc-border/60 bg-fc-bg/25 p-3 text-center">
            <p className="text-xl font-bold tabular-nums text-fc-fg">{counts.NOT_GOING}</p>
            <p className="text-xs text-fc-fg/60">Nicht dabei</p>
          </div>
          <div className="rounded-lg border border-fc-border/60 bg-fc-bg/25 p-3 text-center">
            <p className="text-xl font-bold tabular-nums text-fc-fg">{counts.total}</p>
            <p className="text-xs text-fc-fg/60">Rückmeldungen</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
