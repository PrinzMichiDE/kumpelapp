import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent } from '@kumpelapp/ui'
import { ArrowRight, Brain, Clock, History, SearchX, Trophy, User } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

export const dynamic = 'force-dynamic'

const fallbackLegends = [
  { name: 'Dieter „Ete“ Schüßler', position: 'Mittelfeld', era: '1955–1970', appearances: '300+', note: 'Vereinsikone, 80. Geburtstag 2026' },
  { name: 'Manfred Zapf', position: 'Libero', era: '1964–1978', appearances: '310', note: 'Rekordnationalspieler der DDR' },
  { name: 'Jürgen Croy', position: 'Torwart', era: '1967–1981', appearances: '287', note: 'Weltbester Torwart 1978 (IFFHS)' },
  { name: 'Hans-Jürgen Dörner', position: 'Libero', era: '1969–1985', appearances: '379', note: 'DDR-Fußballer des Jahres 1977, 1984, 1985' },
]

const quizPreview = [
  'In welchem Jahr wurde Aue zuletzt DDR-Meister?',
  'Wie oft gewann Aue den FDGB-Pokal?',
  'Wie heißt das Heimstadion des FC Erzgebirge Aue?',
]

const timeline = [
  { year: 1946, title: 'Gründung als SG Aue', description: 'Gründung der Sportgemeinschaft Aue im erzgebirgischen Aue.' },
  { year: 1951, title: 'Umbenennung in BSG Wismut Aue', description: 'Übernahme durch den SDAG Wismut, Namensänderung.' },
  { year: 1955, title: 'FDGB-Pokalsieg', description: 'Erster großer Titel der Vereinsgeschichte.' },
  { year: 1956, title: 'Erster DDR-Meister', description: 'Meistertitel in der DDR-Oberliga.' },
  { year: 1957, title: 'Zweiter DDR-Meister', description: 'Erfolgreiche Titelverteidigung.' },
  { year: 1959, title: 'Dritter DDR-Meister', description: 'Dritter und vorerst letzter Meistertitel.' },
  { year: 1990, title: 'Umbenennung in FC Erzgebirge Aue', description: 'Nach der Wende Neugründung als eingetragener Verein.' },
  { year: 1993, title: 'Aufstieg in die 2. Bundesliga', description: 'Rückkehr in den Profifußball.' },
  { year: 2003, title: 'Aufstieg in die 2. Bundesliga-Spitze', description: 'Sportliche Erfolge und Rückkehr in den Profifußball-Kontext.' },
  { year: 2026, title: '80-jähriges Jubiläum & Regionalliga', description: 'Acht Jahrzehnte Vereinsgeschichte, aktuell Regionalliga Nordost.' },
]

function SectionHeading({
  id,
  icon: Icon,
  title,
  accent,
}: {
  id: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
  accent: string
}) {
  return (
    <h2 id={id} className="mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight text-fc-fg">
      <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset', accent)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      {title}
    </h2>
  )
}

export default async function TraditionPage() {
  let titles: { id: string; year: number; competition: string; note: string | null }[] = []
  let seasonRecords: { id: string; label: string; leagueName: string; tier: number | null; position: number | null; points: number | null; note: string | null }[] = []
  let legends: { name: string; position: string; era: string; appearances: string; note: string }[] = []

  try {
    const [titleRows, recordRows, legendRows] = await Promise.all([
      prisma.title.findMany({ orderBy: [{ year: 'asc' }, { competition: 'asc' }] }),
      prisma.seasonRecord.findMany({ orderBy: [{ label: 'desc' }, { leagueName: 'asc' }], take: 30 }),
      prisma.player.findMany({
        where: { isLegend: true },
        orderBy: [{ eraFrom: 'asc' }, { name: 'asc' }],
        take: 12,
        select: { name: true, position: true, eraFrom: true, eraTo: true },
      }),
    ])

    titles = titleRows.map((t) => ({ id: t.id, year: t.year, competition: t.competition, note: t.note }))
    seasonRecords = recordRows.map((r) => ({
      id: r.id,
      label: r.label,
      leagueName: r.leagueName,
      tier: r.tier,
      position: r.position,
      points: r.points,
      note: r.note,
    }))

    if (legendRows.length > 0) {
      legends = legendRows.map((l) => ({
        name: l.name,
        position:
          l.position === 'GOALKEEPER' ? 'Torwart' : l.position === 'DEFENDER' ? 'Abwehr' : l.position === 'MIDFIELDER' ? 'Mittelfeld' : 'Sturm',
        era: l.eraFrom ? `${l.eraFrom}${l.eraTo ? `–${l.eraTo}` : '–heute'}` : 'Vereinslegende',
        appearances: '–',
        note: 'Als Vereinslegende im Kader markiert.',
      }))
    } else {
      legends = fallbackLegends
    }
  } catch (e) {
    console.error('Tradition load error', e)
    legends = fallbackLegends
  }

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Tradition &amp; Geschichte</h1>
          <p className="mt-2 text-fc-fg/70">80 Jahre FC Erzgebirge Aue – Titel, Legenden, Saisonhistorie &amp; Chronik</p>
        </div>

        <section className="mb-12" aria-labelledby="titles-heading">
          <SectionHeading id="titles-heading" icon={Trophy} title="Titel & Erfolge" accent="bg-fc-draw/12 text-fc-draw ring-fc-draw/20" />
          {titles.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {titles.map((title) => (
                <Card
                  key={title.id}
                  className="relative overflow-hidden text-center transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5"
                >
                  <CardContent className="py-6">
                    <div className="mb-1 text-4xl font-bold tabular-nums tracking-tight text-fc-violet">{title.year}</div>
                    <div className="text-lg font-semibold text-fc-fg">{title.competition}</div>
                    {title.note ? <p className="mt-2 text-sm leading-relaxed text-fc-fg/65">{title.note}</p> : null}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-fc-violet/35 to-transparent" aria-hidden="true" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
              <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
              <p className="text-base font-medium text-fc-fg">Keine Titel hinterlegt</p>
              <p className="max-w-md text-sm text-fc-fg/60">Synchronisiere Traditionsdaten im Admin-Bereich, um Titel &amp; Erfolge anzuzeigen.</p>
            </div>
          )}
        </section>

        <section className="mb-12" aria-labelledby="records-heading">
          <SectionHeading id="records-heading" icon={History} title="Saisonhistorie" accent="bg-sky-500/12 text-sky-300 ring-sky-400/20" />
          {seasonRecords.length ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left" aria-label="Saisonhistorie">
                    <thead>
                      <tr className="bg-fc-surface/90">
                        <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Saison</th>
                        <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Liga</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Ebene</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Platz</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Punkte</th>
                        <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Hinweis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonRecords.map((r) => (
                        <tr key={r.id} className="border-t border-fc-border/70 hover:bg-fc-violet/5">
                          <td className="px-4 py-3 font-medium text-fc-fg">{r.label}</td>
                          <td className="px-4 py-3 text-fc-fg/80">{r.leagueName}</td>
                          <td className="px-4 py-3 text-center tabular-nums text-fc-fg/80">{r.tier ?? '–'}</td>
                          <td className="px-4 py-3 text-center tabular-nums text-fc-fg/80">{r.position ?? '–'}</td>
                          <td className="px-4 py-3 text-center tabular-nums text-fc-fg/80">{r.points ?? '–'}</td>
                          <td className="px-4 py-3 text-sm text-fc-fg/65">{r.note ?? '–'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
              <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
              <p className="text-base font-medium text-fc-fg">Keine Saisonhistorie hinterlegt</p>
              <p className="max-w-md text-sm text-fc-fg/60">Synchronisiere Traditionsdaten im Admin-Bereich, um Saisonabschlüsse und Platzierungen anzuzeigen.</p>
            </div>
          )}
        </section>

        <section className="mb-12" aria-labelledby="legends-heading">
          <SectionHeading id="legends-heading" icon={User} title="Legenden" accent="bg-fc-violet/12 text-fc-violet ring-fc-violet/20" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {legends.map((legend) => (
              <Card
                key={legend.name}
                className="transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-fc-violet/12 ring-1 ring-inset ring-fc-violet/20">
                      <User className="h-7 w-7 text-fc-violet" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold leading-tight text-fc-fg">{legend.name}</h3>
                      <p className="mt-0.5 text-sm text-fc-fg/65">
                        {legend.position} • {legend.era}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-fc-bg/35 px-2 py-1 text-sm text-fc-fg/75">
                        <User className="h-3.5 w-3.5" aria-hidden="true" />
                        {legend.appearances} Einsätze
                      </p>
                      <p className="mt-2 text-sm italic leading-relaxed text-fc-fg/65">{legend.note}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12" aria-labelledby="quiz-heading">
          <SectionHeading id="quiz-heading" icon={Brain} title="Veilchen-Quiz" accent="bg-purple-500/12 text-purple-300 ring-purple-400/20" />
          <Card className="overflow-hidden border-fc-violet/25 bg-gradient-to-br from-fc-surface to-fc-violet/5">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-fc-fg/75">
                    Teste dein Wissen interaktiv zu Titeln, Geschichte und Verein. Angemeldete Fans können ihre Serien speichern.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-fc-fg/70">
                    {quizPreview.map((question) => (
                      <li key={question} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fc-violet" aria-hidden="true" />
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/quiz"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-fc-violet px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-fc-violet/20 transition-[background-color,box-shadow,transform] duration-200 hover:bg-fc-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98]"
                >
                  Quiz starten
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-4" aria-labelledby="timeline-heading">
          <SectionHeading id="timeline-heading" icon={Clock} title="Zeitstrahl – 80 Jahre" accent="bg-orange-500/12 text-orange-300 ring-orange-400/20" />
          <ol className="relative ml-3 border-l-2 border-fc-violet/25 pl-7 sm:ml-4 sm:pl-8">
            {timeline.map((event, index) => (
              <li key={`${event.year}-${event.title}`} className="relative pb-8 last:pb-0">
                <span
                  className={cn(
                    'absolute -left-[calc(0.875rem+1px)] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-fc-bg',
                    index === timeline.length - 1 ? 'bg-fc-violet-light shadow-sm shadow-fc-violet/30' : 'bg-fc-violet'
                  )}
                  aria-hidden="true"
                />
                <div className="rounded-xl border border-transparent px-1 py-0.5 transition-colors hover:border-fc-border/50 hover:bg-fc-surface/25">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <time className="text-lg font-bold tabular-nums text-fc-violet" dateTime={String(event.year)}>
                      {event.year}
                    </time>
                    <h3 className="text-base font-semibold leading-snug text-fc-fg sm:text-lg">{event.title}</h3>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-fc-fg/70">{event.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}