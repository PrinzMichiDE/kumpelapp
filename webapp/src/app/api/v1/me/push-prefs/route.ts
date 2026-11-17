import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

const categories = ['KICKOFF','GOAL','RESULT','NEWS','GROUP','TICKETS'] as const
const keyMap: Record<string, (typeof categories)[number]> = { kickoff:'KICKOFF', goal:'GOAL', result:'RESULT', news:'NEWS', group:'GROUP', tickets:'TICKETS' }

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Nicht angemeldet' } }, { status: 401 })
  const [prefs, user] = await Promise.all([
    prisma.pushPref.findMany({ where: { userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { quietFrom: true, quietTo: true } }),
  ])
  const data: any = { quietFrom: user?.quietFrom ?? null, quietTo: user?.quietTo ?? null }
  for (const [k, cat] of Object.entries(keyMap)) data[k] = prefs.find(p => p.category === cat)?.enabled ?? true
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Nicht angemeldet' } }, { status: 401 })
  try {
    const body = await request.json()
    const quietFrom = body.quietFrom == null ? null : Math.max(0, Math.min(23, Number(body.quietFrom)))
    const quietTo = body.quietTo == null ? null : Math.max(0, Math.min(23, Number(body.quietTo)))
    await prisma.user.update({ where: { id: session.user.id }, data: { quietFrom, quietTo } })
    for (const [k, cat] of Object.entries(keyMap)) {
      const enabled = body[k] !== false
      await prisma.pushPref.upsert({
        where: { userId_category: { userId: session.user.id, category: cat as any } },
        update: { enabled },
        create: { userId: session.user.id, category: cat as any, enabled },
      })
    }
    return NextResponse.json({ data: { ok: true } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message: 'Speichern fehlgeschlagen' } }, { status: 500 })
  }
}
