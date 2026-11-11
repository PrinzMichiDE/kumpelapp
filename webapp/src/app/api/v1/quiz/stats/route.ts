import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
    if (!session?.user?.id) {
      return NextResponse.json(
        { data: { authenticated: false, streak: 0, bestStreak: 0, totalAnswered: 0, correctCount: 0, accuracy: 0 } },
        { headers: { 'Cache-Control': 'private, no-store' } },
      )
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { correct: true },
    })

    const totalAnswered = attempts.length
    const correctCount = attempts.filter((a) => a.correct).length

    let streak = 0
    for (const attempt of attempts) {
      if (!attempt.correct) break
      streak += 1
    }

    let bestStreak = 0
    let running = 0
    for (let i = attempts.length - 1; i >= 0; i -= 1) {
      if (attempts[i].correct) {
        running += 1
        if (running > bestStreak) bestStreak = running
      } else {
        running = 0
      }
    }

    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0

    return NextResponse.json(
      {
        data: {
          authenticated: true,
          streak,
          bestStreak,
          totalAnswered,
          correctCount,
          accuracy,
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    console.error('Quiz stats error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Quiz-Statistik konnte nicht geladen werden' } },
      { status: 500 },
    )
  }
}
