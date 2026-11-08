import * as React from 'react'
import { cn } from '../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-violet-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-violet-300 file:bg-violet-50 file:text-violet-700 placeholder:text-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-50 dark:placeholder:text-violet-400 dark:file:border-violet-700 dark:file:bg-violet-900 dark:file:text-violet-300',
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