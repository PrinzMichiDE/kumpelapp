import { NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'

export async function GET() {
  try {
    const [titles, records, legends] = await Promise.all([
      prisma.title.findMany({ orderBy: { year: 'asc' } }),
      prisma.seasonRecord.findMany({ orderBy: [{ label: 'asc' }] }),
      prisma.player.findMany({ where: { isLegend: true }, orderBy: [{ eraFrom: 'asc' }] }),
    ])
    const timeline = [
      ...records.map(r => ({ type: 'record', id: r.id, label: r.label, title: r.leagueName, description: r.note, tier: r.tier, position: r.position })),
      ...titles.map(t => ({ type: 'title', id: t.id, label: String(t.year), title: t.competition, description: t.note, year: t.year })),
    ].sort((a,b) => String(a.label).localeCompare(String(b.label)))
    return NextResponse.json({ data: { timeline, titles, records, legends } }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Traditionsdaten nicht verfügbar' } }, { status: 503 })
  }
}
