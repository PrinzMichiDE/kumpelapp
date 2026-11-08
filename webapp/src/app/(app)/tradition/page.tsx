import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { Trophy, Calendar, User, Clock, Brain, Sparkles } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

const titles = [
  { year: 1955, competition: 'FDGB-Pokal', note: 'Erster Pokalsieg der Vereinsgeschichte' },
  { year: 1956, competition: 'DDR-Oberliga', note: 'Erster Meistertitel' },
  { year: 1957, competition: 'DDR-Oberliga', note: 'Titelverteidigung' },
  { year: 1959, competition: 'DDR-Oberliga', note: 'Dritter Meistertitel' },
]

const legends = [
  { name: 'Dieter „Ete“ Schüßler', position: 'Mittelfeld', era: '1955–1970', appearances: '300+', note: 'Vereinsikone, 80. Geburtstag 2026' },
  { name: 'Manfred Zapf', position: 'Libero', era: '1964–1978', appearances: '310', note: 'Rekordnationalspieler der DDR' },
  { name: 'Jürgen Croy', position: 'Torwart', era: '1967–1981', appearances: '287', note: 'Weltbester Torwart 1978 (IFFHS)' },
  { name: 'Hans-Jürgen Dörner', position: 'Libero', era: '1969–1985', appearances: '379', note: 'DDR-Fußballer des Jahres 1977, 1984, 1985' },
]

const quizQuestions = [
  {
    question: 'In welchem Jahr wurde Aue zuletzt DDR-Meister?',
    answers: [{ text: '1959', correct: true }, { text: '1960', correct: false }, { text: '1958', correct: false }, { text: '1961', correct: false }],
    category: 'Titel',
  },
  {
    question: 'Wie hieß der Gegner am 1. Spieltag 2026/27?',
    answers: [{ text: 'VSG Altglienicke', correct: true }, { text: 'Chemnitzer FC', correct: false }, { text: 'BFC Dynamo', correct: false }, { text: 'Hallescher FC', correct: false }],
    category: 'Saison 2026/27',
  },
  {
    question: 'Wie oft gewann Aue den FDGB-Pokal?',
    answers: [{ text: '1x (1955)', correct: true }, { text: '2x', correct: false }, { text: '3x', correct: false }, { text: 'Nie', correct: false }],
    category: 'Titel',
  },
]

export default function TraditionPage() {
  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fc-fg">Tradition & Geschichte</h1>
          <p className="mt-2 text-fc-fg/70">80 Jahre FC Erzgebirge Aue – Titel, Legenden & Chronik</p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-fc-fg mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 flex items-center justify-center">
              <Trophy className="h-6 w-6" />
            </div>
            Titel & Erfolge
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {titles.map((title) => (
              <Card key={title.year} className="text-center relative overflow-hidden">
                <CardContent className="py-6">
                  <div className="text-4xl font-bold text-fc-violet mb-1">{title.year}</div>
                  <div className="text-lg font-medium text-fc-fg">{title.competition}</div>
                  <p className="text-sm text-fc-fg/60 mt-2">{title.note}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fc-violet/30 to-transparent" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-fc-fg mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
              <User className="h-6 w-6 text-fc-violet" />
            </div>
            Legenden
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legends.map((legend) => (
              <Card key={legend.name} className="hover:shadow-lg hover:border-fc-violet/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-fc-violet/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-8 w-8 text-fc-violet" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-fc-fg">{legend.name}</h3>
                      <p className="text-sm text-fc-fg/60">{legend.position} • {legend.era}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-fc-fg/70">
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {legend.appearances} Einsätze</span>
                      </div>
                      <p className="text-sm text-fc-fg/60 mt-2 italic">{legend.note}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-fc-fg mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center">
              <Brain className="h-6 w-6" />
            </div>
            Veilchen-Quiz
          </h2>
          <div className="space-y-4">
            {quizQuestions.map((q, i) => (
              <Card key={i} className="hover:shadow-lg hover:border-fc-violet/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">{q.category}</Badge>
                    <Badge variant="secondary">Frage {i + 1}</Badge>
                  </div>
                  <h3 className="text-lg font-medium text-fc-fg mb-4">{q.question}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.answers.map((answer, ai) => (
                      <button
                        key={ai}
                        className={cn(
                          'px-4 py-3 rounded-lg border text-left transition-all',
                          answer.correct
                            ? 'border-fc-win bg-fc-win/10 text-fc-win'
                            : 'border-fc-border bg-fc-surface hover:border-fc-violet/50'
                        )}
                      >
                        {answer.text}
                        {answer.correct && <span className="ml-2 text-fc-win">✓ Richtig</span>}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-fc-fg mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            Zeitstrahl – 80 Jahre
          </h2>
          <div className="relative pl-8 border-l-2 border-fc-violet/30">
            {[
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
            ].map((event) => (
              <div key={event.year} className="relative mb-8 pb-8 last:pb-0">
                <div className="absolute left-[-22px] top-1 w-4 h-4 rounded-full bg-fc-violet border-4 border-fc-bg" />
                <div className="ml-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl font-bold text-fc-violet">{event.year}</span>
                    <h3 className="text-lg font-semibold text-fc-fg">{event.title}</h3>
                  </div>
                  <p className="text-fc-fg/70 ml-6">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}