import type { Category } from '../../types'
import { categoryColor } from '../../lib/category'
import { cn } from '../../lib/cn'

// 카테고리 필터 — 전체 카테고리를 한 줄 가로 스크롤 레일로.
// 각 카테고리에 식별 색 점, 선택 시 그 카테고리 색으로 칩이 채워진다.
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
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-2">
      <Chip active={!selected} onClick={() => onSelect(undefined)}>
        전체
      </Chip>
      {categories.map((c) => (
        <Chip
          key={c.code}
          active={selected === c.code}
          color={categoryColor(c.code)}
          onClick={() => onSelect(c.code)}
        >
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
  color,
}: {
  active: boolean
  onClick: () => void
  children: string
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      style={active && color ? { backgroundColor: color, borderColor: color } : undefined}
      className={cn(
        'flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-semibold transition-colors',
        active
          ? color
            ? 'text-white'
            : 'border-primary bg-primary text-white'
          : 'border-line-strong bg-surface text-ink-600 hover:bg-paper',
      )}
    >
      {color && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: active ? '#ffffff' : color }}
        />
      )}
      {children}
    </button>
  )
}
