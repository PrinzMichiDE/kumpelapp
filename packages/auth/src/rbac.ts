import { UserRole } from '@prisma/client'

const roleHierarchy: Record<UserRole, number> = {
  FAN: 0,
  EDITOR: 1,
  ADMIN: 2,
}

export function canAccess(userRole: UserRole | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function requireRole(userRole: UserRole | null | undefined, requiredRole: UserRole): void {
  if (!canAccess(userRole, requiredRole)) {
    throw new Error('FORBIDDEN')
  }
}

export function isEditor(userRole: UserRole | null | undefined): boolean {
  return canAccess(userRole, 'EDITOR')
}

export function isAdmin(userRole: UserRole | null | undefined): boolean {
  return canAccess(userRole, 'ADMIN')
}