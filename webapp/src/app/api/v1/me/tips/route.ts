import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'
import { scoreTip } from '@kumpelapp/domain'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const ct = request.headers.get('content-type') || ''
  const isForm = ct.includes('form')
  if (!session?.user?.id) {
    if (isForm) return NextResponse.redirect(new URL('/login?callbackUrl=/tippspiel', request.url), 303)
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Nicht angemeldet' } }, { status: 401 })
  }
  try {
    let matchId = '', homeGoals = 0, awayGoals = 0
    if (ct.includes('application/json')) {
      const body = await request.json()
      matchId = String(body?.matchId || '')
      homeGoals = Number(body?.homeGoals)
      awayGoals = Number(body?.awayGoals)
    } else {
      const form = await request.formData()
      matchId = String(form.get('matchId') || '')
      homeGoals = Number(form.get('homeGoals'))
      awayGoals = Number(form.get('awayGoals'))
    }
    if (!matchId || !Number.isInteger(homeGoals) || !Number.isInteger(awayGoals) || homeGoals < 0 || awayGoals < 0) {
      if (isForm) return NextResponse.redirect(new URL('/tippspiel?error=invalid', request.url), 303)
      return NextResponse.json({ error: { code: 'INVALID', message: 'Ungültiger Tipp' } }, { status: 400 })
    }
    const match = await prisma.match.findUnique({ where: { id: matchId } })
    if (!match) {
      if (isForm) return NextResponse.redirect(new URL('/tippspiel?error=match', request.url), 303)
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Spiel nicht gefunden' } }, { status: 404 })
    }
    if (new Date(match.kickoff).getTime() <= Date.now() || ['FINISHED','LIVE'].includes(match.status)) {
      if (isForm) return NextResponse.redirect(new URL('/tippspiel?error=locked', request.url), 303)
      return NextResponse.json({ error: { code: 'LOCKED', message: 'Tipp nicht mehr möglich' } }, { status: 409 })
    }
    let points: number | null = null
    if (match.status === 'FINISHED' && match.homeGoals != null && match.awayGoals != null) {
      points = scoreTip({ homeGoals, awayGoals }, { homeGoals: match.homeGoals, awayGoals: match.awayGoals })
    }
    const tip = await prisma.tip.upsert({
      where: { userId_matchId: { userId: session.user.id, matchId } },
      update: { homeGoals, awayGoals, points },
      create: { userId: session.user.id, matchId, homeGoals, awayGoals, points },
    })
    if (isForm) return NextResponse.redirect(new URL('/tippspiel?saved=1', request.url), 303)
    return NextResponse.json({ data: tip })
  } catch (e) {
    console.error(e)
    if (isForm) return NextResponse.redirect(new URL('/tippspiel?error=server', request.url), 303)
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message: 'Tipp konnte nicht gespeichert werden' } }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ data: [] })
  const tips = await prisma.tip.findMany({ where: { userId: session.user.id }, include: { match: { include: { homeTeam: true, awayTeam: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ data: tips })
}
