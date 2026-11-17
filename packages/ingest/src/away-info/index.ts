import { ingestVenues, type VenueIngestResult } from '../venues'

export interface AwayInfoIngestResult extends VenueIngestResult {}

/**
 * Kuratiert Auswärts-/Venue-Infos auf Basis der gepflegten Seed-Daten (und später externer Quellen).
 * Aktuell: synchronisiert/aktualisiert Venue-Datensätze inkl. Review-Metadaten aus dem RLNO-Seed.
 */
export async function ingestAwayInfo(): Promise<AwayInfoIngestResult> {
  return ingestVenues()
}
