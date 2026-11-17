'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

type CopyButtonProps = {
  value: string
  label?: string
  copiedLabel?: string
  className?: string
  size?: 'sm' | 'md'
}

export function CopyButton({
  value,
  label = 'Kopieren',
  copiedLabel = 'Kopiert',
  className,
  size = 'sm',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
        return
      }
    } catch {
      // fall through
    }

    if (typeof window !== 'undefined') {
      window.prompt('Link kopieren:', value)
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium transition-[border-color,background-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg',
        size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs',
        copied
          ? 'border-fc-win/30 bg-fc-win/10 text-fc-win'
          : 'border-fc-border/70 bg-fc-bg/40 text-fc-fg/70 hover:border-fc-violet/40 hover:bg-fc-violet/10 hover:text-fc-fg',
        className,
      )}
      aria-label={copied ? `${copiedLabel}: Kalender-URL` : `${label}: Kalender-URL`}
      title={copied ? 'In Zwischenablage kopiert' : 'URL in Zwischenablage kopieren'}
    >
      {copied ? <Check className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" /> : <Copy className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  )
}
