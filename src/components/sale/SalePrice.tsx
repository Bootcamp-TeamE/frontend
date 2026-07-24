import type { Sale } from '../../types'
import { cn } from '../../lib/cn'
import { formatWon } from '../../lib/format'

/**
 * 할인율 + 정상가(취소선) + 판매가 블록.
 * inline: 한 줄 가로. stacked: 정상가 위, 할인율·판매가 아래(우측 정렬).
 */
export function SalePrice({
  sale,
  size = 'md',
  align = 'inline',
}: {
  sale: Sale
  size?: 'sm' | 'md'
  align?: 'inline' | 'stacked'
}) {
  const md = size === 'md'
  const pct = (
    <span className={cn('font-extrabold text-primary tnum', md ? 'text-[13px]' : 'text-[12px]')}>
      {sale.discount_rate}%
    </span>
  )
  const strike = (
    <span className={cn('text-ink-300 line-through tnum', md ? 'text-[12px]' : 'text-[11px]')}>
      {formatWon(sale.normal_price)}
    </span>
  )
  const price = (
    <span className={cn('font-extrabold text-ink-900 tnum', md ? 'text-[18px]' : 'text-[15px]')}>
      {formatWon(sale.sale_price)}
    </span>
  )

  if (align === 'stacked') {
    return (
      <div className="flex flex-col items-end">
        {strike}
        <div className="flex items-baseline gap-1">
          {pct}
          {price}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5">
      {pct}
      {strike}
      {price}
    </div>
  )
}
