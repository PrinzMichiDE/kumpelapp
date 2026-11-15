'use client'

import { useEffect, useRef, useState } from 'react'
import { Wifi, WifiOff, X } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

function getInitialOnline() {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(getInitialOnline)
  const [showBackOnline, setShowBackOnline] = useState(false)
  const [dismissedOffline, setDismissedOffline] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(() => new Date())
  const wasOfflineRef = useRef(!getInitialOnline())
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }

    const handleOnline = () => {
      setIsOnline(true)
      setDismissedOffline(false)
      setLastCheckedAt(new Date())
      if (wasOfflineRef.current) {
        setShowBackOnline(true)
        clearHideTimer()
        hideTimerRef.current = setTimeout(() => setShowBackOnline(false), 4000)
      }
      wasOfflineRef.current = false
    }

    const handleOffline = () => {
      clearHideTimer()
      setShowBackOnline(false)
      setIsOnline(false)
      setDismissedOffline(false)
      setLastCheckedAt(new Date())
      wasOfflineRef.current = true
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearHideTimer()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showBackOnline) return null
  if (!isOnline && dismissedOffline) return null

  const offline = !isOnline
  const timeString = lastCheckedAt
    ? lastCheckedAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : 'unbekannt'

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-4',
        'animate-fc-slide-down motion-reduce:animate-none'
      )}
      aria-live={offline ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div
        className={cn(
          'pointer-events-auto mx-auto flex w-full max-w-xl items-start gap-3 rounded-2xl border px-4 py-3 text-sm text-white shadow-lg shadow-black/25 ring-1 ring-inset backdrop-blur-md',
          offline
            ? 'border-white/15 bg-fc-loss/95 ring-white/5'
            : 'border-white/15 bg-fc-win/95 ring-white/5'
        )}
        role={offline ? 'alert' : 'status'}
      >
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/12 ring-1 ring-inset ring-white/10"
          aria-hidden="true"
        >
          {offline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-semibold leading-snug">
            {offline ? 'Keine Internetverbindung' : 'Wieder online'}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/90 sm:text-[13px]">
            {offline ? (
              <>
                Zuletzt geprüft:{' '}
                <span className="font-semibold tabular-nums">{timeString}</span> Uhr. Bereits geladene Inhalte
                bleiben nutzbar.
              </>
            ) : (
              <>Verbindung wiederhergestellt. Inhalte können aktualisiert werden.</>
            )}
          </p>
        </div>
        {offline ? (
          <button
            type="button"
            onClick={() => setDismissedOffline(true)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-fc-loss/95"
            aria-label="Offline-Hinweis ausblenden"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowBackOnline(false)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-fc-win/95"
            aria-label="Hinweis schließen"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
