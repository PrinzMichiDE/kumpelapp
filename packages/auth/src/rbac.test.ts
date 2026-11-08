import { describe, expect, it } from 'vitest'
import { canAccess, requireRole, isEditor, isAdmin } from './rbac'
import { UserRole } from '@prisma/client'

describe('RBAC', () => {
  it('erlaubt Editor auf Editor-Route', () => {
    expect(canAccess('EDITOR', 'EDITOR')).toBe(true)
  })

  it('erlaubt Admin auf Editor-Route', () => {
    expect(canAccess('ADMIN', 'EDITOR')).toBe(true)
  })

  it('lehnt Fan auf Editor-Route ab', () => {
    expect(canAccess('FAN', 'EDITOR')).toBe(false)
  })

  it('lehnt Fan auf Admin-Route ab', () => {
    expect(canAccess('FAN', 'ADMIN')).toBe(false)
  })

  it('erlaubt Admin auf Admin-Route', () => {
    expect(canAccess('ADMIN', 'ADMIN')).toBe(true)
  })

  it('behandelt fehlende Rolle als abgelehnt', () => {
    expect(canAccess(null, 'EDITOR')).toBe(false)
    expect(canAccess(null, 'ADMIN')).toBe(false)
    expect(canAccess(null, 'FAN')).toBe(false)
  })

  it('requireRole wirft bei fehlender Berechtigung', () => {
    expect(() => requireRole('FAN', 'EDITOR')).toThrow('FORBIDDEN')
    expect(() => requireRole(null, 'EDITOR')).toThrow('FORBIDDEN')
  })

  it('requireRole erlaubt bei ausreichender Rolle', () => {
    expect(() => requireRole('EDITOR', 'EDITOR')).not.toThrow()
    expect(() => requireRole('ADMIN', 'EDITOR')).not.toThrow()
    expect(() => requireRole('ADMIN', 'ADMIN')).not.toThrow()
  })

  it('isEditor prüft korrekt', () => {
    expect(isEditor('EDITOR')).toBe(true)
    expect(isEditor('ADMIN')).toBe(true)
    expect(isEditor('FAN')).toBe(false)
    expect(isEditor(null)).toBe(false)
  })

  it('isAdmin prüft korrekt', () => {
    expect(isAdmin('ADMIN')).toBe(true)
    expect(isAdmin('EDITOR')).toBe(false)
    expect(isAdmin('FAN')).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })
})