import { UserRole } from '@prisma/client'

const roleHierarchy: Record<UserRole, number> = {
  FAN: 0,
  EDITOR: 1,
  ADMIN: 2,
}

export function canAccess(userRole: UserRole | null, requiredRole: UserRole): boolean {
  if (!userRole) return false
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function requireRole(userRole: UserRole | null, requiredRole: UserRole): void {
  if (!canAccess(userRole, requiredRole)) {
    throw new Error('FORBIDDEN')
  }
}

export function isEditor(userRole: UserRole | null): boolean {
  return canAccess(userRole, 'EDITOR')
}

export function isAdmin(userRole: UserRole | null): boolean {
  return canAccess(userRole, 'ADMIN')
}