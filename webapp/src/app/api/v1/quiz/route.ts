import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { z } from 'zod'

type StoredAnswer = { text: string; correct: boolean }

export type QuizPublicQuestion = {
  id: string
  question: string
  answers: { text: string }[]
  category: string | null
}

const FALLBACK_QUESTIONS: Array<{
  id: string
  question: string
  answers: StoredAnswer[]
  category: string
}> = [
  {
    id: 'fallback-1959',
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
    id: 'fallback-pokal',
    question: 'Wie oft gewann Aue den FDGB-Pokal?',
    answers: [
      { text: '1× (1955)', correct: true },
      { text: '2×', correct: false },
      { text: '3×', correct: false },
      { text: 'Nie', correct: false },
    ],
    category: 'Titel',
  },
  {
    id: 'fallback-stadion',
    question: 'Wie heißt das Heimstadion des FC Erzgebirge Aue?',
    answers: [
      { text: 'Erzgebirgsstadion', correct: true },
      { text: 'Stadion der Freundschaft', correct: false },
      { text: 'Ernst-Abbe-Sportfeld', correct: false },
      { text: 'Rudolf-Harbig-Stadion', correct: false },
    ],
    category: 'Verein',
  },
  {
    id: 'fallback-stadt',
    question: 'In welcher Stadt ist der FC Erzgebirge Aue zu Hause?',
    answers: [
      { text: 'Aue-Bad Schlema', correct: true },
      { text: 'Chemnitz', correct: false },
      { text: 'Zwickau', correct: false },
      { text: 'Annaberg-Buchholz', correct: false },
    ],
    category: 'Verein',
  },
  {
    id: 'fallback-liga',
    question: 'In welcher Liga spielt der FC Erzgebirge Aue in der Saison 2026/27?',
    answers: [
      { text: 'Regionalliga Nordost', correct: true },
      { text: '3. Liga', correct: false },
      { text: '2. Bundesliga', correct: false },
      { text: 'Oberliga Nordost', correct: false },
    ],
    category: 'Saison 2026/27',
  },
  {
    id: 'fallback-gruendung',
    question: 'In welchem Jahr wurde der Vorgängerverein SG Aue gegründet?',
    answers: [
      { text: '1946', correct: true },
      { text: '1950', correct: false },
      { text: '1949', correct: false },
      { text: '1951', correct: false },
    ],
    category: 'Geschichte',
  },
  {
    id: 'fallback-meistertitel',
    question: 'Wie viele DDR-Meistertitel gewann Aue?',
    answers: [
      { text: '3', correct: true },
      { text: '2', correct: false },
      { text: '4', correct: false },
      { text: '1', correct: false },
    ],
    category: 'Titel',
  },
  {
    id: 'fallback-wismut',
    question: 'Unter welchem Namen trat der Verein von 1951 bis 1990 an?',
    answers: [
      { text: 'BSG/SC Wismut Aue bzw. Karl-Marx-Stadt', correct: true },
      { text: 'BSG Stahl Aue', correct: false },
      { text: 'FC Wismut Erzgebirge', correct: false },
      { text: 'SG Dynamo Aue', correct: false },
    ],
    category: 'Geschichte',
  },
]

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(25).default(10),
  category: z.string().trim().min(1).optional(),
})

function parseAnswers(value: unknown): StoredAnswer[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const record = item as Record<string, unknown>
    if (typeof record.text !== 'string') return []
    return [{ text: record.text, correct: record.correct === true }]
  })
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function toPublicQuestion(q: { id: string; question: string; answers: unknown; category: string | null }): QuizPublicQuestion | null {
  const answers = parseAnswers(q.answers)
  if (answers.length < 2) return null
  return {
    id: q.id,
    question: q.question,
    category: q.category,
    answers: shuffle(answers).map(({ text }) => ({ text })),
  }
}

export async function GET(request: NextRequest) {
  try {
    const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()))
    const { limit, category } = parsed.success ? parsed.data : { limit: 10, category: undefined }

    const where = { active: true, ...(category ? { category } : {}) }
    const [dbQuestions, categoriesRaw] = await Promise.all([
      prisma.quizQuestion.findMany({
        where,
        select: { id: true, question: true, answers: true, category: true },
        take: Math.max(limit * 3, 20),
        orderBy: { id: 'asc' },
      }),
      prisma.quizQuestion.findMany({
        where: { active: true },
        select: { category: true },
        distinct: ['category'],
      }),
    ])

    const dbPublic = shuffle(dbQuestions)
      .map(toPublicQuestion)
      .filter((q): q is QuizPublicQuestion => q !== null)
      .slice(0, limit)

    if (dbPublic.length > 0) {
      const categories = categoriesRaw
        .map((c) => c.category)
        .filter((c): c is string => typeof c === 'string' && c.length > 0)
        .sort((a, b) => a.localeCompare(b, 'de'))

      return NextResponse.json(
        { data: { questions: dbPublic, categories, source: 'database' as const } },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const fallback = shuffle(FALLBACK_QUESTIONS)
      .filter((q) => !category || q.category === category)
      .slice(0, limit)
      .map((q) => ({
        id: q.id,
        question: q.question,
        category: q.category,
        answers: shuffle(q.answers).map(({ text }) => ({ text })),
      }))

    const categories = Array.from(new Set(FALLBACK_QUESTIONS.map((q) => q.category))).sort((a, b) => a.localeCompare(b, 'de'))

    return NextResponse.json(
      { data: { questions: fallback, categories, source: 'fallback' as const } },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('Quiz GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Quiz konnte nicht geladen werden' } },
      { status: 500 },
    )
  }
}

export { FALLBACK_QUESTIONS, parseAnswers }
