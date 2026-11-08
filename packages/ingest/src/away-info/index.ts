export interface AwayInfoIngestResult {
  created: number
  updated: number
  errors: string[]
}

export async function ingestAwayInfo(): Promise<AwayInfoIngestResult> {
  // TODO: Implement away info ingestion from club articles
  return { created: 0, updated: 0, errors: [] }
}