import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Button, CheckIcon, ClockIcon, EmptyState, LoadingScreen, TopBar } from '../../components'
import { useCopy, useNow, useOrder, usePayOrder, useSale, useStore } from '../../hooks'
import { categoryTint } from '../../lib/category'
import { resolveImageUrl } from '../../lib/image'
import { cn } from '../../lib/cn'
import { formatDistance, formatHHmm, formatWon } from '../../lib/format'
import type { Order, Sale, Store } from '../../types'

// 결제 후 픽업 마감까지의 시간(백엔드 PICKUP_HOLD_MINUTES와 동일). 지나면 자동 환불.
const PICKUP_HOLD_MINUTES = 30

const PAY_METHODS = [
  { key: 'easy', label: '간편결제' },
  { key: 'card', label: '신용·체크카드' },
  { key: 'bank', label: '계좌이체' },
]

// 남은 밀리초 → "27:35" (픽업 창은 30분 이내라 mm:ss로 충분).
function formatMMSS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

export function OrderDetailPage() {
  const { id } = useParams()
  const orderId = Number(id)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { data: order, isLoading, isError } = useOrder(orderId)
  const { data: sale } = useSale(order?.sale_id)
  const { data: store } = useStore(sale?.store_id)
  const pay = usePayOrder()
  const [showQr, setShowQr] = useState(() => searchParams.get('qr') === '1')

  if (isLoading) {
    return (
      <>
        <TopBar title="결제" />
        <LoadingScreen />
      </>
    )
  }
  if (isError || !order) {
    return (
      <>
        <TopBar title="결제" />
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

  // 결제 대기 → 결제 화면
  if (order.status === 'reserved') {
    return (
      <CheckoutView
        order={order}
        sale={sale}
        store={store}
        paying={pay.isPending}
        error={pay.isError ? ((pay.error as Error)?.message ?? '결제에 실패했어요.') : null}
        onPay={() => pay.mutate(order.id)}
      />
    )
  }

  // 결제 완료 → 예약 완료 / QR
  if (order.status === 'paid') {
    return showQr ? (
      <QrView order={order} sale={sale} store={store} onBack={() => setShowQr(false)} />
    ) : (
      <CompleteView
        order={order}
        sale={sale}
        onShowQr={() => setShowQr(true)}
        onMyOrders={() => navigate('/orders')}
        onHome={() => navigate('/')}
      />
    )
  }

  // 픽업 완료 / 취소 / 만료
  return (
    <>
      <TopBar title="예약" />
      <div className="flex flex-col items-center gap-3 px-5 py-20 text-center">
        <p className="text-lg font-bold text-ink-900">
          {order.status === 'picked_up' ? '픽업이 완료됐어요' : ''}
          {order.status === 'cancelled' ? '예약이 취소됐어요' : ''}
          {order.status === 'expired' ? '예약이 만료됐어요' : ''}
          {order.status === 'refunded' ? '자동 환불됐어요' : ''}
        </p>
        {order.status === 'expired' && (
          <p className="text-sm text-ink-400">
            5분 내 결제가 이뤄지지 않아 재고가 원복됐어요.
          </p>
        )}
        {order.status === 'refunded' && (
          <p className="text-sm text-ink-400">
            픽업 시간(30분)이 지나 결제가 환불 처리됐어요.
          </p>
        )}
        <Button variant="secondary" className="mt-2" onClick={() => navigate('/')}>
          다른 마감세일 보기
        </Button>
      </div>
    </>
  )
}

// ── 주문 상품 카드(공통) ──
function OrderLineCard({ order, sale, store }: { order: Order; sale?: Sale; store?: Store }) {
  const dist = formatDistance(sale?.store_distance_m ?? store?.distance_m)
  return (
    <div className="flex items-center gap-3 rounded-card border border-line-soft bg-surface p-3">
      {resolveImageUrl(sale?.image_url) ? (
        <img
          src={resolveImageUrl(sale?.image_url) as string}
          alt={sale?.title ?? ''}
          className="h-14 w-14 shrink-0 rounded-thumb object-cover"
        />
      ) : (
        <div
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-thumb text-xs font-extrabold',
            categoryTint(sale?.category_code ?? ''),
          )}
        >
          {(sale?.store_name ?? sale?.title ?? '').slice(0, 2)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-ink-900">
          {sale?.title ?? '마감세일'} × {order.quantity}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-ink-400">
          {sale?.store_name ?? store?.name ?? ''}
          {dist && ` · ${dist}`}
        </p>
      </div>
    </div>
  )
}

// ── 5. 결제(mock) ──
function CheckoutView({
  order,
  sale,
  store,
  paying,
  error,
  onPay,
}: {
  order: Order
  sale?: Sale
  store?: Store
  paying: boolean
  error: string | null
  onPay: () => void
}) {
  const originalTotal = sale ? sale.normal_price * order.quantity : order.total_price
  const discount = originalTotal - order.total_price
  const [method, setMethod] = useState('easy')

  return (
    <>
      <TopBar title="결제" />
      <div className="px-5 pb-32">
        <div className="mt-3">
          <OrderLineCard order={order} sale={sale} store={store} />
        </div>

        {/* 결제 금액 카드 */}
        <div className="mt-4 rounded-card border border-line-soft bg-surface p-4">
          <div className="flex justify-between text-[14px] text-ink-600">
            <span>상품 금액</span>
            <span className="tnum">{formatWon(originalTotal)}</span>
          </div>
          {discount > 0 && (
            <div className="mt-2 flex justify-between text-[14px]">
              <span className="text-ink-600">마감 할인</span>
              <span className="font-semibold text-primary tnum">-{formatWon(discount)}</span>
            </div>
          )}
          <div className="my-3 border-t border-line-soft" />
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-ink-900">최종 결제금액</span>
            <span className="text-[20px] font-extrabold text-ink-900 tnum">
              {formatWon(order.total_price)}
            </span>
          </div>
        </div>

        {/* 정보 배너 */}
        <div className="mt-4 rounded-card bg-primary-50 px-4 py-3 text-[13px] text-primary-800">
          결제 후 30분 안에 매장에서 픽업해 주세요.
        </div>

        {/* 결제수단 선택(모의) */}
        <div className="mt-4 rounded-card border border-line-soft bg-surface p-2">
          <p className="px-2 pb-1 pt-1.5 text-[13px] font-semibold text-ink-900">결제수단</p>
          {PAY_METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMethod(m.key)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-left active:bg-paper"
            >
              <span className="text-[14px] text-ink-800">{m.label}</span>
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2',
                  method === m.key ? 'border-primary' : 'border-line-strong',
                )}
              >
                {method === m.key && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </span>
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-[430px] border-t border-line-soft bg-surface px-5 pt-3 pb-5">
          <Button
            fullWidth
            size="lg"
            className="rounded-[14px]"
            loading={paying}
            onClick={onPay}
          >
            {`${formatWon(order.total_price)} 결제하기`}
          </Button>
        </div>
      </div>
    </>
  )
}

// ── 6. 예약 완료 ──
function CompleteView({
  order,
  sale,
  onShowQr,
  onMyOrders,
  onHome,
}: {
  order: Order
  sale?: Sale
  onShowQr: () => void
  onMyOrders: () => void
  onHome: () => void
}) {
  return (
    <>
      <TopBar title="예약 완료" />
      <div className="flex min-h-[70vh] flex-col px-5 pb-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-primary-50 text-primary">
            <CheckIcon className="h-9 w-9" />
          </div>
          <h1 className="mt-4 text-[23px] font-bold text-ink-900">예약이 완료됐어요</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-600">
            픽업 시간 안에 방문해
            <br />
            픽업번호나 QR을 보여주세요.
          </p>

          {/* 요약 카드 */}
          <div className="mt-6 w-full rounded-card bg-paper p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-600">픽업번호</span>
              <span className="font-mono text-[20px] font-extrabold tracking-[2px] text-ink-900">
                {order.pickup_no}
              </span>
            </div>
            <div className="my-3 border-t border-line" />
            <div className="flex items-center justify-between text-[14px]">
              <span className="truncate text-ink-900">
                {sale?.title ?? '마감세일'} × {order.quantity}
              </span>
              <span className="font-bold text-ink-900 tnum">{formatWon(order.total_price)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button fullWidth size="lg" className="rounded-[14px]" onClick={onShowQr}>
            QR 코드 보기
          </Button>
          <Button variant="ghost" fullWidth size="lg" className="rounded-[14px] border border-line-strong" onClick={onMyOrders}>
            내 예약 보기
          </Button>
          <button
            type="button"
            onClick={onHome}
            className="mt-1 py-2 text-[14px] font-semibold text-ink-400 active:text-ink-600"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </>
  )
}

// ── 7. QR 픽업 ──
function QrView({
  order,
  sale,
  store,
  onBack,
}: {
  order: Order
  sale?: Sale
  store?: Store
  onBack: () => void
}) {
  const [showNo, setShowNo] = useState(false)
  const { copied, copy } = useCopy()
  const now = useNow(1000)
  const deadlineMs = order.paid_at
    ? new Date(order.paid_at).getTime() + PICKUP_HOLD_MINUTES * 60000
    : null
  const remainingMs = deadlineMs != null ? deadlineMs - now : null
  const expired = remainingMs != null && remainingMs <= 0
  const urgent = remainingMs != null && remainingMs > 0 && remainingMs <= 5 * 60000

  return (
    <>
      <TopBar title="픽업 QR" onBack={onBack} />
      <div className="flex flex-col items-center px-5 pb-10">
        <p className="mt-4 text-[14px] text-ink-600">매장에서 이 QR을 보여주세요</p>

        <div className="mt-4 rounded-[22px] border border-line-soft bg-surface p-6 shadow-card">
          {order.qr_token ? (
            <QRCodeSVG value={order.qr_token} size={184} fgColor="#111111" />
          ) : (
            <div className="h-[184px] w-[184px] bg-line" />
          )}
        </div>

        {deadlineMs != null && (
          <div
            className={cn(
              'mt-4 flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-[13px] font-semibold',
              expired
                ? 'bg-line text-ink-500'
                : urgent
                  ? 'bg-danger-50 text-danger'
                  : 'bg-paper text-ink-600',
            )}
          >
            <ClockIcon className="h-4 w-4" />
            {expired ? (
              '픽업 시간이 만료됐어요'
            ) : (
              <span>
                픽업 마감 {formatHHmm(new Date(deadlineMs).toISOString())} ·{' '}
                <span className="tnum font-bold">{formatMMSS(remainingMs as number)}</span> 남음
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => order.pickup_no && copy(order.pickup_no)}
          className="mt-5 flex flex-col items-center"
        >
          <span className="font-mono text-[30px] font-extrabold tracking-[3px] text-ink-900">
            {order.pickup_no}
          </span>
          <span className={cn('mt-1 text-[12px] font-semibold', copied ? 'text-primary' : 'text-ink-400')}>
            {copied ? '복사됨!' : '탭하여 번호 복사'}
          </span>
        </button>

        <div className="mt-6 w-full">
          <OrderLineCard order={order} sale={sale} store={store} />
        </div>

        {showNo ? (
          <p className="mt-6 text-center text-[13px] text-ink-600">
            픽업번호 <span className="font-mono font-bold text-ink-900">{order.pickup_no}</span> 를
            매장 직원에게 알려주세요.
          </p>
        ) : (
          <Button
            variant="ghost"
            fullWidth
            className="mt-6 border border-line-strong"
            onClick={() => setShowNo(true)}
          >
            픽업번호로 확인하기
          </Button>
        )}
      </div>
    </>
  )
}
