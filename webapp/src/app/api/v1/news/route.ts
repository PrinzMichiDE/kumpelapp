import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { NewsListDto, NewsQuery } from '@kumpelapp/api-contracts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = NewsQuery.safeParse({
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      cursor: searchParams.get('cursor') ?? undefined,
      source: searchParams.get('source') ?? undefined,
      category: searchParams.get('category') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Ungültige Parameter', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const { limit = 20, cursor, source, category } = parsed.data

    const rows = await prisma.newsItem.findMany({
      where: {
        ...(source ? { source } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const data = NewsListDto.parse(
      rows.map((r) => ({
        id: r.id,
        externalUrl: r.externalUrl,
        title: r.title,
        excerpt: r.excerpt,
        imageUrl: r.imageUrl,
        publishedAt: r.publishedAt.toISOString(),
        source: r.source,
        category: r.category,
      }))
    )

    const nextCursor = rows.length === Math.min(Math.max(limit, 1), 100) ? rows[rows.length - 1]?.id ?? null : null

    return NextResponse.json(
      { data, nextCursor },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } }
    )
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'News konnten nicht geladen werden' } },
      { status: 503 }
    )
  }
}
