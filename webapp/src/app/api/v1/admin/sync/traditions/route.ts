import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@kumpelapp/auth'
import { prisma } from '@kumpelapp/db'
import { ingestTraditions } from '@kumpelapp/ingest'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Nicht angemeldet' } },
        { status: 401 }
      )
    }

    if (session.user.role !== 'EDITOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Keine Berechtigung' } },
        { status: 403 }
      )
    }

    console.log(`Manual Traditions sync triggered by ${session.user.email}`)
    const result = await ingestTraditions()
    return NextResponse.json({
      success: true,
      data: {
        message: 'Traditionsdaten (Seed) synchronisiert',
        created: result.created,
        updated: result.updated,
        items: result.items,
        errors: result.errors.length,
        errorDetails: result.errors.slice(0, 10),
      },
    })
  } catch (error) {
    console.error('Traditions sync error:', error)
    await prisma.sourceSyncLog.create({
      data: {
        source: 'traditions',
        ok: false,
        durationMs: 0,
        items: 0,
        message: `Admin-Sync fehlgeschlagen: ${String(error).slice(0, 500)}`,
      },
    }).catch(() => null)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Sync fehlgeschlagen' } },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session || (session.user.role !== 'EDITOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Keine Berechtigung' } },
        { status: 403 }
      )
    }

    const logs = await prisma.sourceSyncLog.findMany({
      where: { source: 'traditions' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ data: logs })
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Fehler beim Laden der Logs' } },
      { status: 500 }
    )
  }
}