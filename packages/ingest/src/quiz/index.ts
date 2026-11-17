import { promises as fs } from 'fs'
import path from 'path'
import { prisma, ReviewStatus } from '@kumpelapp/db'

export interface QuizIngestResult {
  created: number
  updated: number
  errors: string[]
  items: number
}

type SeedQuiz = {
  question: string
  answers: Array<{ text: string; correct: boolean }>
  category?: string | null
  generatedBy?: string | null
  sourceRef?: string | null
  reviewStatus?: string | null
}

async function readSeedFile(): Promise<SeedQuiz[]> {
  const candidates = [
    path.join(process.cwd(), 'tooling', 'seed-data', 'quiz-veilchen.json'),
    path.join(process.cwd(), 'seed-data', 'quiz-veilchen.json'),
  ]
  for (const file of candidates) {
    try {
      const raw = await fs.readFile(file, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as SeedQuiz[]
    } catch {
      // try next
    }
  }
  throw new Error('Seed-Datei quiz-veilchen.json nicht gefunden')
}

function asReviewStatus(value?: string | null): ReviewStatus {
  if (value === 'CHECKED' || value === 'DRAFT' || value === 'AUTO') return value
  return 'AUTO'
}

function normalizeAnswers(answers: SeedQuiz['answers']) {
  const cleaned = (answers || [])
    .map((a) => ({ text: String(a?.text ?? '').trim(), correct: Boolean(a?.correct) }))
    .filter((a) => a.text.length > 0)
  const correctCount = cleaned.filter((a) => a.correct).length
  return { cleaned, correctCount }
}

export async function generateQuiz(): Promise<QuizIngestResult> {
  const startedAt = Date.now()
  const result: QuizIngestResult = { created: 0, updated: 0, errors: [], items: 0 }
  try {
    const questions = await readSeedFile()
    result.items = questions.length

    for (const q of questions) {
      try {
        const question = String(q.question || '').trim()
        if (!question) {
          result.errors.push('Frage ohne Text übersprungen')
          continue
        }
        const { cleaned, correctCount } = normalizeAnswers(q.answers)
        if (cleaned.length < 2 || correctCount !== 1) {
          result.errors.push(`Ungültige Antworten für Frage: ${question.slice(0, 80)}`)
          continue
        }

        const existing = await prisma.quizQuestion.findFirst({ where: { question } })
        const data = {
          question,
          answers: cleaned,
          category: q.category ?? null,
          active: true,
          generatedBy: q.generatedBy ?? 'seed',
          sourceRef: q.sourceRef ?? null,
          reviewStatus: asReviewStatus(q.reviewStatus),
        }

        if (existing) {
          await prisma.quizQuestion.update({ where: { id: existing.id }, data })
          result.updated++
        } else {
          await prisma.quizQuestion.create({ data })
          result.created++
        }
      } catch (e) {
        result.errors.push(`${q?.question?.slice(0, 60) || 'question'}: ${String(e)}`)
      }
    }

    await prisma.sourceSyncLog.create({
      data: {
        source: 'quiz',
        ok: result.errors.length === 0,
        durationMs: Date.now() - startedAt,
        items: result.created + result.updated,
        message: `Quiz synchronisiert: ${result.created} neu, ${result.updated} aktualisiert, ${result.errors.length} Fehler (${questions.length} Seed-Fragen).`,
      },
    }).catch(() => null)

    return result
  } catch (error) {
    result.errors.push(String(error))
    await prisma.sourceSyncLog.create({
      data: {
        source: 'quiz',
        ok: false,
        durationMs: Date.now() - startedAt,
        items: 0,
        message: `Quiz-Sync fehlgeschlagen: ${String(error).slice(0, 500)}`,
      },
    }).catch(() => null)
    return result
  }
}

export async function ingestQuiz(): Promise<QuizIngestResult> {
  return generateQuiz()
}
