import type { Category } from '../../types'
import { cn } from '../../lib/cn'

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[]
  selected: string | undefined
  onSelect: (code: string | undefined) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-5 py-2 [scrollbar-width:none]">
      <Chip active={!selected} onClick={() => onSelect(undefined)}>
        전체
      </Chip>
      {categories.map((c) => (
        <Chip key={c.code} active={selected === c.code} onClick={() => onSelect(c.code)}>
          {c.name_ko}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
        active ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
      )}
    >
      {children}
    </button>
  )
}
