export interface VenueIngestResult {
  created: number
  updated: number
  errors: string[]
}

export async function ingestVenues(): Promise<VenueIngestResult> {
  // TODO: Implement venue ingestion from Wikidata/OSM
  return { created: 0, updated: 0, errors: [] }
}