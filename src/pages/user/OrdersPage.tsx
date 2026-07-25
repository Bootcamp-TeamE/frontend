import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Badge,
  Button,
  CheckIcon,
  EmptyState,
  ListSkeleton,
  SaleThumb,
  Sheet,
  TopBar,
} from '../../components'
import { useCancelOrder, useOrders, useSale } from '../../hooks'
import { useAuthStore } from '../../store'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '../../lib/order'
import { cn } from '../../lib/cn'
import { formatWon } from '../../lib/format'
import type { Order, OrderStatus } from '../../types'

const CANCELLABLE: OrderStatus[] = ['reserved', 'paid']

type TabKey = 'waiting' | 'done' | 'cancelled'
const TABS: { key: TabKey; label: string; match: (s: OrderStatus) => boolean }[] = [
  { key: 'waiting', label: '픽업 대기', match: (s) => s === 'reserved' || s === 'paid' },
  { key: 'done', label: '픽업 완료', match: (s) => s === 'picked_up' },
  {
    key: 'cancelled',
    label: '취소',
    match: (s) => s === 'cancelled' || s === 'expired' || s === 'refunded',
  },
]
const EMPTY_MSG: Record<TabKey, string> = {
  waiting: '픽업 대기 중인 예약이 없어요',
  done: '픽업 완료된 예약이 없어요',
  cancelled: '취소·만료된 예약이 없어요',
}

export function OrdersPage() {
  const userId = useAuthStore((s) => s.userId)
  const { data: orders, isLoading } = useOrders(userId)
  const sorted = orders ? [...orders].sort((a, b) => b.id - a.id) : undefined

  const [tab, setTab] = useState<TabKey>('waiting')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const cancel = useCancelOrder()

  const activeTab = TABS.find((t) => t.key === tab)!
  const filtered = sorted?.filter((o) => activeTab.match(o.status))

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const doCancelSelected = async () => {
    for (const id of selected) {
      try {
        await cancel.mutateAsync(id)
      } catch {
        // 이미 취소·만료된 건은 건너뛴다(409). 나머지는 계속 취소.
      }
    }
    setSelected(new Set())
    setConfirmOpen(false)
  }

  return (
    <>
      <TopBar title="내 예약" />

      {/* 상태 탭 */}
      <div className="flex gap-1 border-b border-line-soft bg-surface px-3">
        {TABS.map((t) => {
          const count = sorted?.filter((o) => t.match(o.status)).length ?? 0
          const on = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key)
                setSelected(new Set())
              }}
              className={cn(
                'relative px-3 py-3 text-[14px] font-semibold transition-colors',
                on ? 'text-ink-900' : 'text-ink-400',
              )}
            >
              {t.label}
              {count > 0 && <span className={cn('ml-1', on ? 'text-primary' : 'text-ink-300')}>{count}</span>}
              {on && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}
            </button>
          )
        })}
      </div>

      {isLoading && (
        <div className="bg-surface px-5">
          <ListSkeleton count={4} />
        </div>
      )}

      {!isLoading && sorted && sorted.length === 0 && (
        <EmptyState
          title="예약 내역이 없어요"
          description="마감세일을 예약하면 여기에 표시됩니다."
          action={
            <Link to="/">
              <Button variant="secondary">마감세일 보러가기</Button>
            </Link>
          }
        />
      )}

      {!isLoading && sorted && sorted.length > 0 && filtered && filtered.length === 0 && (
        <EmptyState title={EMPTY_MSG[tab]} />
      )}

      <div className={cn('bg-surface px-5', selected.size > 0 && 'pb-28')}>
        {filtered?.map((o) => (
          <OrderRow
            key={o.id}
            order={o}
            selectable={CANCELLABLE.includes(o.status)}
            checked={selected.has(o.id)}
            onToggle={() => toggle(o.id)}
          />
        ))}
      </div>

      {/* 선택 취소 벌크 바 */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-[430px] border-t border-line-soft bg-surface px-5 pt-3 pb-5">
            <div className="mb-2 flex items-center justify-between text-[13px]">
              <span className="text-ink-600">
                <span className="font-bold text-ink-900">{selected.size}</span>건 선택됨
              </span>
              <button
                onClick={() => setSelected(new Set())}
                className="min-h-[36px] px-1 font-semibold text-ink-500"
              >
                선택 해제
              </button>
            </div>
            <Button
              variant="danger"
              fullWidth
              size="lg"
              className="rounded-[14px]"
              onClick={() => setConfirmOpen(true)}
            >
              선택한 예약 취소하기
            </Button>
          </div>
        </div>
      )}

      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`예약 ${selected.size}건을 취소할까요?`}
      >
        <p className="text-sm text-ink-600">
          취소하면 되돌릴 수 없어요. 재고는 다른 손님에게 돌아갑니다.
        </p>
        {cancel.isError && (
          <p className="mt-2 text-sm text-danger">
            {(cancel.error as Error)?.message ?? '취소에 실패했어요.'}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="danger" fullWidth loading={cancel.isPending} onClick={doCancelSelected}>
            예약 취소하기
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setConfirmOpen(false)}>
            닫기
          </Button>
        </div>
      </Sheet>
    </>
  )
}

function OrderRow({
  order,
  selectable,
  checked,
  onToggle,
}: {
  order: Order
  selectable: boolean
  checked: boolean
  onToggle: () => void
}) {
  const { data: sale } = useSale(order.sale_id)
  const saved = sale ? (sale.normal_price - sale.sale_price) * order.quantity : 0

  return (
    <div className="flex items-center gap-3 border-b border-line-soft py-4 last:border-0">
      {/* 체크박스 슬롯 — 취소 가능 건만. 슬롯은 항상 차지해 썸네일 정렬 유지 */}
      <div className="w-6 shrink-0">
        {selectable && (
          <button
            onClick={onToggle}
            role="checkbox"
            aria-checked={checked}
            aria-label="예약 선택"
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md border transition-colors',
              checked
                ? 'border-primary bg-primary text-white'
                : 'border-line-strong bg-surface text-transparent',
            )}
          >
            <CheckIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <Link to={`/orders/${order.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        {sale ? (
          <SaleThumb sale={sale} size="md" label={sale.store_name ?? sale.title} />
        ) : (
          <div className="h-[60px] w-[60px] shrink-0 rounded-thumb bg-line" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
            <span className="text-[12px] text-ink-400">{order.pickup_no ?? `#${order.id}`}</span>
          </div>
          <p className="mt-1 truncate text-[14px] font-semibold text-ink-900">
            {sale?.title ?? '마감세일'} × {order.quantity}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-400">{sale?.store_name ?? ''}</p>
        </div>
      </Link>

      {/* 우측: 결제금액 + 할인 정보 */}
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-[15px] font-extrabold text-ink-900 tnum">
          {formatWon(order.total_price)}
        </span>
        {sale && (
          <span className="text-[12px] font-bold text-primary tnum">{sale.discount_rate}% 할인</span>
        )}
        {sale && saved > 0 && (
          <span className="text-[11px] text-ink-400 tnum">{formatWon(saved)} 절약</span>
        )}
      </div>
    </div>
  )
}
