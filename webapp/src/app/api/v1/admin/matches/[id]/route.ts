import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'
import { scoreTip } from '@kumpelapp/domain'

const ALLOWED_STATUS = new Set(['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED', 'ABANDONED'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || (session.user.role !== 'EDITOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Keine Berechtigung' } }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const before = await prisma.match.findUnique({ where: { id } })
    if (!before) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Spiel nicht gefunden' } }, { status: 404 })

    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
    const sourceRef = typeof body.sourceRef === 'string' ? body.sourceRef.trim() : ''
    const data: any = {}
    if (typeof body.kickoff === 'string' && body.kickoff) {
      const d = new Date(body.kickoff)
      if (Number.isNaN(d.getTime())) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Ungültiger Anstoß-Zeitpunkt' } }, { status: 400 })
      data.kickoff = d
    }
    if (typeof body.status === 'string') {
      if (!ALLOWED_STATUS.has(body.status)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Ungültiger Status' } }, { status: 400 })
      data.status = body.status
    }
    if (body.matchday === null || Number.isInteger(Number(body.matchday))) data.matchday = body.matchday === null ? null : Number(body.matchday)
    if (body.homeGoals === null || Number.isInteger(Number(body.homeGoals))) data.homeGoals = body.homeGoals === null ? null : Number(body.homeGoals)
    if (body.awayGoals === null || Number.isInteger(Number(body.awayGoals))) data.awayGoals = body.awayGoals === null ? null : Number(body.awayGoals)
    if (body.halftimeHome === null || Number.isInteger(Number(body.halftimeHome))) data.halftimeHome = body.halftimeHome === null ? null : Number(body.halftimeHome)
    if (body.halftimeAway === null || Number.isInteger(Number(body.halftimeAway))) data.halftimeAway = body.halftimeAway === null ? null : Number(body.halftimeAway)
    if (body.attendance === null || Number.isInteger(Number(body.attendance))) data.attendance = body.attendance === null ? null : Number(body.attendance)
    if (typeof body.editorNote === 'string' || body.editorNote === null) data.editorNote = body.editorNote
    if (typeof body.venueId === 'string' || body.venueId === null) data.venueId = body.venueId || null

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Keine Änderungen übergeben' } }, { status: 400 })
    }

    const updated = await prisma.match.update({ where: { id }, data })

    if (updated.status === 'FINISHED' && updated.homeGoals != null && updated.awayGoals != null) {
      const tips = await prisma.tip.findMany({ where: { matchId: id } })
      await Promise.all(
        tips.map((tip) =>
          prisma.tip.update({
            where: { id: tip.id },
            data: { points: scoreTip({ homeGoals: tip.homeGoals, awayGoals: tip.awayGoals }, { homeGoals: updated.homeGoals!, awayGoals: updated.awayGoals! }) },
          }),
        ),
      )
    }

    const payload = {
      before: { kickoff: before.kickoff, status: before.status, homeGoals: before.homeGoals, awayGoals: before.awayGoals, halftimeHome: before.halftimeHome, halftimeAway: before.halftimeAway, matchday: before.matchday, venueId: before.venueId, editorNote: before.editorNote },
      after: data,
      reason: reason || null,
      sourceRef: sourceRef || null,
      actor: { id: session.user.id, email: session.user.email ?? null },
    }

    await Promise.all([
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'MATCH_OVERRIDE',
          entity: 'Match',
          entityId: id,
          payload,
        },
      }).catch(() => null),
      prisma.sourceSyncLog.create({
        data: {
          source: 'admin-override',
          ok: true,
          durationMs: 0,
          items: 1,
          message: `Match ${id} korrigiert (${session.user.email || session.user.id})${reason ? ` – ${reason}` : ''}`.slice(0, 500),
        },
      }).catch(() => null),
    ])

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Admin match override error', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Korrektur fehlgeschlagen' } }, { status: 500 })
  }
}