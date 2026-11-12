import * as React from 'react'
import { cn } from '../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background transition-[border-color,box-shadow,background-color,color] duration-200',
          'placeholder:text-muted-foreground/80 selection:bg-primary/20 selection:text-foreground',
          'hover:border-primary/30 hover:bg-background',
          'focus-visible:border-primary/60 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border/80 disabled:hover:bg-background/80',
          'read-only:cursor-default read-only:border-border/60 read-only:bg-secondary/35 read-only:text-foreground/90 read-only:hover:border-border/60 read-only:focus-visible:border-border/60 read-only:focus-visible:ring-ring/40',
          'aria-[invalid=true]:border-destructive/70 aria-[invalid=true]:bg-destructive/[0.03] aria-[invalid=true]:text-foreground aria-[invalid=true]:focus-visible:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
          'file:mr-3 file:rounded-md file:border-0 file:bg-secondary/60 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground file:transition-colors hover:file:bg-secondary/80',
          '[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_color-mix(in_srgb,var(--background)_92%,transparent)] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill]:caret-[var(--foreground)]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }