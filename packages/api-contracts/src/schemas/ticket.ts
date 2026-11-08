import { z } from 'zod'
import { ParseStatus, WalletPassType, ReviewStatus } from './common'

export const TicketDto = z.object({
  id: z.string(),
  userId: z.string(),
  matchId: z.string().nullable(),
  opponent: z.string().nullable(),
  matchDate: z.string().datetime().nullable(),
  venue: z.string().nullable(),
  block: z.string().nullable(),
  row: z.string().nullable(),
  seat: z.string().nullable(),
  ticketType: z.string().nullable(),
  orderNumber: z.string().nullable(),
  priceCents: z.number().int().nullable(),
  pdfUrl: z.string().url().nullable(),
  pdfKey: z.string().nullable(),
  pageCount: z.number().int().nullable(),
  qrData: z.string().nullable(),
  qrImageKey: z.string().nullable(),
  parseStatus: ParseStatus,
  parseError: z.string().nullable(),
  parsedAt: z.string().datetime().nullable(),
  passes: z.array(z.object({
    id: z.string(),
    type: WalletPassType,
    serial: z.string(),
    issuedAt: z.string().datetime(),
    revoked: z.boolean(),
  })).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type TicketDto = z.infer<typeof TicketDto>

export const TicketListDto = z.array(TicketDto)
export type TicketListDto = z.infer<typeof TicketListDto>

export const TicketUploadResponse = z.object({
  id: z.string(),
  parseStatus: ParseStatus,
})
export type TicketUploadResponse = z.infer<typeof TicketUploadResponse>