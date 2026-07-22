import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-card border border-stone-200/70 bg-white shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
