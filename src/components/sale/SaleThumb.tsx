import type { Sale } from '../../types'
import { cn } from '../../lib/cn'
import { categoryTint } from '../../lib/category'
import { resolveImageUrl } from '../../lib/image'

const SIZES = {
  sm: 'h-12 w-12',
  md: 'h-[60px] w-[60px]',
  lg: 'h-[72px] w-[72px]',
} as const

/** 세일 썸네일. 이미지가 있으면 표시, 없으면 카테고리 톤 줄무늬 폴백(label 이니셜). */
export function SaleThumb({
  sale,
  size = 'md',
  label,
}: {
  sale: Sale
  size?: keyof typeof SIZES
  label?: string
}) {
  const url = resolveImageUrl(sale.image_url)
  const box = cn(SIZES[size], 'shrink-0 rounded-thumb')

  if (url) {
    return <img src={url} alt={sale.title} className={cn(box, 'object-cover')} />
  }
  return (
    <div
      className={cn(
        box,
        'thumb-stripe flex items-center justify-center font-mono text-[11px] font-bold tracking-tight',
        categoryTint(sale.category_code),
      )}
    >
      {label ? label.slice(0, 2) : null}
    </div>
  )
}
