import { z } from 'zod'

export const ReviewStatus = z.enum(['AUTO', 'DRAFT', 'CHECKED'])
export type ReviewStatus = z.infer<typeof ReviewStatus>

export const Position = z.enum([
  'GOALKEEPER',
  'DEFENDER',
  'MIDFIELDER',
  'FORWARD',
])
export type Position = z.infer<typeof Position>

export const TeamKind = z.enum(['SENIOR', 'YOUTH', 'TRADITION', 'DEPARTMENT'])
export type TeamKind = z.infer<typeof TeamKind>

export const MatchStatus = z.enum([
  'SCHEDULED',
  'LIVE',
  'FINISHED',
  'POSTPONED',
  'CANCELLED',
  'ABANDONED',
])
export type MatchStatus = z.infer<typeof MatchStatus>

export const EventType = z.enum([
  'GOAL',
  'OWN_GOAL',
  'PENALTY_GOAL',
  'YELLOW_CARD',
  'YELLOW_RED',
  'RED_CARD',
  'SUBSTITUTION',
  'OTHER',
])
export type EventType = z.infer<typeof EventType>

export const FavType = z.enum(['MATCH', 'PLAYER', 'NEWS', 'TEAM'])
export type FavType = z.infer<typeof FavType>

export const ParseStatus = z.enum(['PENDING', 'PARSED', 'PARTIAL', 'FAILED'])
export type ParseStatus = z.infer<typeof ParseStatus>

export const WalletPassType = z.enum(['APPLE', 'GOOGLE'])
export type WalletPassType = z.infer<typeof WalletPassType>

export const AttendanceStatus = z.enum(['GOING', 'MAYBE', 'NOT_GOING'])
export type AttendanceStatus = z.infer<typeof AttendanceStatus>

export const RideKind = z.enum(['OFFER', 'REQUEST'])
export type RideKind = z.infer<typeof RideKind>

export const PushCategory = z.enum(['KICKOFF', 'GOAL', 'RESULT', 'NEWS', 'GROUP', 'TICKETS'])
export type PushCategory = z.infer<typeof PushCategory>

export const NotifType = z.enum(['KICKOFF', 'GOAL', 'RESULT', 'NEWS', 'GROUP', 'TICKETS', 'SYSTEM'])
export type NotifType = z.infer<typeof NotifType>

export const Platform = z.enum(['IOS', 'ANDROID', 'WEB'])
export type Platform = z.infer<typeof Platform>

export const UserRole = z.enum(['FAN', 'EDITOR', 'ADMIN'])
export type UserRole = z.infer<typeof UserRole>

export const MembershipType = z.enum(['STANDARD', 'GIFT', 'LIFETIME'])
export type MembershipType = z.infer<typeof MembershipType>