import type { SyncBundle } from '@kumpelapp/api-contracts'

export interface OutboxItem {
  id?: number
  type: 'tip' | 'attendance' | 'vote'
  data: unknown
  createdAt: number
  retryCount: number
}

const DB_NAME = 'kumpelapp-offline'
const DB_VERSION = 1

let dbInstance: IDBDatabase | null = null

function getRequest(event: Event): IDBOpenDBRequest {
  return event.target as IDBOpenDBRequest
}

async function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB only available in browser')
  }

  if (dbInstance) return dbInstance

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('kumpelapp-offline', 1)

    request.onupgradeneeded = (event) => {
      const db = getRequest(event).result

      if (!db.objectStoreNames.contains('outbox')) {
        const store = db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true })
        store.createIndex('type', 'type', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }

      if (!db.objectStoreNames.contains('sync-bundle')) {
        db.createObjectStore('sync-bundle', { keyPath: 'key' })
      }

      if (!db.objectStoreNames.contains('matches')) {
        db.createObjectStore('matches', { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains('venues')) {
        db.createObjectStore('venues', { keyPath: 'id' })
      }
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }
    request.onerror = () => reject(request.error)
  })
  return request
}

// Outbox operations
export async function addToOutbox(item: Omit<OutboxItem, 'id' | 'createdAt' | 'retryCount'>): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('outbox', 'readwrite')
    const store = transaction.objectStore('outbox')
    const itemWithMeta = { ...item, createdAt: Date.now(), retryCount: 0 }
    const request = store.add(itemWithMeta)
    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

export interface OutboxItemWithId extends OutboxItem {
  id: number
}

export async function getOutboxItems(type?: 'tip' | 'attendance' | 'vote'): Promise<OutboxItemWithId[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('outbox', 'readonly')
    const store = transaction.objectStore('outbox')
    const index = store.index('type')
    const request = type ? index.getAll(type) : store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function removeFromOutbox(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('outbox', 'readwrite')
    const store = transaction.objectStore('outbox')
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function incrementRetryCount(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('outbox', 'readwrite')
    const store = transaction.objectStore('outbox')
    const request = store.get(id)
    request.onsuccess = () => {
      const item = request.result
      if (item) {
        item.retryCount++
        const updateRequest = store.put(item)
        updateRequest.onsuccess = () => resolve()
        updateRequest.onerror = () => reject(updateRequest.error)
      } else {
        resolve()
      }
    }
    request.onerror = () => reject(request.error)
  })
}

// Sync bundle operations
export async function saveSyncBundle(bundle: any): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('sync-bundle', 'readwrite')
    const store = transaction.objectStore('sync-bundle')
    const request = store.put({ key: 'latest', bundle, savedAt: Date.now() })
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getSyncBundle(): Promise<{ bundle: any; savedAt: number } | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('sync-bundle', 'readonly')
    const store = transaction.objectStore('sync-bundle')
    const request = store.get('latest')
    request.onsuccess = () => {
      if (request.result) {
        resolve({ bundle: request.result.bundle, savedAt: request.result.savedAt })
      } else {
        resolve(null)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

// Match caching for offline access
export async function saveMatches(matches: any[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('matches', 'readwrite')
    const store = transaction.objectStore('matches')
    matches.forEach(match => store.put(match))
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getMatches(): Promise<any[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('matches', 'readonly')
    const store = transaction.objectStore('matches')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Venue caching
export async function saveVenues(venues: any[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('venues', 'readwrite')
    const store = transaction.objectStore('venues')
    venues.forEach(venue => store.put(venue))
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getVenues(): Promise<any[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('venues', 'readonly')
    const store = transaction.objectStore('venues')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export { openDB }