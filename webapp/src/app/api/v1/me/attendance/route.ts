import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const matchId = String(body?.matchId || '')
  const status = String(body?.status || 'GOING') as any
  if (!matchId) return NextResponse.json({ error: { code: 'INVALID' } }, { status: 400 })
  const data = await prisma.attendance.upsert({
    where: { userId_matchId: { userId: session.user.id, matchId } },
    update: { status, note: body?.note ?? null },
    create: { userId: session.user.id, matchId, status, note: body?.note ?? null },
  })
  return NextResponse.json({ data })
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ data: [], auth: false })
  const { searchParams } = new URL(request.url)
  const matchId = searchParams.get('matchId')
  const data = await prisma.attendance.findMany({
    where: { userId: session.user.id, ...(matchId ? { matchId } : {}) },
    include: { match: true },
    orderBy: { id: 'desc' },
  })
  return NextResponse.json({ data, auth: true })
}
