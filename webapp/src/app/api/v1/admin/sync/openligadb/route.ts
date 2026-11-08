import { NextRequest, NextResponse } from 'next/server'
import { syncOpenLigaDB } from '@kumpelapp/ingest'
import { auth } from '@kumpelapp/auth'
import { prisma } from '@kumpelapp/db'

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

    const body = await request.json().catch(() => ({}))
    const season = body.season // optional, e.g., "2026"

    console.log(`Manual OpenLigaDB sync triggered by ${session.user.email} for season ${season || 'current'}`)

    const result = await syncOpenLigaDB(season)

    return NextResponse.json({
      success: true,
      data: {
        matches: { created: result.matches.created, updated: result.matches.updated },
        standings: { created: result.standings.created, updated: result.standings.updated },
        errors: result.errors.length,
        errorDetails: result.errors.slice(0, 10),
      },
    })

  } catch (error) {
    console.error('OpenLigaDB sync error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Sync fehlgeschlagen' } },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: new Headers() })
    
    if (!session || (session.user.role !== 'EDITOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Keine Berechtigung' } },
        { status: 403 }
      )
    }

    const logs = await prisma.sourceSyncLog.findMany({
      where: { source: 'openligadb' },
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