import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'
import { QuizSubmit } from '@kumpelapp/api-contracts'
import { FALLBACK_QUESTIONS, parseAnswers } from '../route'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = QuizSubmit.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Ungültige Anfrage', details: parsed.error.flatten() } },
        { status: 400 },
      )
    }

    const { questionId, answerIndex } = parsed.data

    let answers: { text: string; correct: boolean }[] | null = null
    let isFallback = false

    if (questionId.startsWith('fallback-')) {
      const fallback = FALLBACK_QUESTIONS.find((q) => q.id === questionId)
      answers = fallback?.answers ?? null
      isFallback = true
    } else {
      const question = await prisma.quizQuestion.findUnique({
        where: { id: questionId },
        select: { answers: true, active: true },
      })
      if (!question || !question.active) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Frage nicht gefunden' } },
          { status: 404 },
        )
      }
      answers = parseAnswers(question.answers)
    }

    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Frage nicht gefunden' } },
        { status: 404 },
      )
    }

    if (answerIndex < 0 || answerIndex >= answers.length) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Antwortindex ungültig' } },
        { status: 400 },
      )
    }

    // Client receives shuffled answer texts; grade by submitted answer text (robust across shuffles).
    const answerText = typeof body?.answerText === 'string' ? body.answerText.trim() : null
    const matched = answerText
      ? answers.find((a) => a.text.trim() === answerText)
      : null
    if (!matched) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Antworttext fehlt oder ist ungültig' } },
        { status: 400 },
      )
    }
    const correct = matched.correct === true
    const correctAnswerIndex = answers.findIndex((a) => a.correct)

    let streak = 0
    let totalAnswered = 0
    let correctCount = 0
    let saved = false

    if (!isFallback) {
      const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
      if (session?.user?.id) {
        await prisma.quizAttempt.create({
          data: { userId: session.user.id, questionId, correct },
        })
        saved = true

        const attempts = await prisma.quizAttempt.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 100,
          select: { correct: true },
        })
        totalAnswered = attempts.length
        correctCount = attempts.filter((a) => a.correct).length
        for (const attempt of attempts) {
          if (!attempt.correct) break
          streak += 1
        }
      }
    }

    return NextResponse.json({
      data: {
        correct,
        correctAnswerIndex,
        correctAnswerText: correctAnswerIndex >= 0 ? answers[correctAnswerIndex].text : null,
        streak,
        totalAnswered,
        correctCount,
        saved,
      },
    })
  } catch (error) {
    console.error('Quiz submit error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Antwort konnte nicht gespeichert werden' } },
      { status: 500 },
    )
  }
}
