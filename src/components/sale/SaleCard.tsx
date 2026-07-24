import { Link } from 'react-router-dom'
import type { Sale } from '../../types'
import { cn } from '../../lib/cn'
import { formatDistance, formatHHmm } from '../../lib/format'
import { isSoldout } from '../../lib/sale'
import { SaleThumb } from './SaleThumb'
import { SalePrice } from './SalePrice'

const CLOSING_SOON_MS = 60 * 60 * 1000

/**
 * 홈 리스트 행(에디토리얼). 흰 서피스 위에 행 구분선으로 이어지는 플랫 로우.
 * README 1. 홈(리스트) 스펙 기준.
 */
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
  const soldout = isSoldout(sale)
  const deadlineMs = new Date(sale.deadline_at).getTime()
  const closed = deadlineMs <= now
  const closingSoon = !closed && deadlineMs - now < CLOSING_SOON_MS
  const dist = formatDistance(sale.store_distance_m)

  return (
    <Link
      to={`/sales/${sale.id}`}
      className={cn(
        'flex items-center gap-3.5 border-b border-line-soft px-1 py-[18px] last:border-0 active:bg-paper/60',
        soldout && 'opacity-50',
      )}
    >
      <SaleThumb sale={sale} size="lg" label={categoryLabel} />

      {/* 본문 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-[13px] font-semibold text-ink-600">
          {sale.store_name ?? categoryLabel}
          {dist && <span className="font-normal text-ink-400"> · {dist}</span>}
        </p>
        <p className="mt-0.5 truncate text-[14px] font-semibold text-ink-900">{sale.title}</p>

        <div className="mt-1.5">
          <SalePrice sale={sale} size="md" />
        </div>
      </div>

      {/* 우측 메타: 마감시각 / 남은 수량 */}
      <div className="flex shrink-0 flex-col items-end gap-1 self-stretch pt-0.5">
        <span
          className={cn(
            'font-mono text-[13px] font-bold tnum',
            closed ? 'text-ink-300' : closingSoon ? 'text-danger' : 'text-ink-600',
          )}
        >
          {closed ? '마감' : formatHHmm(sale.deadline_at)}
        </span>
        <span className="mt-auto text-[12px] text-ink-400">
          {soldout ? '품절' : `${sale.remaining_quantity}${unitLabel} 남음`}
        </span>
      </div>
    </Link>
  )
}
