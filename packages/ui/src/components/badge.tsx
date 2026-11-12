import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-0.5 align-middle text-xs font-semibold leading-none tracking-[0.01em] whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        default:
          'border-primary/20 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        secondary:
          'border-border/60 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-destructive/20 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border-border/80 bg-background/50 text-foreground/90 hover:border-primary/30 hover:bg-accent/10 hover:text-foreground',
        success:
          'border-fc-win/25 bg-fc-win text-white shadow-sm hover:brightness-110',
        warning:
          'border-fc-draw/30 bg-fc-draw text-fc-bg shadow-sm hover:brightness-105',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }