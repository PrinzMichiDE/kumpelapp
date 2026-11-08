export interface ParsedTicket {
  opponent?: string
  matchDate?: Date
  venue?: string
  block?: string
  row?: string
  seat?: string
  ticketType?: string
  orderNumber?: string
  priceCents?: number
  qrData?: string
  rawText?: string
}

export interface TicketPattern {
  id: string
  detect(text: string): boolean
  extract(text: string, qr?: string): Partial<ParsedTicket>
}

export async function parseTicketPdf(buffer: Buffer): Promise<ParsedTicket> {
  // TODO: Implement PDF parsing
  throw new Error('Not implemented')
}

export async function extractQrCode(buffer: Buffer): Promise<string | null> {
  // TODO: Implement QR extraction
  return null
}

export const ticketPatterns: TicketPattern[] = []