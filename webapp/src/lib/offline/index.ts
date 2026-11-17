import type { SyncBundle } from '@kumpelapp/api-contracts'
import { openDB, addToOutbox, getOutboxItems, removeFromOutbox, incrementRetryCount, saveSyncBundle, getSyncBundle, saveMatches, getMatches, saveVenues, getVenues } from './db'

/**
 * Offline utilities for KumpelApp
 * Handles IndexedDB, Service Worker registration, and offline sync
 */

// Check online status
export function isOnline(): boolean {
  return navigator.onLine
}

// Listen for online/offline events
export function setupOnlineListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

// Service Worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('Service Worker registered:', registration.scope)

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            if (confirm('Eine neue Version der App ist verfügbar. Seite neu laden?')) {
              window.location.reload()
            }
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

// Sync bootstrap data
export async function fetchSyncBundle(): Promise<{ bundle: any; etag: string } | null> {
  try {
    const response = await fetch('/api/v1/sync/bootstrap', {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 304) return null
      throw new Error(`Sync failed: ${response.status}`)
    }

    const etag = response.headers.get('ETag') || ''
    const bundle = await response.json()

    return { bundle, etag: etag.replace(/"/g, '') }
  } catch (error) {
    console.error('Failed to fetch sync bundle:', error)
    return null
  }
}

// Save sync bundle to IndexedDB
export async function saveSyncBundleWrapper(bundle: any, etag: string): Promise<void> {
  await saveSyncBundle({ ...bundle, meta: { ...bundle.meta, etag } })
}

// Load cached bundle from IndexedDB
export async function loadCachedBundle(): Promise<{ bundle: any; savedAt: number } | null> {
  return getSyncBundle()
}

// Outbox helpers for offline actions
export async function queueTip(tip: { matchId: string; homeGoals: number; awayGoals: number }): Promise<void> {
  await addToOutbox({
    type: 'tip',
    data: tip,
  })
}

export async function queueAttendance(attendance: { matchId: string; status: string; note?: string }): Promise<void> {
  await addToOutbox({
    type: 'attendance',
    data: attendance,
  })
}

export async function queueVote(vote: { matchId: string; playerId: string }): Promise<void> {
  await addToOutbox({
    type: 'vote',
    data: vote,
  })
}

// Process outbox when online
export async function processOutbox(): Promise<void> {
  if (!navigator.onLine) return

  try {
    const { getOutboxItems, removeFromOutbox, incrementRetryCount } = await import('./db')
    const tips = await getOutboxItems('tip')
    for (const tip of tips) {
      try {
        const response = await fetch('/api/v1/me/tips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tip.data),
        })
        if (response.ok) {
          await removeFromOutbox(tip.id)
        } else {
          await incrementRetryCount(tip.id)
        }
      } catch (error) {
        console.error('Failed to sync tip:', error)
      }
    }
  } catch (error) {
    console.error('Failed to process outbox:', error)
  }
}

// Periodic sync setup
export function setupPeriodicSync(): void {
  if ('serviceWorker' in navigator && 'periodicSync' in navigator.serviceWorker) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.periodicSync?.register('sync-bundle', {
        minInterval: 24 * 60 * 60 * 1000, // 24 hours
      }).catch(console.error)
    })
  }
}

// Check online status
export function isOnline(): boolean {
  return navigator.onLine
}

// Listen for online/offline events
export function setupOnlineListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

// Service Worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('Service Worker registered:', registration.scope)

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            if (confirm('Eine neue Version der App ist verfügbar. Seite neu laden?')) {
              window.location.reload()
            }
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}
