'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastOnline, setLastOnline] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnline(new Date())
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setLastOnline(new Date())
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  const timeString = lastOnline
    ? lastOnline.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : 'unbekannt'

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[60] px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4',
        'animate-fc-slide-down motion-reduce:animate-none'
      )}
      aria-live="polite"
    >
      <div
        className="pointer-events-auto mx-auto flex max-w-3xl items-center justify-center gap-3 rounded-xl border border-white/20 bg-fc-loss/95 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-black/20 ring-1 ring-inset ring-white/5 backdrop-blur-sm"
        role="status"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/12 ring-1 ring-inset ring-white/10">
          <WifiOff className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-center leading-snug">
          Offline – letzte Synchronisation: <span className="font-semibold tabular-nums">{timeString}</span>
        </span>
      </div>
    </div>
  )
}