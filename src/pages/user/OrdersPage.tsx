import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, EmptyState, LoadingScreen, Sheet, TopBar } from '../../components'
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
      {isLoading && <LoadingScreen />}
      {sorted && sorted.length === 0 && (
        <EmptyState
          title="예약 내역이 없어요"
          description="마감세일을 예약하면 여기에 표시됩니다."
        />
      )}
      <div className="space-y-3 px-5 py-3">
        {sorted?.map((o) => <OrderRow key={o.id} order={o} onCancel={() => setTarget(o)} />)}
      </div>

      <Sheet open={!!target} onClose={() => setTarget(null)} title="예약을 취소할까요?">
        <p className="text-sm text-stone-500">
          취소하면 되돌릴 수 없어요. 재고는 다른 손님에게 돌아갑니다.
        </p>
        {cancel.isError && (
          <p className="mt-2 text-sm text-danger">
            {(cancel.error as Error)?.message ?? '취소에 실패했어요.'}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="danger" fullWidth disabled={cancel.isPending} onClick={doCancel}>
            {cancel.isPending ? '취소 중…' : '예약 취소하기'}
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
    <Card className="flex items-center justify-between gap-3 p-4">
      <Link to={`/orders/${order.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
          <span className="text-xs text-stone-400">{order.pickup_no ?? `#${order.id}`}</span>
        </div>
        <p className="mt-1 truncate font-bold text-stone-900">{sale?.title ?? '마감세일'}</p>
        <p className="text-sm text-stone-400">수량 {order.quantity}</p>
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-extrabold text-stone-900">{formatWon(order.total_price)}</span>
        {cancellable && (
          <button onClick={onCancel} className="text-sm font-semibold text-danger">
            예약 취소
          </button>
        )}
      </div>
    </Card>
  )
}
