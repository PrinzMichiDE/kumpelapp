'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

type ShareActionProps = {
  title: string
  text?: string
  url?: string
  className?: string
  label?: string
  compact?: boolean
}

export function ShareAction({
  title,
  text,
  url,
  className,
  label = 'Teilen',
  compact = false,
}: ShareActionProps) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  async function onShare() {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
    const shareData: ShareData = {
      title,
      ...(text ? { text } : {}),
      ...(shareUrl ? { url: shareUrl } : {}),
    }

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share(shareData)
        return
      }
    } catch (e) {
      // AbortError = user cancelled share sheet; ignore silently.
      if (e instanceof DOMException && e.name === 'AbortError') return
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
        return
      }
    } catch {
      // fall through to prompt fallback
    }

    if (typeof window !== 'undefined' && shareUrl) {
      window.prompt('Link kopieren:', shareUrl)
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-fc-border bg-fc-bg/40 font-medium text-fc-fg transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg',
        compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
        className,
      )}
      aria-label={copied ? 'Link kopiert' : `${label}: ${title}`}
      title={copied ? 'Link in Zwischenablage kopiert' : 'Teilen oder Link kopieren'}
    >
      {copied ? (
        <Check className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4', 'text-fc-win')} aria-hidden="true" />
      ) : canNativeShare ? (
        <Share2 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
      ) : (
        <Copy className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
      )}
      <span>{copied ? 'Link kopiert' : label}</span>
    </button>
  )
}
