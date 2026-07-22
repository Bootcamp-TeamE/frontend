import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

type Tone = 'primary' | 'success' | 'danger' | 'neutral'

const tones: Record<Tone, string> = {
  primary: 'bg-primary text-white',
  success: 'bg-success-50 text-success',
  danger: 'bg-danger-50 text-danger',
  neutral: 'bg-stone-100 text-stone-600',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
