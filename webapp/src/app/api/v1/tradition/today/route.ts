import { NextResponse } from 'next/server'
import { getDailyHighlight, getUpcomingDatedEvents, aueHistoryEvents } from '@/lib/aue-history'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const highlight = getDailyHighlight(now)
    const upcoming = getUpcomingDatedEvents(now, 6).map(({ event, next }) => ({
      date: next.toISOString().slice(0, 10),
      label: `${String(next.getDate()).padStart(2, '0')}.${String(next.getMonth() + 1).padStart(2, '0')}.`,
      year: event.year,
      title: event.title,
      description: event.description,
      category: event.category ?? 'sonstiges',
    }))

    return NextResponse.json(
      {
        data: {
          date: now.toISOString().slice(0, 10),
          dateLabel: highlight.dateLabel,
          kind: highlight.kind,
          highlight: highlight.events[0]
            ? {
                year: highlight.events[0].year,
                title: highlight.events[0].title,
                description: highlight.events[0].description,
                category: highlight.events[0].category ?? 'sonstiges',
                month: highlight.events[0].month ?? null,
                day: highlight.events[0].day ?? null,
              }
            : null,
          todayEvents: highlight.kind === 'today' ? highlight.events : [],
          upcoming,
          totalMilestones: aueHistoryEvents.length,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
        },
      },
    )
  } catch (e) {
    console.error('tradition/today error', e)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Heutige Traditionsdaten nicht verfügbar' } },
      { status: 500 },
    )
  }
}
