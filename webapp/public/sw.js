// KumpelApp Service Worker - Matchday-first offline support
const CACHE_VERSION = 'v2'
const STATIC_CACHE = `kumpelapp-static-${CACHE_VERSION}`
const PAGE_CACHE = `kumpelapp-pages-${CACHE_VERSION}`
const RUNTIME_CACHE = `kumpelapp-runtime-${CACHE_VERSION}`

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/brand/icon-192x192.png',
  '/brand/icon-512x512.png',
]

const WARMUP_PAGES = [
  '/spielplan',
  '/tabelle',
  '/auswaerts',
  '/stadionmodus',
  '/news',
  '/quellen',
]

const OFFLINE_PAGE = '/offline'

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const staticCache = await caches.open(STATIC_CACHE)
    await staticCache.addAll(STATIC_ASSETS)
    const pageCache = await caches.open(PAGE_CACHE)
    await Promise.allSettled(WARMUP_PAGES.map(async (path) => {
      try {
        const req = new Request(path, { credentials: 'same-origin' })
        const res = await fetch(req)
        if (res && res.ok) await pageCache.put(req, res.clone())
      } catch {
        // best effort warmup
      }
    }))
  })())
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(
      names
        .filter((name) => ![STATIC_CACHE, PAGE_CACHE, RUNTIME_CACHE].includes(name))
        .map((name) => caches.delete(name)),
    )
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== location.origin) return

  // Never cache auth/session or admin mutations-sensitive endpoints aggressively
  if (url.pathname.startsWith('/api/auth')) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request))
    return
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE, true))
    return
  }

  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font' || request.destination === 'image') {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE, false))
})

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE)
  try {
    const response = await fetch(request)
    if (response && response.ok) await cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    // Try matching without query for dynamic routes where possible
    const url = new URL(request.url)
    const cachedPathOnly = await cache.match(url.pathname)
    if (cachedPathOnly) return cachedPathOnly
    const offline = await caches.match(OFFLINE_PAGE)
    if (offline) return offline
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}

async function staleWhileRevalidate(request, cacheName, jsonFallback) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.status === 304)) {
        cache.put(request, response.clone()).catch(() => {})
      }
      return response
    })
    .catch(() => null)

  if (cached) {
    eventWait(networkPromise)
    return cached
  }

  const network = await networkPromise
  if (network) return network

  if (jsonFallback) {
    return new Response(JSON.stringify({ error: { code: 'OFFLINE', message: 'Offline – keine aktuellen Daten verfügbar' } }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
  return new Response('Offline', { status: 503 })
}

function eventWait(promise) {
  // Best-effort background update; no-op outside fetch event lifecycle helper usage
  if (promise && typeof promise.then === 'function') promise.catch(() => {})
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.ok) await cache.put(request, response.clone())
    return response
  } catch {
    return cached || new Response('', { status: 504 })
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tips') event.waitUntil(syncOutbox('/api/v1/me/tips', 'outbox-tips'))
  if (event.tag === 'sync-attendance') event.waitUntil(syncOutbox('/api/v1/me/attendance', 'outbox-attendance'))
  if (event.tag === 'sync-votes') event.waitUntil(syncOutbox('/api/v1/me/votes', 'outbox-votes'))
})

async function syncOutbox(url, storeName) {
  const db = await openDB()
  const items = await getAll(db, storeName)
  for (const item of items) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      })
      if (res.ok) await del(db, storeName, item.id)
    } catch (error) {
      console.error('Failed to sync outbox', storeName, error)
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kumpelapp-offline', 2)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      ;['outbox-tips', 'outbox-attendance', 'outbox-votes', 'sync-bundle', 'snapshots'].forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          const keyPath = name === 'sync-bundle' || name === 'snapshots' ? 'key' : 'id'
          db.createObjectStore(name, keyPath === 'id' ? { keyPath: 'id', autoIncrement: true } : { keyPath })
        }
      })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function getAll(db, storeName) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(storeName)) return resolve([])
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

function del(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

self.addEventListener('push', (event) => {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'KumpelApp', body: event.data.text() } }
  const options = {
    body: data.body || '',
    icon: '/brand/icon-192x192.png',
    badge: '/brand/icon-192x192.png',
    data: data.data || {},
  }
  event.waitUntil(self.registration.showNotification(data.title || 'KumpelApp', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification?.data?.url || '/stadionmodus'
  event.waitUntil(clients.openWindow(url))
})
