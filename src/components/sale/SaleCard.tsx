import { Link } from 'react-router-dom'
import type { Sale } from '../../types'
import { Badge } from '../Badge'
import { Card } from '../Card'
import { cn } from '../../lib/cn'
import { formatWon, remainingUntil } from '../../lib/format'
import { categoryTint } from '../../lib/category'

const CLOSING_SOON_MS = 30 * 60 * 1000

export function SaleCard({
  sale,
  categoryLabel,
  unitLabel,
  now,
}: {
  sale: Sale
  categoryLabel: string
  unitLabel: string
  now: number
}) {
  const soldout = sale.status === 'soldout' || sale.remaining_quantity <= 0
  const remain = remainingUntil(sale.deadline_at, now)
  const closingSoon = !!remain && new Date(sale.deadline_at).getTime() - now < CLOSING_SOON_MS

  return (
    <Link to={`/sales/${sale.id}`} className="block">
      <Card className={cn('flex gap-3 p-3', soldout && 'opacity-55')}>
        <div
          className={cn(
            'flex h-24 w-24 shrink-0 items-center justify-center rounded-xl text-base font-extrabold',
            categoryTint(sale.category_code),
          )}
        >
          {categoryLabel.slice(0, 2)}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <Badge tone="neutral">{categoryLabel}</Badge>
            {soldout ? (
              <Badge tone="danger">품절</Badge>
            ) : remain ? (
              <span
                className={cn(
                  'text-xs font-bold tabular-nums',
                  closingSoon ? 'text-danger' : 'text-stone-400',
                )}
              >
                마감 {remain}
              </span>
            ) : (
              <Badge tone="neutral">마감</Badge>
            )}
          </div>

          <p className="mt-1 truncate text-[15px] font-bold text-stone-900">{sale.title}</p>

          <div className="mt-auto flex items-center gap-1.5">
            <Badge tone="primary">{sale.discount_rate}%</Badge>
            <span className="text-lg font-extrabold text-stone-900">
              {formatWon(sale.sale_price)}
            </span>
            <span className="text-sm text-stone-400 line-through">
              {formatWon(sale.normal_price)}
            </span>
          </div>

          <p className="mt-0.5 text-xs text-stone-400">
            {soldout
              ? '재고가 모두 소진됐어요'
              : `${sale.remaining_quantity}${unitLabel} 남음`}
          </p>
        </div>
      </Card>
    </Link>
  )
}
