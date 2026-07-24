import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, EmptyState, ListSkeleton, SaleThumb, Sheet, TopBar } from '../../components'
import { useCancelOrder, useOrders, useSale } from '../../hooks'
import { useAuthStore } from '../../store'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '../../lib/order'
import { formatWon } from '../../lib/format'
import type { Order, OrderStatus } from '../../types'

const CANCELLABLE: OrderStatus[] = ['reserved', 'paid']

export function OrdersPage() {
  const userId = useAuthStore((s) => s.userId)
  const { data: orders, isLoading } = useOrders(userId)
  const sorted = orders ? [...orders].sort((a, b) => b.id - a.id) : undefined

  const [target, setTarget] = useState<Order | null>(null)
  const cancel = useCancelOrder()
  const doCancel = () => {
    if (target) cancel.mutate(target.id, { onSuccess: () => setTarget(null) })
  }

  return (
    <>
      <TopBar title="내 예약" />
      {isLoading && (
        <div className="bg-surface px-5">
          <ListSkeleton count={4} />
        </div>
      )}
      {sorted && sorted.length === 0 && (
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
      <div className="bg-surface px-5">
        {sorted?.map((o) => <OrderRow key={o.id} order={o} onCancel={() => setTarget(o)} />)}
      </div>

      <Sheet open={!!target} onClose={() => setTarget(null)} title="예약을 취소할까요?">
        <p className="text-sm text-ink-600">
          취소하면 되돌릴 수 없어요. 재고는 다른 손님에게 돌아갑니다.
        </p>
        {cancel.isError && (
          <p className="mt-2 text-sm text-danger">
            {(cancel.error as Error)?.message ?? '취소에 실패했어요.'}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="danger" fullWidth loading={cancel.isPending} onClick={doCancel}>
            예약 취소하기
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setTarget(null)}>
            닫기
          </Button>
        </div>
      </Sheet>
    </>
  )
}

function OrderRow({ order, onCancel }: { order: Order; onCancel: () => void }) {
  const { data: sale } = useSale(order.sale_id)
  const cancellable = CANCELLABLE.includes(order.status)

  return (
    <div className="flex items-center gap-3.5 border-b border-line-soft py-4 last:border-0">
      <Link to={`/orders/${order.id}`} className="flex min-w-0 flex-1 items-center gap-3.5">
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
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-[15px] font-extrabold text-ink-900 tnum">
          {formatWon(order.total_price)}
        </span>
        {cancellable && (
          <button
            onClick={onCancel}
            className="-my-1 -mr-1 px-1 py-2 text-[13px] font-semibold text-danger"
          >
            예약 취소
          </button>
        )}
      </div>
    </div>
  )
}
