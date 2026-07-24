import { useState } from 'react'
import type { ReactNode } from 'react'
import { Badge, Button, Spinner } from '../../components'
import { useLookupOrder, usePickupOrder, useSale } from '../../hooks'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '../../lib/order'
import { formatWon } from '../../lib/format'

export function OwnerScanPage() {
  const [code, setCode] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { data: order, isLoading, isFetching, isError, error } = useLookupOrder(submitted, !!submitted)
  const { data: sale } = useSale(order?.sale_id)
  const pickup = usePickupOrder()

  const lookup = () => setSubmitted(code.trim())

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold text-ink-900">QR 확인</h1>
      <p className="mt-1 text-sm text-ink-500">
        손님의 픽업번호(또는 QR 토큰)를 입력해 주문을 확인하고 픽업 처리해요.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && lookup()}
          placeholder="예: A-142"
          className="w-full rounded-card border border-line-strong bg-surface px-4 py-3 text-[15px] font-semibold text-ink-900 placeholder:text-ink-300 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <Button className="shrink-0 rounded-[12px]" disabled={!code.trim()} onClick={lookup}>
          조회
        </Button>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <Spinner className="h-4 w-4" /> 조회 중…
          </div>
        )}

        {isError && submitted && (
          <div className="rounded-card-lg border border-danger-50 bg-danger-50 px-5 py-4 text-sm text-danger">
            {(error as Error)?.message ?? '주문을 찾을 수 없어요.'}
          </div>
        )}

        {order && (
          <div className="rounded-card-lg border border-line bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[22px] font-extrabold tracking-[2px] text-ink-900">
                {order.pickup_no ?? `#${order.id}`}
              </span>
              <Badge tone={ORDER_STATUS_TONE[order.status]}>
                {ORDER_STATUS_LABEL[order.status]}
              </Badge>
            </div>

            <div className="mt-4 space-y-2 border-t border-line-soft pt-4 text-[14px]">
              <Row label="상품">{sale?.title ?? '마감세일'}</Row>
              <Row label="수량">{order.quantity}</Row>
              <Row label="결제금액">
                <span className="font-bold text-ink-900 tnum">{formatWon(order.total_price)}</span>
              </Row>
            </div>

            <div className="mt-5">
              {order.status === 'paid' && (
                <Button
                  fullWidth
                  size="lg"
                  className="rounded-[12px]"
                  loading={pickup.isPending || isFetching}
                  onClick={() => pickup.mutate(order.id)}
                >
                  픽업 완료 처리
                </Button>
              )}
              {order.status === 'picked_up' && (
                <p className="text-center text-sm font-semibold text-primary">
                  이미 픽업 완료된 주문이에요.
                </p>
              )}
              {order.status === 'reserved' && (
                <p className="text-center text-sm text-ink-500">
                  아직 결제 전이에요. 결제 완료 후 픽업할 수 있어요.
                </p>
              )}
              {(order.status === 'cancelled' || order.status === 'expired') && (
                <p className="text-center text-sm text-danger">
                  {ORDER_STATUS_LABEL[order.status]}된 주문이에요.
                </p>
              )}
              {pickup.isError && (
                <p className="mt-2 text-center text-sm text-danger">
                  {(pickup.error as Error)?.message ?? '처리에 실패했어요.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="text-ink-900">{children}</span>
    </div>
  )
}
