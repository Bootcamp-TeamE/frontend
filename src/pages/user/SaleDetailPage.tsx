import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, EmptyState, LoadingScreen, QuantityStepper, Sheet, TopBar } from '../../components'
import { useCategories, useCreateOrder, useNow, useSale, useStore, useUnits } from '../../hooks'
import { useAuthStore } from '../../store'
import { categoryTint } from '../../lib/category'
import { cn } from '../../lib/cn'
import { formatWon, remainingUntil } from '../../lib/format'

const CLOSING_SOON_MS = 30 * 60 * 1000

export function SaleDetailPage() {
  const { id } = useParams()
  const saleId = Number(id)
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.userId)
  const now = useNow(1000)

  const { data: sale, isLoading, isError } = useSale(saleId)
  const { data: store } = useStore(sale?.store_id)
  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const createOrder = useCreateOrder()

  // null이면 아직 사용자가 안 건드린 상태 → min_order를 기본값으로 파생.
  const [qtyRaw, setQty] = useState<number | null>(null)

  if (isLoading) {
    return (
      <>
        <TopBar title="상품 상세" />
        <LoadingScreen />
      </>
    )
  }

  if (isError || !sale) {
    return (
      <>
        <TopBar title="상품 상세" />
        <EmptyState
          title="상품을 찾을 수 없어요"
          description="이미 마감되었거나 삭제된 상품일 수 있어요."
          action={
            <Button variant="secondary" onClick={() => navigate('/')}>
              홈으로
            </Button>
          }
        />
      </>
    )
  }

  const catLabel =
    categories.find((c) => c.code === sale.category_code)?.name_ko ?? sale.category_code
  const unitLabel = units.find((u) => u.code === sale.unit_code)?.name_ko ?? '개'
  const remain = remainingUntil(sale.deadline_at, now)
  const closingSoon = !!remain && new Date(sale.deadline_at).getTime() - now < CLOSING_SOON_MS
  const soldout =
    sale.status !== 'active' ||
    sale.remaining_quantity < sale.min_order ||
    !remain
  const qty = qtyRaw ?? sale.min_order
  const total = qty * sale.sale_price

  const reserve = () =>
    createOrder.mutate(
      { user_id: userId, sale_id: saleId, quantity: qty },
      { onSuccess: (order) => navigate(`/orders/${order.id}`, { replace: true }) },
    )

  return (
    <>
      <TopBar title="상품 상세" />
      <div className="px-5 pb-28">
        <div
          className={cn(
            'mt-3 flex h-44 items-center justify-center rounded-2xl text-2xl font-extrabold',
            categoryTint(sale.category_code),
          )}
        >
          {catLabel}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge tone="neutral">{catLabel}</Badge>
          {soldout ? (
            <Badge tone="danger">품절</Badge>
          ) : (
            remain && (
              <span
                className={cn(
                  'text-sm font-bold tabular-nums',
                  closingSoon ? 'text-danger' : 'text-stone-400',
                )}
              >
                마감 {remain}
              </span>
            )
          )}
        </div>

        <h1 className="mt-2 text-2xl font-extrabold text-stone-900">{sale.title}</h1>
        {store && (
          <p className="mt-1 text-sm text-stone-500">
            {store.name}
            {store.address ? ` · ${store.address}` : ''}
          </p>
        )}

        <div className="mt-4 flex items-baseline gap-2">
          <Badge tone="primary">{sale.discount_rate}%</Badge>
          <span className="text-2xl font-extrabold text-stone-900">{formatWon(sale.sale_price)}</span>
          <span className="text-base text-stone-400 line-through">{formatWon(sale.normal_price)}</span>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          {unitLabel}당 · {soldout ? '재고 소진' : `${sale.remaining_quantity}${unitLabel} 남음`} · 최소 {sale.min_order}
          {unitLabel}
        </p>

        {!soldout && (
          <div className="mt-6 flex items-center justify-between">
            <span className="font-semibold text-stone-700">수량</span>
            <QuantityStepper
              value={qty}
              min={sale.min_order}
              max={sale.remaining_quantity}
              onChange={setQty}
            />
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-[430px] border-t border-stone-100 bg-white p-4">
          <Button
            fullWidth
            size="lg"
            disabled={soldout || createOrder.isPending}
            onClick={reserve}
          >
            {soldout
              ? '품절된 상품이에요'
              : createOrder.isPending
                ? '예약 중…'
                : `예약하기 · ${formatWon(total)}`}
          </Button>
        </div>
      </div>

      <Sheet open={createOrder.isError} onClose={() => createOrder.reset()} title="예약에 실패했어요">
        <p className="text-sm text-stone-500">
          {(createOrder.error as Error)?.message ?? '잠시 후 다시 시도해 주세요.'}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="secondary" fullWidth onClick={() => createOrder.reset()}>
            닫기
          </Button>
          <Button variant="ghost" fullWidth onClick={() => navigate('/')}>
            다른 마감세일 보기
          </Button>
        </div>
      </Sheet>
    </>
  )
}
