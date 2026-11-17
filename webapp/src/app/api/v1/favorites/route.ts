import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ data: [] })
  const data = await prisma.favorite.findMany({ where: { userId: session.user.id }, orderBy: { id: 'desc' } })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const type = String(body?.type || '').toUpperCase()
  const refId = String(body?.refId || '')
  if (!type || !refId) return NextResponse.json({ error: { code: 'INVALID' } }, { status: 400 })
  const fav = await prisma.favorite.upsert({
    where: { userId_type_refId: { userId: session.user.id, type: type as any, refId } },
    update: {},
    create: { userId: session.user.id, type: type as any, refId },
  })
  return NextResponse.json({ data: fav }, { status: 201 })
}
