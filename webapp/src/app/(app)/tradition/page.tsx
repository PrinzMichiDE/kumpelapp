import { Card, CardContent } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { Brain, Clock, Trophy, User } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

const titles = [
  { year: 1955, competition: 'FDGB-Pokal', note: 'Erster Pokalsieg der Vereinsgeschichte' },
  { year: 1956, competition: 'DDR-Oberliga', note: 'Erster Meistertitel' },
  { year: 1957, competition: 'DDR-Oberliga', note: 'Titelverteidigung' },
  { year: 1959, competition: 'DDR-Oberliga', note: 'Dritter Meistertitel' },
]

const legends = [
  {
    name: 'Dieter „Ete“ Schüßler',
    position: 'Mittelfeld',
    era: '1955–1970',
    appearances: '300+',
    note: 'Vereinsikone, 80. Geburtstag 2026',
  },
  {
    name: 'Manfred Zapf',
    position: 'Libero',
    era: '1964–1978',
    appearances: '310',
    note: 'Rekordnationalspieler der DDR',
  },
  {
    name: 'Jürgen Croy',
    position: 'Torwart',
    era: '1967–1981',
    appearances: '287',
    note: 'Weltbester Torwart 1978 (IFFHS)',
  },
  {
    name: 'Hans-Jürgen Dörner',
    position: 'Libero',
    era: '1969–1985',
    appearances: '379',
    note: 'DDR-Fußballer des Jahres 1977, 1984, 1985',
  },
]

const quizQuestions = [
  {
    question: 'In welchem Jahr wurde Aue zuletzt DDR-Meister?',
    answers: [
      { text: '1959', correct: true },
      { text: '1960', correct: false },
      { text: '1958', correct: false },
      { text: '1961', correct: false },
    ],
    category: 'Titel',
  },
  {
    question: 'Wie hieß der Gegner am 1. Spieltag 2026/27?',
    answers: [
      { text: 'VSG Altglienicke', correct: true },
      { text: 'Chemnitzer FC', correct: false },
      { text: 'BFC Dynamo', correct: false },
      { text: 'Hallescher FC', correct: false },
    ],
    category: 'Saison 2026/27',
  },
  {
    question: 'Wie oft gewann Aue den FDGB-Pokal?',
    answers: [
      { text: '1x (1955)', correct: true },
      { text: '2x', correct: false },
      { text: '3x', correct: false },
      { text: 'Nie', correct: false },
    ],
    category: 'Titel',
  },
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
  { year: 2003, title: 'Aufstieg in die Bundesliga', description: 'Erstmalig in der höchsten deutschen Spielklasse.' },
  { year: 2026, title: '80-jähriges Jubiläum & Regionalliga', description: 'Acht Jahrzehnte Vereinsgeschichte, aktuell Regionalliga Nordost.' },
]

function SectionHeading({
  id,
  icon: Icon,
  title,
  accent,
}: {
  id: string
  icon: React.ComponentType<{ className?: string }>
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

export default function TraditionPage() {
  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Tradition &amp; Geschichte</h1>
          <p className="mt-2 text-fc-fg/70">80 Jahre FC Erzgebirge Aue – Titel, Legenden &amp; Chronik</p>
        </div>

        <section className="mb-12" aria-labelledby="titles-heading">
          <SectionHeading
            id="titles-heading"
            icon={Trophy}
            title="Titel & Erfolge"
            accent="bg-fc-draw/12 text-fc-draw ring-fc-draw/20"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {titles.map((title) => (
              <Card
                key={`${title.year}-${title.competition}`}
                className="relative overflow-hidden text-center transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5"
              >
                <CardContent className="py-6">
                  <div className="mb-1 text-4xl font-bold tabular-nums tracking-tight text-fc-violet">{title.year}</div>
                  <div className="text-lg font-semibold text-fc-fg">{title.competition}</div>
                  <p className="mt-2 text-sm leading-relaxed text-fc-fg/65">{title.note}</p>
                  <div
                    className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-fc-violet/35 to-transparent"
                    aria-hidden="true"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12" aria-labelledby="legends-heading">
          <SectionHeading
            id="legends-heading"
            icon={User}
            title="Legenden"
            accent="bg-fc-violet/12 text-fc-violet ring-fc-violet/20"
          />
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
          <SectionHeading
            id="quiz-heading"
            icon={Brain}
            title="Veilchen-Quiz"
            accent="bg-purple-500/12 text-purple-300 ring-purple-400/20"
          />
          <p className="mb-4 text-sm text-fc-fg/65">Teste dein Wissen – die richtige Antwort ist hervorgehoben.</p>
          <div className="space-y-4">
            {quizQuestions.map((q, i) => (
              <Card key={q.question} className="border-fc-border/80">
                <CardContent className="pt-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className="border-fc-border/80 bg-fc-bg/25">
                      {q.category}
                    </Badge>
                    <Badge variant="secondary">Frage {i + 1}</Badge>
                  </div>
                  <h3 className="mb-4 text-lg font-medium leading-snug text-fc-fg">{q.question}</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list" aria-label="Antwortmöglichkeiten">
                    {q.answers.map((answer) => (
                      <div
                        key={answer.text}
                        role="listitem"
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                          answer.correct
                            ? 'border-fc-win/35 bg-fc-win/10 text-fc-fg'
                            : 'border-fc-border/80 bg-fc-surface/50 text-fc-fg/80'
                        )}
                        aria-label={`${answer.text}${answer.correct ? ', richtige Antwort' : ''}`}
                      >
                        <span>{answer.text}</span>
                        {answer.correct ? (
                          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-fc-win">
                            Richtig
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-4" aria-labelledby="timeline-heading">
          <SectionHeading
            id="timeline-heading"
            icon={Clock}
            title="Zeitstrahl – 80 Jahre"
            accent="bg-orange-500/12 text-orange-300 ring-orange-400/20"
          />
          <ol className="relative ml-3 border-l-2 border-fc-violet/25 pl-7 sm:ml-4 sm:pl-8">
            {timeline.map((event, index) => (
              <li key={event.year} className="relative pb-8 last:pb-0">
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