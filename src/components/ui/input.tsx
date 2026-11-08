/* Input Component - A component that displays an input - from shadcn/ui (exposes Input) */
import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground shadow-xs',
          'transition-[border-color,box-shadow] duration-150',
          'placeholder:text-muted-foreground/80',
          'hover:border-border-strong',
          'focus-visible:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-70',
          'md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
