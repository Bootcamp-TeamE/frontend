import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from './icons'

export function TopBar({
  title,
  right,
  onBack,
  transparent = false,
}: {
  title?: string
  right?: ReactNode
  onBack?: () => void
  transparent?: boolean
}) {
  const navigate = useNavigate()
  return (
    <header
      className={
        transparent
          ? 'sticky top-0 z-20 flex items-center gap-1 px-2 py-2.5'
          : 'sticky top-0 z-20 flex items-center gap-1 border-b border-line-soft bg-surface/95 px-2 py-2.5 backdrop-blur'
      }
    >
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        aria-label="뒤로"
        className="rounded-full p-1.5 text-ink-900 hover:bg-paper"
      >
        <ChevronLeftIcon />
      </button>
      {title && <h1 className="text-[15px] font-semibold text-ink-900">{title}</h1>}
      {right && <div className="ml-auto pr-1">{right}</div>}
    </header>
  )
}
