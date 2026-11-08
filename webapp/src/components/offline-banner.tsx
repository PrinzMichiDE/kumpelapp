'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
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

  const timeString = lastOnline ? lastOnline.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'unbekannt'

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 bg-fc-loss/90 text-white text-sm font-medium shadow-lg',
        'animate-slide-down'
      )}
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>Offline – Letzte Synchronisation: {timeString}</span>
      <Wifi className="h-4 w-4 flex-shrink-0 opacity-50" aria-hidden="true" />
    </div>
  )
}