import { promises as fs } from 'fs'
import path from 'path'
import { prisma, ReviewStatus } from '@kumpelapp/db'

export interface TraditionIngestResult {
  created: number
  updated: number
  errors: string[]
  items: number
}

type SeedData = {
  titles?: Array<{
    year: number
    competition: string
    note?: string | null
    reviewStatus?: string | null
    source?: string | null
    sourceUrl?: string | null
    attribution?: string | null
  }>
  seasonRecords?: Array<{
    label: string
    leagueName: string
    tier?: number | null
    position?: number | null
    points?: number | null
    note?: string | null
    reviewStatus?: string | null
    source?: string | null
    sourceUrl?: string | null
    attribution?: string | null
  }>
}

async function readSeedFile(): Promise<SeedData> {
  const candidates = [
    path.join(process.cwd(), 'tooling', 'seed-data', 'tradition-timeline.json'),
    path.join(process.cwd(), 'seed-data', 'tradition-timeline.json'),
  ]
  for (const file of candidates) {
    try {
      const raw = await fs.readFile(file, 'utf8')
      return JSON.parse(raw) as SeedData
    } catch {
      // try next
    }
  }
  throw new Error('Seed-Datei tradition-timeline.json nicht gefunden')
}

function asReviewStatus(value?: string | null): ReviewStatus {
  if (value === 'CHECKED' || value === 'DRAFT' || value === 'AUTO') return value
  return 'AUTO'
}

export async function ingestTraditions(): Promise<TraditionIngestResult> {
  const startedAt = Date.now()
  const result: TraditionIngestResult = { created: 0, updated: 0, errors: [], items: 0 }
  try {
    const seed = await readSeedFile()
    const titles = seed.titles || []
    const records = seed.seasonRecords || []
    result.items = titles.length + records.length

    const aue = await prisma.team.findFirst({ where: { isOwn: true }, select: { id: true } }).catch(() => null)

    for (const t of titles) {
      try {
        if (!Number.isInteger(t.year) || !t.competition) {
          result.errors.push(`Ungültiger Titel-Eintrag: ${JSON.stringify(t).slice(0, 120)}`)
          continue
        }
        const existing = await prisma.title.findFirst({ where: { year: t.year, competition: t.competition } })
        const data = {
          year: t.year,
          competition: t.competition,
          note: t.note ?? null,
          teamId: aue?.id ?? null,
          reviewStatus: asReviewStatus(t.reviewStatus),
          source: t.source ?? 'seed',
          sourceUrl: t.sourceUrl ?? null,
          attribution: t.attribution ?? null,
        }
        if (existing) {
          await prisma.title.update({ where: { id: existing.id }, data })
          result.updated++
        } else {
          await prisma.title.create({ data })
          result.created++
        }
      } catch (e) {
        result.errors.push(`title ${t?.year}/${t?.competition}: ${String(e)}`)
      }
    }

    for (const r of records) {
      try {
        if (!r.label || !r.leagueName) {
          result.errors.push(`Ungültiger Saisonrekord: ${JSON.stringify(r).slice(0, 120)}`)
          continue
        }
        const existing = await prisma.seasonRecord.findFirst({ where: { label: r.label, leagueName: r.leagueName } })
        const data = {
          label: r.label,
          leagueName: r.leagueName,
          tier: typeof r.tier === 'number' ? r.tier : null,
          position: typeof r.position === 'number' ? r.position : null,
          points: typeof r.points === 'number' ? r.points : null,
          note: r.note ?? null,
          teamId: aue?.id ?? null,
          reviewStatus: asReviewStatus(r.reviewStatus),
          source: r.source ?? 'seed',
          sourceUrl: r.sourceUrl ?? null,
          attribution: r.attribution ?? null,
        }
        if (existing) {
          await prisma.seasonRecord.update({ where: { id: existing.id }, data })
          result.updated++
        } else {
          await prisma.seasonRecord.create({ data })
          result.created++
        }
      } catch (e) {
        result.errors.push(`record ${r?.label}: ${String(e)}`)
      }
    }

    await prisma.sourceSyncLog.create({
      data: {
        source: 'traditions',
        ok: result.errors.length === 0,
        durationMs: Date.now() - startedAt,
        items: result.created + result.updated,
        message: `Tradition synchronisiert: ${result.created} neu, ${result.updated} aktualisiert, ${result.errors.length} Fehler (Titel ${titles.length}, Saisonrekorde ${records.length}).`,
      },
    }).catch(() => null)

    return result
  } catch (error) {
    result.errors.push(String(error))
    await prisma.sourceSyncLog.create({
      data: {
        source: 'traditions',
        ok: false,
        durationMs: Date.now() - startedAt,
        items: 0,
        message: `Traditions-Sync fehlgeschlagen: ${String(error).slice(0, 500)}`,
      },
    }).catch(() => null)
    return result
  }
}
