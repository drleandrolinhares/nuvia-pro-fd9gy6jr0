/* Textarea Component - A component that displays a textarea - from shadcn/ui (exposes Textarea) */
import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[88px] w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base text-foreground shadow-xs',
          'transition-[border-color,box-shadow] duration-150',
          'placeholder:text-muted-foreground/80 resize-y',
          'hover:border-border-strong',
          'focus-visible:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
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
Textarea.displayName = 'Textarea'

export { Textarea }
