import { z } from 'zod'

export const UserRole = z.enum(['FAN', 'EDITOR', 'ADMIN'])
export type UserRole = z.infer<typeof UserRole>

export const Platform = z.enum(['IOS', 'ANDROID', 'WEB'])
export type Platform = z.infer<typeof Platform>

export const FavType = z.enum(['MATCH', 'PLAYER', 'NEWS', 'TEAM'])
export type FavType = z.infer<typeof FavType>

export const PushCategory = z.enum(['KICKOFF', 'GOAL', 'RESULT', 'NEWS', 'GROUP', 'TICKETS'])
export type PushCategory = z.infer<typeof PushCategory>

export const AttendanceStatus = z.enum(['GOING', 'MAYBE', 'NOT_GOING'])
export type AttendanceStatus = z.infer<typeof AttendanceStatus>

export const RideKind = z.enum(['OFFER', 'REQUEST'])
export type RideKind = z.infer<typeof RideKind>

export const UserDto = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  role: UserRole,
  quietFrom: z.int().min(0).max(23).nullable(),
  quietTo: z.int().min(0).max(23).nullable(),
  highContrast: z.boolean(),
  createdAt: z.string().datetime(),
})
export type UserDto = z.infer<typeof UserDto>

export const FavoriteDto = z.object({
  id: z.string(),
  userId: z.string(),
  type: FavType,
  refId: z.string(),
})
export type FavoriteDto = z.infer<typeof FavoriteDto>

export const PushTokenDto = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  platform: Platform,
  createdAt: z.string().datetime(),
})
export type PushTokenDto = z.infer<typeof PushTokenDto>

export const PushPrefDto = z.object({
  id: z.string(),
  userId: z.string(),
  category: PushCategory,
  enabled: z.boolean(),
})
export type PushPrefDto = z.infer<typeof PushPrefDto>

export const NotificationDto = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  body: z.string(),
  type: z.string(),
  read: z.boolean(),
  data: z.unknown().nullable(),
  createdAt: z.string().datetime(),
})
export type NotificationDto = z.infer<typeof NotificationDto>

export const GroupDto = z.object({
  id: z.string(),
  name: z.string(),
  inviteCode: z.string(),
  ownerId: z.string(),
  owner: z.object({
    id: z.string(),
    name: z.string().nullable(),
  }),
  createdAt: z.string().datetime(),
  memberCount: z.int(),
  isMember: z.boolean(),
  isOwner: z.boolean(),
})
export type GroupDto = z.infer<typeof GroupDto>

export const GroupMemberDto = z.object({
  id: z.string(),
  userId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    image: z.string().url().nullable(),
  }),
  joinedAt: z.string().datetime(),
})
export type GroupMemberDto = z.infer<typeof GroupMemberDto>

export const TipDto = z.object({
  id: z.string(),
  userId: z.string(),
  matchId: z.string(),
  homeGoals: z.int(),
  awayGoals: z.int(),
  points: z.int().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type TipDto = z.infer<typeof TipDto>

export const TipSubmit = z.object({
  matchId: z.string(),
  homeGoals: z.int().min(0).max(20),
  awayGoals: z.int().min(0).max(20),
})
export type TipSubmit = z.infer<typeof TipSubmit>

export const AttendanceDto = z.object({
  id: z.string(),
  userId: z.string(),
  matchId: z.string(),
  status: AttendanceStatus,
  note: z.string().nullable(),
})
export type AttendanceDto = z.infer<typeof AttendanceDto>

export const AttendanceSubmit = z.object({
  matchId: z.string(),
  status: AttendanceStatus,
  note: z.string().optional(),
})
export type AttendanceSubmit = z.infer<typeof AttendanceSubmit>

export const RideDto = z.object({
  id: z.string(),
  userId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
  }),
  matchId: z.string(),
  kind: RideKind,
  fromPlace: z.string(),
  departAt: z.string().datetime(),
  seats: z.int().nullable(),
  note: z.string().nullable(),
  createdAt: z.string().datetime(),
})
export type RideDto = z.infer<typeof RideDto>

export const RideSubmit = z.object({
  matchId: z.string(),
  kind: RideKind,
  fromPlace: z.string(),
  departAt: z.string().datetime(),
  seats: z.int().min(1).max(8).optional(),
  note: z.string().optional(),
})
export type RideSubmit = z.infer<typeof RideSubmit>

export const MatchVoteDto = z.object({
  id: z.string(),
  userId: z.string(),
  matchId: z.string(),
  playerId: z.string(),
  player: z.object({
    id: z.string(),
    name: z.string(),
    number: z.int().nullable(),
    position: z.string(),
  }),
  createdAt: z.string().datetime(),
})
export type MatchVoteDto = z.infer<typeof MatchVoteDto>

export const MatchVoteSubmit = z.object({
  matchId: z.string(),
  playerId: z.string(),
})
export type MatchVoteSubmit = z.infer<typeof MatchVoteSubmit>

export const VenueVisitDto = z.object({
  id: z.string(),
  userId: z.string(),
  venueId: z.string(),
  venue: z.object({
    id: z.string(),
    name: z.string(),
    city: z.string(),
  }),
  matchId: z.string().nullable(),
  visitedAt: z.string().datetime(),
  note: z.string().nullable(),
})
export type VenueVisitDto = z.infer<typeof VenueVisitDto>

export const VenueVisitSubmit = z.object({
  venueId: z.string(),
  matchId: z.string().optional(),
  visitedAt: z.string().datetime().optional(),
  note: z.string().optional(),
})
export type VenueVisitSubmit = z.infer<typeof VenueVisitSubmit>

export const PushCategoryPref = z.object({
  category: PushCategory,
  enabled: z.boolean(),
})
export type PushCategoryPref = z.infer<typeof PushCategoryPref>