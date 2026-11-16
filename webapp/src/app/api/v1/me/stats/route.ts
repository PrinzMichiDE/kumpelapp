import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
    if (!session?.user?.id) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Anmeldung erforderlich' } }, { status: 401 })
    }

    const userId = session.user.id

    const [tipAgg, tipCount, tipScoredCount, quizAttempts, attendanceAgg, venueGroups, voteCount, favoriteCount, groupCount] = await Promise.all([
      prisma.tip.aggregate({ where: { userId, points: { not: null } }, _sum: { points: true }, _count: { _all: true } }),
      prisma.tip.count({ where: { userId } }),
      prisma.tip.count({ where: { userId, points: { not: null } } }),
      prisma.quizAttempt.findMany({ where: { userId }, select: { correct: true }, orderBy: { createdAt: 'desc' } }),
      prisma.attendance.groupBy({ by: ['status'], where: { userId }, _count: { _all: true } }),
      prisma.venueVisit.groupBy({ by: ['venueId'], where: { userId } }),
      prisma.matchVote.count({ where: { userId } }),
      prisma.favorite.count({ where: { userId } }),
      prisma.groupMember.count({ where: { userId } }),
    ])

    const totalPoints = tipAgg._sum.points ?? 0
    const exactTips = await prisma.tip.count({ where: { userId, points: 3 } }).catch(() => 0)

    const quizTotal = quizAttempts.length
    const quizCorrect = quizAttempts.filter((a) => a.correct).length
    let quizStreak = 0
    for (const a of quizAttempts) {
      if (!a.correct) break
      quizStreak += 1
    }

    const attendance = {
      going: 0,
      maybe: 0,
      notGoing: 0,
      total: 0,
    }
    for (const row of attendanceAgg) {
      const c = row._count._all
      attendance.total += c
      if (row.status === 'GOING') attendance.going = c
      else if (row.status === 'MAYBE') attendance.maybe = c
      else if (row.status === 'NOT_GOING') attendance.notGoing = c
    }

    return NextResponse.json({
      data: {
        tippspiel: {
          totalTips: tipCount,
          scoredTips: tipScoredCount,
          totalPoints,
          exactTips,
          averagePoints: tipScoredCount > 0 ? Number((totalPoints / tipScoredCount).toFixed(3)) : 0,
        },
        quiz: {
          attempts: quizTotal,
          correct: quizCorrect,
          accuracy: quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0,
          currentStreak: quizStreak,
        },
        attendance,
        stadiums: {
          uniqueVisited: venueGroups.length,
        },
        community: {
          votes: voteCount,
          favorites: favoriteCount,
          groups: groupCount,
        },
      },
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    console.error('me/stats error', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Statistik konnte nicht geladen werden' } }, { status: 500 })
  }
}
