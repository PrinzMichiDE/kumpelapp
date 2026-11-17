import { promises as fs } from 'fs'
import path from 'path'
import { prisma, ReviewStatus } from '@kumpelapp/db'

export interface VenueIngestResult {
  created: number
  updated: number
  errors: string[]
  items: number
}

type SeedVenue = {
  slug: string
  name: string
  city: string
  address?: string | null
  lat?: number | null
  lng?: number | null
  capacity?: number | null
  distanceKm?: number | null
  travelMinutesCar?: number | null
  awayBlockInfo?: string | null
  travelCar?: string | null
  travelTrain?: string | null
  parkingInfo?: string | null
  website?: string | null
  imageUrl?: string | null
  reviewStatus?: string | null
  source?: string | null
  sourceUrl?: string | null
  attribution?: string | null
}

async function readSeedFile(): Promise<SeedVenue[]> {
  const candidates = [
    path.join(process.cwd(), 'tooling', 'seed-data', 'venues-rlno-2026-27.json'),
    path.join(process.cwd(), 'seed-data', 'venues-rlno-2026-27.json'),
  ]
  for (const file of candidates) {
    try {
      const raw = await fs.readFile(file, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as SeedVenue[]
    } catch {
      // try next
    }
  }
  throw new Error('Seed-Datei venues-rlno-2026-27.json nicht gefunden')
}

function asReviewStatus(value?: string | null): ReviewStatus {
  if (value === 'CHECKED' || value === 'DRAFT' || value === 'AUTO') return value
  return 'AUTO'
}

export async function ingestVenues(): Promise<VenueIngestResult> {
  const startedAt = Date.now()
  const result: VenueIngestResult = { created: 0, updated: 0, errors: [], items: 0 }
  try {
    const venues = await readSeedFile()
    result.items = venues.length
    for (const v of venues) {
      try {
        if (!v?.slug || !v?.name || !v?.city) {
          result.errors.push(`Ungültiger Venue-Eintrag: ${JSON.stringify(v).slice(0, 120)}`)
          continue
        }
        const existing = await prisma.venue.findUnique({ where: { slug: v.slug } })
        const data = {
          slug: v.slug,
          name: v.name,
          city: v.city,
          address: v.address ?? null,
          lat: typeof v.lat === 'number' ? v.lat : null,
          lng: typeof v.lng === 'number' ? v.lng : null,
          capacity: typeof v.capacity === 'number' ? v.capacity : null,
          distanceKm: typeof v.distanceKm === 'number' ? v.distanceKm : null,
          travelMinutesCar: typeof v.travelMinutesCar === 'number' ? v.travelMinutesCar : null,
          awayBlockInfo: v.awayBlockInfo ?? null,
          travelCar: v.travelCar ?? null,
          travelTrain: v.travelTrain ?? null,
          parkingInfo: v.parkingInfo ?? null,
          website: v.website || null,
          imageUrl: v.imageUrl ?? null,
          reviewStatus: asReviewStatus(v.reviewStatus),
          source: v.source ?? 'seed-rlno-2026-27',
          sourceUrl: v.sourceUrl ?? null,
          attribution: v.attribution ?? null,
          fetchedAt: existing?.fetchedAt ?? new Date(),
        }
        if (existing) {
          await prisma.venue.update({ where: { id: existing.id }, data })
          result.updated++
        } else {
          await prisma.venue.create({ data })
          result.created++
        }
      } catch (e) {
        result.errors.push(`${v?.slug || 'unknown'}: ${String(e)}`)
      }
    }

    await prisma.sourceSyncLog.create({
      data: {
        source: 'away-info',
        ok: result.errors.length === 0,
        durationMs: Date.now() - startedAt,
        items: result.created + result.updated,
        message: `Venues aus Seed synchronisiert: ${result.created} neu, ${result.updated} aktualisiert, ${result.errors.length} Fehler.`,
      },
    }).catch(() => null)

    return result
  } catch (error) {
    result.errors.push(String(error))
    await prisma.sourceSyncLog.create({
      data: {
        source: 'away-info',
        ok: false,
        durationMs: Date.now() - startedAt,
        items: 0,
        message: `Venue-Seed-Sync fehlgeschlagen: ${String(error).slice(0, 500)}`,
      },
    }).catch(() => null)
    return result
  }
}
