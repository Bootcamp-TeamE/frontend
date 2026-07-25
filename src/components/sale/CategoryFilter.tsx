import { useState } from 'react'
import type { Category } from '../../types'
import { cn } from '../../lib/cn'

// 한 줄에 들어갈 만큼만 노출하고 나머지는 '더보기' 드롭다운으로.
const VISIBLE = 4

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[]
  selected: string | undefined
  onSelect: (code: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)

  // 선택된 카테고리가 숨김 목록에 있으면 노출 줄 맨 앞으로 끌어와 활성 표시를 유지한다.
  let visible = categories.slice(0, VISIBLE)
  if (selected && !visible.some((c) => c.code === selected)) {
    const sel = categories.find((c) => c.code === selected)
    if (sel) visible = [sel, ...categories.slice(0, VISIBLE - 1)]
  }
  const hasMore = categories.length > visible.length

  const pick = (code: string | undefined) => {
    onSelect(code)
    setOpen(false)
  }

  return (
    <div className="relative py-2">
      <div className="flex items-center gap-2 px-5">
        <Chip active={!selected} onClick={() => pick(undefined)}>
          전체
        </Chip>
        {visible.map((c) => (
          <Chip key={c.code} active={selected === c.code} onClick={() => pick(c.code)}>
            {c.name_ko}
          </Chip>
        ))}
        {hasMore && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="전체 카테고리 보기"
            aria-expanded={open}
            className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-line-strong bg-surface px-3 text-sm font-semibold text-ink-600 hover:bg-paper"
          >
            더보기
            <span className={cn('text-xs transition-transform', open && 'rotate-180')}>▾</span>
          </button>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 top-full z-30 mt-1 rounded-card-lg border border-line bg-surface p-3 shadow-card">
            <div className="flex flex-wrap gap-2">
              <Chip active={!selected} onClick={() => pick(undefined)}>
                전체
              </Chip>
              {categories.map((c) => (
                <Chip key={c.code} active={selected === c.code} onClick={() => pick(c.code)}>
                  {c.name_ko}
                </Chip>
              ))}
            </div>
          </div>
        </>
      )}
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
        'h-8 shrink-0 rounded-full border px-3.5 text-sm font-semibold transition-colors',
        active
          ? 'border-primary bg-primary text-white'
          : 'border-line-strong bg-surface text-ink-600 hover:bg-paper',
      )}
    >
      {children}
    </button>
  )
}
