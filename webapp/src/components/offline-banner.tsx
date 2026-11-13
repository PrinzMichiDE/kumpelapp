'use client'

import { useEffect, useRef, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBackOnline, setShowBackOnline] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)
  const wasOfflineRef = useRef(false)
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
      setLastCheckedAt(new Date())
      if (wasOfflineRef.current) {
        setShowBackOnline(true)
        clearHideTimer()
        hideTimerRef.current = setTimeout(() => setShowBackOnline(false), 3200)
      }
      wasOfflineRef.current = false
    }

    const handleOffline = () => {
      clearHideTimer()
      setShowBackOnline(false)
      setIsOnline(false)
      setLastCheckedAt(new Date())
      wasOfflineRef.current = true
    }

    const online = navigator.onLine
    setIsOnline(online)
    setLastCheckedAt(new Date())
    wasOfflineRef.current = !online

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearHideTimer()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showBackOnline) return null

  const timeString = lastCheckedAt
    ? lastCheckedAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : 'unbekannt'

  const offline = !isOnline

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[60] px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4',
        'animate-fc-slide-down motion-reduce:animate-none'
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={cn(
          'pointer-events-auto mx-auto flex max-w-3xl items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium text-white shadow-lg shadow-black/20 ring-1 ring-inset backdrop-blur-sm',
          offline
            ? 'border-white/20 bg-fc-loss/95 ring-white/5'
            : 'border-white/20 bg-fc-win/95 ring-white/5'
        )}
        role="status"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/12 ring-1 ring-inset ring-white/10">
          {offline ? <WifiOff className="h-4 w-4" aria-hidden="true" /> : <Wifi className="h-4 w-4" aria-hidden="true" />}
        </span>
        <span className="text-center leading-snug">
          {offline ? (
            <>
              Keine Internetverbindung. Zuletzt geprüft:{' '}
              <span className="font-semibold tabular-nums">{timeString}</span> Uhr
            </>
          ) : (
            <>Wieder online. Verbindung wiederhergestellt.</>
          )}
        </span>
      </div>
    </div>
  )
}