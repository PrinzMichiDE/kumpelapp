'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, CardContent } from '@kumpelapp/ui'
import { Brain, CheckCircle2, Flame, Loader2, RefreshCw, Target, Trophy, XCircle } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

type PublicQuestion = {
  id: string
  question: string
  answers: { text: string }[]
  category: string | null
}

type QuizResponse = {
  data?: {
    questions: PublicQuestion[]
    categories: string[]
    source: 'database' | 'fallback'
  }
  error?: { message?: string }
}

type SubmitResponse = {
  data?: {
    correct: boolean
    correctAnswerText: string | null
    streak: number
    totalAnswered: number
    correctCount: number
    saved: boolean
  }
  error?: { message?: string }
}

type StatsResponse = {
  data?: {
    authenticated: boolean
    streak: number
    bestStreak: number
    totalAnswered: number
    correctCount: number
    accuracy: number
  }
  error?: { message?: string }
}

type AnswerState = {
  selectedText: string
  correct: boolean
  correctAnswerText: string | null
}

export function QuizPlay() {
  const [questions, setQuestions] = useState<PublicQuestion[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [source, setSource] = useState<'database' | 'fallback' | null>(null)
  const [category, setCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [runId, setRunId] = useState(0)
  const [savedInfo, setSavedInfo] = useState<{ streak: number; totalAnswered: number; correctCount: number } | null>(null)
  const [stats, setStats] = useState<StatsResponse['data'] | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/v1/quiz/stats', { cache: 'no-store' })
      const json = (await res.json()) as StatsResponse
      if (res.ok && json.data) setStats(json.data)
    } catch {
      // stats are optional; ignore errors
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const load = useCallback(async (selectedCategory: string) => {
    setLoading(true)
    setError(null)
    setAnswers({})
    setIndex(0)
    setSavedInfo(null)
    try {
      const params = new URLSearchParams({ limit: '10' })
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      const res = await fetch(`/api/v1/quiz?${params.toString()}`, { cache: 'no-store' })
      const json = (await res.json()) as QuizResponse
      if (!res.ok || !json.data) {
        throw new Error(json.error?.message || 'Quiz konnte nicht geladen werden')
      }
      setQuestions(json.data.questions)
      setCategories(json.data.categories)
      setSource(json.data.source)
      if (json.data.questions.length === 0) {
        setError('Keine Fragen in dieser Kategorie gefunden.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Quiz konnte nicht geladen werden')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(category)
  }, [load, category, runId])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  const current = questions[index]
  const currentAnswer = current ? answers[current.id] : undefined
  const finished = questions.length > 0 && Object.keys(answers).length === questions.length

  const score = useMemo(() => {
    const values = Object.values(answers)
    return { correct: values.filter((a) => a.correct).length, total: values.length }
  }, [answers])

  async function submitAnswer(answerText: string) {
    if (!current || currentAnswer || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: current.id, answerIndex: 0, answerText }),
      })
      const json = (await res.json()) as SubmitResponse
      if (!res.ok || !json.data) {
        throw new Error(json.error?.message || 'Antwort konnte nicht geprüft werden')
      }
      setAnswers((prev) => ({
        ...prev,
        [current.id]: {
          selectedText: answerText,
          correct: json.data!.correct,
          correctAnswerText: json.data!.correctAnswerText,
        },
      }))
      if (json.data.saved) {
        setSavedInfo({
          streak: json.data.streak,
          totalAnswered: json.data.totalAnswered,
          correctCount: json.data.correctCount,
        })
        setStats((prev) => ({
          authenticated: true,
          streak: json.data!.streak,
          bestStreak: Math.max(prev?.bestStreak ?? 0, json.data!.streak),
          totalAnswered: json.data!.totalAnswered,
          correctCount: json.data!.correctCount,
          accuracy: json.data!.totalAnswered > 0 ? Math.round((json.data!.correctCount / json.data!.totalAnswered) * 100) : 0,
        }))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Antwort konnte nicht geprüft werden')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 py-16 text-fc-fg/70">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Quiz wird geladen…</span>
        </CardContent>
      </Card>
    )
  }

  if (error && questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-fc-loss" role="alert">{error}</p>
          <Button className="mt-4" onClick={() => setRunId((v) => v + 1)}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <Card className="border-fc-border/70 bg-fc-surface/60">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fc-violet/15 ring-1 ring-fc-violet/25">
              <Trophy className="h-5 w-5 text-fc-violet" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-fc-fg">Dein Veilchen-Wissen</p>
              {statsLoading ? (
                <p className="text-xs text-fc-fg/55">Statistik wird geladen…</p>
              ) : stats?.authenticated ? (
                <p className="text-xs text-fc-fg/65">
                  {stats.correctCount}/{stats.totalAnswered} richtig · {stats.accuracy}% Trefferquote
                </p>
              ) : (
                <p className="text-xs text-fc-fg/55">Melde dich an, um Ergebnisse und Serien zu speichern.</p>
              )}
            </div>
          </div>
          {!statsLoading && stats?.authenticated ? (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Flame className="h-3.5 w-3.5 text-fc-violet" aria-hidden="true" />
                Serie {stats.streak}
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Target className="h-3.5 w-3.5" aria-hidden="true" />
                Bestwert {stats.bestStreak}
              </Badge>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" aria-hidden="true" />
            {questions.length} Fragen
          </Badge>
          {source === 'fallback' ? (
            <Badge variant="outline" className="border-fc-draw/35 text-fc-draw">Beispielfragen</Badge>
          ) : null}
        </div>
        <Button variant="outline" size="sm" onClick={() => setRunId((v) => v + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Neue Runde
        </Button>
      </div>

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Kategorie filtern">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet',
              category === 'all' ? 'bg-fc-violet text-white' : 'border border-fc-border bg-fc-surface text-fc-fg/80 hover:bg-fc-violet/10',
            )}
            aria-pressed={category === 'all'}
          >
            Alle
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet',
                category === c ? 'bg-fc-violet text-white' : 'border border-fc-border bg-fc-surface text-fc-fg/80 hover:bg-fc-violet/10',
              )}
              aria-pressed={category === c}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between text-sm text-fc-fg/65">
        <span>Frage {Math.min(index + 1, questions.length)} von {questions.length}</span>
        <span className="font-medium text-fc-fg">Punkte: {score.correct}/{score.total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-fc-border/50" aria-hidden="true">
        <div
          className="h-full rounded-full bg-fc-violet transition-[width] duration-300"
          style={{ width: `${questions.length ? (Object.keys(answers).length / questions.length) * 100 : 0}%` }}
        />
      </div>

      {error ? <p className="text-sm text-fc-loss" role="alert">{error}</p> : null}

      {current ? (
        <Card className="border-fc-border/80">
          <CardContent className="pt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {current.category ? <Badge variant="outline">{current.category}</Badge> : null}
            </div>
            <h2 className="mb-5 text-xl font-semibold leading-snug text-fc-fg">{current.question}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Antwort auswählen">
              {current.answers.map((answer) => {
                const isSelected = currentAnswer?.selectedText === answer.text
                const showCorrect = !!currentAnswer && answer.text === currentAnswer.correctAnswerText
                const showWrong = !!currentAnswer && isSelected && !currentAnswer.correct
                return (
                  <button
                    key={answer.text}
                    type="button"
                    disabled={!!currentAnswer || submitting}
                    onClick={() => void submitAnswer(answer.text)}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-[border-color,background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet disabled:cursor-default',
                      !currentAnswer && 'border-fc-border/80 bg-fc-surface/50 text-fc-fg hover:border-fc-violet/45 hover:bg-fc-violet/8 active:scale-[0.99]',
                      currentAnswer && !showCorrect && !showWrong && 'border-fc-border/60 bg-fc-surface/30 text-fc-fg/60',
                      showCorrect && 'border-fc-win/40 bg-fc-win/10 text-fc-fg',
                      showWrong && 'border-fc-loss/40 bg-fc-loss/10 text-fc-fg',
                    )}
                  >
                    <span>{answer.text}</span>
                    {showCorrect ? <CheckCircle2 className="h-5 w-5 shrink-0 text-fc-win" aria-label="Richtig" /> : null}
                    {showWrong ? <XCircle className="h-5 w-5 shrink-0 text-fc-loss" aria-label="Falsch" /> : null}
                  </button>
                )
              })}
            </div>

            {currentAnswer ? (
              <div
                className={cn(
                  'mt-5 rounded-xl border px-4 py-3 text-sm',
                  currentAnswer.correct ? 'border-fc-win/30 bg-fc-win/8 text-fc-fg' : 'border-fc-loss/30 bg-fc-loss/8 text-fc-fg',
                )}
                aria-live="polite"
              >
                {currentAnswer.correct ? 'Richtig!' : `Nicht ganz. Richtige Antwort: ${currentAnswer.correctAnswerText ?? '–'}`}
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
              >
                Zurück
              </Button>
              {index < questions.length - 1 ? (
                <Button onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={!currentAnswer}>
                  Nächste Frage
                </Button>
              ) : (
                <Button onClick={() => setIndex(questions.length - 1)} disabled={!currentAnswer}>
                  Ergebnis ansehen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {finished ? (
        <Card className="border-fc-violet/30 bg-fc-violet/5">
          <CardContent className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-fc-violet/15 ring-1 ring-fc-violet/25">
              <Trophy className="h-7 w-7 text-fc-violet" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-fc-fg">
              {score.correct} von {questions.length} richtig
            </h3>
            <p className="mt-2 text-fc-fg/70">
              {score.correct === questions.length
                ? 'Perfekt – echtes Veilchen-Wissen!'
                : score.correct >= Math.ceil(questions.length * 0.7)
                  ? 'Stark! Du kennst dich gut aus.'
                  : 'Weiter so – auf der Traditionsseite gibt es mehr zur Geschichte.'}
            </p>
            {(savedInfo || stats?.authenticated) ? (
              <p className="mt-3 text-sm text-fc-fg/65">
                {(savedInfo?.correctCount ?? stats?.correctCount ?? 0)}/{(savedInfo?.totalAnswered ?? stats?.totalAnswered ?? 0)} richtig gesamt · Serie {(savedInfo?.streak ?? stats?.streak ?? 0)}
              </p>
            ) : (
              <p className="mt-3 text-sm text-fc-fg/55">Melde dich an, um Ergebnisse und Serien zu speichern.</p>
            )}
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button onClick={() => setRunId((v) => v + 1)}>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Nochmal spielen
              </Button>
              <Button variant="outline" onClick={() => setIndex(0)}>Antworten ansehen</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
