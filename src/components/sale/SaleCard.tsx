import { Link } from 'react-router-dom'
import type { Sale } from '../../types'
import { cn } from '../../lib/cn'
import { formatDistance, remainingUntil } from '../../lib/format'
import { isSoldout, saleUrgency } from '../../lib/sale'
import { SaleThumb } from './SaleThumb'
import { SalePrice } from './SalePrice'

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
  const urgency = saleUrgency(sale.deadline_at, now)
  const closed = urgency === 'closed'
  const dist = formatDistance(sale.store_distance_m)
  const total = sale.total_quantity || 0
  const remainPct = total > 0 ? Math.max(0, Math.min(100, (sale.remaining_quantity / total) * 100)) : 0
  // 남은 수량 게이지 색 — 색=긴박도(뮤트 톤으로 서비스 팔레트와 조화).
  const barColor = remainPct <= 20 ? '#c0392b' : remainPct <= 50 ? '#c49a3e' : '#557a88'

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
        <p className="mt-0.5 truncate text-[15px] font-bold text-ink-900">{sale.title}</p>

        <div className="mt-1.5">
          <SalePrice sale={sale} size="md" />
        </div>
      </div>

      {/* 우측 메타: 마감임박 / 마감까지 남은 시간 / 남은 수량 게이지 */}
      <div className="flex shrink-0 flex-col items-end gap-1 self-stretch pt-0.5">
        {urgency === 'urgent' && (
          <span className="animate-pulse rounded-full bg-danger-50 px-1.5 py-0.5 text-[10px] font-bold text-danger">
            마감임박
          </span>
        )}
        <span
          className={cn(
            'font-mono text-[13px] font-bold tnum',
            closed
              ? 'text-ink-300'
              : urgency === 'urgent'
                ? 'text-danger'
                : urgency === 'soon'
                  ? 'text-amber'
                  : 'text-ink-600',
          )}
        >
          {closed ? '마감' : remainingUntil(sale.deadline_at, now)}
        </span>
        <div className="mt-auto flex flex-col items-end gap-1">
          <span className="text-[12px] text-ink-400">
            {soldout ? '품절' : `${sale.remaining_quantity}${unitLabel} 남음`}
          </span>
          {!soldout && total > 0 && (
            <div className="h-1 w-14 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full"
                style={{ width: `${remainPct}%`, backgroundColor: barColor }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
