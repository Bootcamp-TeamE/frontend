import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from './icons'
import { cn } from '../lib/cn'

export function TopBar({
  title,
  right,
  onBack,
  back = true,
  transparent = false,
}: {
  title?: string
  right?: ReactNode
  onBack?: () => void
  back?: boolean
  transparent?: boolean
}) {
  const navigate = useNavigate()
  return (
    <header
      className={
        transparent
          ? 'sticky top-0 z-20 flex items-center gap-1 px-2 py-2.5'
          : 'sticky top-0 z-20 flex items-center gap-1 bg-paper/95 px-2 py-2.5 backdrop-blur'
      }
    >
      {back && (
        <button
          onClick={() => (onBack ? onBack() : navigate(-1))}
          aria-label="뒤로"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-900 hover:bg-line"
        >
          <ChevronLeftIcon />
        </button>
      )}
      {title && (
        <h1 className={cn('text-[15px] font-semibold text-ink-900', !back && 'pl-3')}>{title}</h1>
      )}
      {right && <div className="ml-auto pr-1">{right}</div>}
    </header>
  )
}
