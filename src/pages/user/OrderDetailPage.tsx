import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Badge, Button, Card, EmptyState, LoadingScreen, TopBar } from '../../components'
import { useOrder, usePayOrder, useSale } from '../../hooks'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '../../lib/order'
import { formatWon } from '../../lib/format'
import type { OrderStatus } from '../../types'

// 예약하기 → 예약(재고 홀드) 생성 → 이 화면에서 결제. 상태에 따라 제목/내용이 바뀐다.
// 예약 취소는 이 화면이 아니라 "내 예약" 목록에서 한다.
const PAGE_TITLE: Record<OrderStatus, string> = {
  reserved: '결제',
  paid: '예약 완료',
  picked_up: '픽업 완료',
  cancelled: '예약 취소',
  expired: '예약 만료',
}

export function OrderDetailPage() {
  const { id } = useParams()
  const orderId = Number(id)
  const navigate = useNavigate()

  const { data: order, isLoading, isError } = useOrder(orderId)
  const { data: sale } = useSale(order?.sale_id)
  const pay = usePayOrder()

  if (isLoading) {
    return (
      <>
        <TopBar title="예약" />
        <LoadingScreen />
      </>
    )
  }

  if (isError || !order) {
    return (
      <>
        <TopBar title="예약" />
        <EmptyState
          title="예약을 찾을 수 없어요"
          action={
            <Button variant="secondary" onClick={() => navigate('/')}>
              홈으로
            </Button>
          }
        />
      </>
    )
  }

  return (
    <>
      <TopBar title={PAGE_TITLE[order.status]} />
      <div className="px-5 pb-10">
        <div className="mt-3 flex items-center justify-between">
          <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
          <span className="text-xs text-stone-400">예약번호 {order.pickup_no ?? `#${order.id}`}</span>
        </div>

        <Card className="mt-3 p-4">
          <p className="text-lg font-bold text-stone-900">{sale?.title ?? '마감세일'}</p>
          <div className="mt-2 flex justify-between text-sm text-stone-500">
            <span>수량</span>
            <span>{order.quantity}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-stone-500">결제 금액</span>
            <span className="font-bold text-stone-900">{formatWon(order.total_price)}</span>
          </div>
        </Card>

        {order.status === 'reserved' && (
          <div className="mt-5 space-y-2">
            <p className="text-center text-sm text-stone-400">
              예약이 잡혔어요. 10분 내 결제하지 않으면 자동 취소됩니다.
            </p>
            <Button fullWidth size="lg" disabled={pay.isPending} onClick={() => pay.mutate(order.id)}>
              {pay.isPending ? '결제 중…' : `${formatWon(order.total_price)} 결제하기 (mock)`}
            </Button>
            {pay.isError && (
              <p className="text-center text-sm text-danger">
                {(pay.error as Error)?.message ?? '결제에 실패했어요.'}
              </p>
            )}
          </div>
        )}

        {order.status === 'paid' && order.qr_token && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-stone-500">픽업 시 매장에 이 QR을 보여주세요</p>
            <div className="rounded-2xl border border-stone-200 p-4">
              <QRCodeSVG value={order.qr_token} size={200} />
            </div>
            <p className="text-lg font-extrabold text-stone-900">픽업번호 {order.pickup_no}</p>
            <Button variant="secondary" fullWidth className="mt-2" onClick={() => navigate('/')}>
              홈으로
            </Button>
          </div>
        )}

        {order.status === 'picked_up' && (
          <p className="mt-12 text-center text-lg font-bold text-success">픽업이 완료됐어요</p>
        )}

        {(order.status === 'cancelled' || order.status === 'expired') && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <p className="font-semibold text-stone-500">{ORDER_STATUS_LABEL[order.status]}</p>
            <Button variant="secondary" onClick={() => navigate('/')}>
              다른 마감세일 보기
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
