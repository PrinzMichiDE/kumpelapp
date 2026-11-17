import type { StandingDto } from '@kumpelapp/api-contracts'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { AlertCircle, Minus, SearchX, TrendingDown, TrendingUp, Trophy } from 'lucide-react'
import { cn } from '@kumpelapp/utils'
import { DataMeta } from '@/components/data-meta'
import { staleLabel } from '@/lib/data-freshness'

export const dynamic = 'force-dynamic'

interface StandingRowProps {
  standing: StandingDto & { team: StandingDto['team'] & { isOwn?: boolean } }
  index: number
  isAue: boolean
}

function StandingRow({ standing, index, isAue }: StandingRowProps) {
  const formChars = standing.form?.split(',').filter(Boolean) ?? []
  const lastFive = formChars.slice(-5)

  const formLabel = (result: string) => {
    switch (result) {
      case 'W':
        return 'Sieg'
      case 'D':
        return 'Unentschieden'
      case 'L':
        return 'Niederlage'
      default:
        return 'Unbekannt'
    }
  }

  const getFormIcon = (result: string) => {
    switch (result) {
      case 'W':
        return <TrendingUp className="h-4 w-4 text-fc-win" aria-hidden="true" />
      case 'D':
        return <Minus className="h-4 w-4 text-fc-draw" aria-hidden="true" />
      case 'L':
        return <TrendingDown className="h-4 w-4 text-fc-loss" aria-hidden="true" />
      default:
        return null
    }
  }

  const diff = standing.goalDifference ?? standing.goalsFor - standing.goalsAgainst

  return (
    <tr
      className={cn(
        'border-b border-fc-border/70 transition-colors duration-150 hover:bg-fc-violet/5',
        isAue && 'bg-fc-violet/12 font-medium ring-1 ring-inset ring-fc-violet/20'
      )}
    >
      <td className="px-4 py-3 text-center text-sm font-bold tabular-nums text-fc-fg">{standing.position || index + 1}.</td>
      <th scope="row" className="px-4 py-3 text-left font-normal">
        <div className="flex items-center gap-3">
          {standing.team.logoUrl ? (
            <img
              src={standing.team.logoUrl}
              alt=""
              className="h-6 w-6 shrink-0 rounded-full bg-fc-border/30 object-contain"
              loading="lazy"
            />
          ) : null}
          <span className={cn('font-medium text-fc-fg', isAue && 'text-fc-violet-light')}>
            {standing.team.shortName || standing.team.name}
            {isAue ? <span className="sr-only"> (FC Erzgebirge Aue)</span> : null}
          </span>
        </div>
      </th>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-fg/90">{standing.played}</td>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-win">{standing.won}</td>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-draw">{standing.drawn}</td>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-loss">{standing.lost}</td>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-fg/90">
        {standing.goalsFor}:{standing.goalsAgainst}
      </td>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-fg/90">
        {diff >= 0 ? '+' : ''}
        {diff}
      </td>
      <td className="px-4 py-3 text-center text-base font-bold tabular-nums text-fc-fg">{standing.points}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1" aria-label={lastFive.length ? `Form: ${lastFive.map(formLabel).join(', ')}` : 'Keine Formdaten'}>
          {lastFive.length ? (
            lastFive.map((result, i) => (
              <span
                key={`${standing.id}-form-${i}`}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-fc-bg/30 ring-1 ring-inset ring-fc-border/20"
                title={formLabel(result)}
              >
                {getFormIcon(result)}
                <span className="sr-only">{formLabel(result)}</span>
              </span>
            ))
          ) : (
            <span className="text-xs text-fc-fg/40" aria-label="Keine Formdaten">–</span>
          )}
        </div>
      </td>
    </tr>
  )
}

export default async function TabellePage() {
  let standings: (StandingDto & { team: StandingDto['team'] & { isOwn?: boolean } })[] = []
  let leagueName = 'Regionalliga Nordost'
  let seasonLabel: string | null = null
  let updatedAt: string | null = null
  let syncUpdatedAt: Date | null = null
  let syncOk = true
  let error: string | null = null

  try {
    const league = await prisma.league.findFirst({
      where: { season: { isCurrent: true } },
      include: { season: true },
      orderBy: { tier: 'asc' },
    })

    const targetLeague =
      league ??
      (await prisma.league.findFirst({
        include: { season: true },
        orderBy: [{ season: { startYear: 'desc' } }, { tier: 'asc' }],
      }))

    if (targetLeague) {
      leagueName = targetLeague.name
      seasonLabel = targetLeague.season?.label ?? null
      const [rows, syncLog] = await Promise.all([
        prisma.standing.findMany({
          where: { leagueId: targetLeague.id },
          include: {
            team: { select: { id: true, name: true, shortName: true, logoUrl: true, isOwn: true } },
          },
          orderBy: { position: 'asc' },
        }),
        prisma.sourceSyncLog.findFirst({
          where: { source: 'openligadb' },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true, ok: true },
        }),
      ])

      standings = rows.map((r) => ({
        id: r.id,
        leagueId: r.leagueId,
        team: {
          id: r.team.id,
          name: r.team.name,
          shortName: r.team.shortName,
          logoUrl: r.team.logoUrl,
          isOwn: r.team.isOwn,
        },
        position: r.position,
        played: r.played,
        won: r.won,
        drawn: r.drawn,
        lost: r.lost,
        goalsFor: r.goalsFor,
        goalsAgainst: r.goalsAgainst,
        goalDifference: r.goalsFor - r.goalsAgainst,
        points: r.points,
        form: r.form,
        updatedAt: r.updatedAt.toISOString(),
      }))

      const latest = rows.reduce<Date | null>((acc, r) => (!acc || r.updatedAt > acc ? r.updatedAt : acc), null)
      updatedAt = latest ? latest.toISOString() : null
      syncUpdatedAt = syncLog?.createdAt ?? latest
      syncOk = syncLog?.ok ?? true
    }
  } catch (e) {
    error = 'Tabelle konnte nicht geladen werden. Bitte versuche es später erneut.'
    console.error('Tabelle load error', e)
  }

  const aueStanding = standings.find((s) => s.team.isOwn)
  const leader = standings[0]
  const aueIndex = aueStanding ? standings.findIndex((s) => s.id === aueStanding.id) : -1
  const teamAboveAue = aueIndex > 0 ? standings[aueIndex - 1] : null
  const teamBelowAue = aueIndex >= 0 && aueIndex < standings.length - 1 ? standings[aueIndex + 1] : null
  const aueGapToLeader = aueStanding && leader ? leader.points - aueStanding.points : null
  const aueGapToAbove = aueStanding && teamAboveAue ? teamAboveAue.points - aueStanding.points : null
  const aueGapToBelow = aueStanding && teamBelowAue ? aueStanding.points - teamBelowAue.points : null
  const auePpg = aueStanding && aueStanding.played > 0 ? (aueStanding.points / aueStanding.played).toFixed(2) : null
  const aueFormText = aueStanding?.form
    ? aueStanding.form
        .split(',')
        .filter(Boolean)
        .slice(-5)
        .map((r) => (r === 'W' ? 'S' : r === 'D' ? 'U' : r === 'L' ? 'N' : r))
        .join(' ')
    : null
  const staleText = staleLabel(syncUpdatedAt || updatedAt, 'openligadb')

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-fc-fg md:text-4xl">Tabelle</h1>
          <p className="mt-2 text-fc-fg/70">
            {leagueName}
            {seasonLabel ? ` ${seasonLabel}` : ''}
          </p>
        </div>
        <div className="mb-8">
          <DataMeta
            source="OpenLigaDB (rlno), mit manuellen Korrekturen möglich"
            updatedAt={syncUpdatedAt || updatedAt}
            stale={!!staleText}
            staleLabel={staleText || 'Datenstand evtl. veraltet'}
            manualLabel={syncOk ? null : 'Letzter Sync mit Fehler'}
            capabilityLabel="Tabellenstand abhängig von Quelle/Spielabschluss"
            capabilityTone="info"
            note="Abweichungen sind möglich (Korrekturen, Verzögerungen, Spielabbrüche). Bei Unsicherheit offizielle Verbands-/Vereinsangaben prüfen."
          />
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-xl border border-fc-loss/30 bg-fc-loss/10 p-5 text-fc-loss" role="alert">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Keine Tabellendaten vorhanden</p>
            <p className="max-w-md text-sm text-fc-fg/60">
              Aktuell sind keine Standings in der Datenbank hinterlegt. Synchronisiere die Tabelle über den Admin-Bereich (OpenLigaDB), um den aktuellen Tabellenstand anzuzeigen.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {aueStanding ? (
              <Card className="border-fc-violet/30 bg-gradient-to-br from-fc-violet/10 via-fc-surface/70 to-fc-surface/40">
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-xl text-fc-fg">
                    <Trophy className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                    Veilchen-Status
                  </CardTitle>
                  <p className="text-sm text-fc-fg/70">
                    {aueStanding.team.shortName || aueStanding.team.name} · Platz {aueStanding.position}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-fc-fg/55">Punkte</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-fc-fg">{aueStanding.points}</p>
                    </div>
                    <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-fc-fg/55">Spiele</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-fc-fg">{aueStanding.played}</p>
                    </div>
                    <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-fc-fg/55">Tordifferenz</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-fc-fg">
                        {(aueStanding.goalDifference ?? aueStanding.goalsFor - aueStanding.goalsAgainst) >= 0 ? '+' : ''}
                        {aueStanding.goalDifference ?? aueStanding.goalsFor - aueStanding.goalsAgainst}
                      </p>
                    </div>
                    <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-fc-fg/55">Punkte/Spiel</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-fc-fg">{auePpg ?? '–'}</p>
                    </div>
                    <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-fc-fg/55">Abstand Spitze</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-fc-fg">
                        {aueGapToLeader === null ? '–' : aueGapToLeader === 0 ? '0' : `−${aueGapToLeader}`}
                      </p>
                    </div>
                    <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-fc-fg/55">Form (5)</p>
                      <p className="mt-1 text-sm font-semibold text-fc-fg">{aueFormText ?? '–'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fc-fg/70">
                    <span>
                      Bilanz: <span className="font-medium text-fc-fg">{aueStanding.won}S · {aueStanding.drawn}U · {aueStanding.lost}N</span>
                    </span>
                    {teamAboveAue && aueGapToAbove !== null ? (
                      <span>
                        Zum Platz davor ({teamAboveAue.team.shortName || teamAboveAue.team.name}): <span className="font-medium text-fc-fg">−{aueGapToAbove} Pkt</span>
                      </span>
                    ) : null}
                    {teamBelowAue && aueGapToBelow !== null ? (
                      <span>
                        Vorsprung auf Platz dahinter ({teamBelowAue.team.shortName || teamBelowAue.team.name}): <span className="font-medium text-fc-fg">+{aueGapToBelow} Pkt</span>
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-fc-border/70">
                <CardTitle className="text-xl">{leagueName}</CardTitle>
                <p className="text-sm text-fc-fg/60">Aktueller Tabellenstand mit Form der letzten fünf Spiele.</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto overscroll-x-contain">
                  <table className="w-full min-w-[720px] border-collapse text-left" aria-label={`Tabelle ${leagueName}`}>
                    <caption className="sr-only">
                      Tabelle mit Platz, Verein, Spielen, Siegen, Unentschieden, Niederlagen, Toren, Differenz, Punkten und Form.
                    </caption>
                    <thead>
                      <tr className="bg-fc-surface/90">
                        <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                          <abbr title="Platz" className="no-underline">#</abbr>
                        </th>
                        <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                          Verein
                        </th>
                        <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                          <abbr title="Spiele" className="no-underline">Sp</abbr>
                        </th>
                        <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                          <abbr title="Siege" className="no-underline">S</abbr>
                        </th>
                        <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                          <abbr title="Unentschieden" className="no-underline">U</abbr>
                        </th>
                        <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                          <abbr title="Niederlagen" className="no-underline">N</abbr>
                        </th>
                        <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                          Tore
                        </th>
                        <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                          <abbr title="Tordifferenz" className="no-underline">Diff</abbr>
                        </th>
                        <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                          <abbr title="Punkte" className="no-underline">Pkt</abbr>
                        </th>
                        <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                          Form
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card">
                      {standings.map((s, idx) => (
                        <StandingRow key={s.id} standing={s} index={idx} isAue={Boolean(s.team.isOwn)} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-fc-fg/60 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-fc-win" />
            <span>S = Sieg</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-fc-draw" />
            <span>U = Unentschieden</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-fc-loss" />
            <span>N = Niederlage</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-fc-violet" />
            <span>Form = Letzte 5 Spiele</span>
          </div>
        </div>
      </div>
    </div>
  )
}