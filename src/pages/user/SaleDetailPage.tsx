import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  BoxIcon,
  ChevronRightIcon,
  ClockIcon,
  EmptyState,
  HeartIcon,
  LoadingScreen,
  LocationIcon,
  QuantityStepper,
  ShareIcon,
  Sheet,
  TopBar,
} from '../../components'
import {
  useCategories,
  useCopy,
  useCreateOrder,
  useFavorites,
  useNow,
  useSale,
  useStore,
  useToggleFavorite,
  useUnits,
} from '../../hooks'
import { toast, useAuthStore, useLocationStore, useRecentStore } from '../../store'
import { categoryTint } from '../../lib/category'
import { resolveImageUrl } from '../../lib/image'
import { cn } from '../../lib/cn'
import { formatDistance, formatHHmm, formatWon, remainingUntil } from '../../lib/format'
import { saleUrgency } from '../../lib/sale'

export function SaleDetailPage() {
  const { id } = useParams()
  const saleId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const origin = useLocationStore()
  const now = useNow(1000)

  const { data: sale, isLoading, isError } = useSale(saleId)
  const { data: store } = useStore(sale?.store_id)
  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const createOrder = useCreateOrder()

  const [qtyRaw, setQty] = useState<number | null>(null)
  const { ids: favoriteIds } = useFavorites()
  const toggleFavorite = useToggleFavorite()
  const liked = sale?.store_id != null && favoriteIds.has(sale.store_id)
  const { copy } = useCopy()
  const addRecent = useRecentStore((s) => s.add)
  useEffect(() => {
    if (sale) addRecent({ ...sale, store_name: sale.store_name ?? store?.name })
  }, [sale, store, addRecent])

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
  const countdown = remainingUntil(sale.deadline_at, now)
  const urgency = saleUrgency(sale.deadline_at, now)
  const soldout =
    sale.status !== 'active' || sale.remaining_quantity < sale.min_order || !countdown

  const maxQty = Math.max(sale.min_order, Math.min(sale.remaining_quantity, 3))
  const qty = qtyRaw ?? sale.min_order
  const total = qty * sale.sale_price
  const dist = formatDistance(sale.store_distance_m)
  const storeName = sale.store_name ?? store?.name ?? '매장'
  const destLat = store?.lat ?? sale.lat
  const destLng = store?.lng ?? sale.lng

  const share = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: `${sale.title} · 마감할인`, url }).catch(() => {})
      return
    }
    copy(url)
    toast('링크가 복사됐어요', 'success')
  }
  const openDirections = () => {
    if (destLat == null || destLng == null) return
    // 출발지는 서비스 내 현재 위치(GPS 허용 시 '현재 위치', 아니면 기본 위치).
    const from = `${encodeURIComponent(origin.label)},${origin.lat},${origin.lng}`
    const to = `${encodeURIComponent(storeName)},${destLat},${destLng}`
    window.open(`https://map.kakao.com/link/from/${from}/to/${to}`, '_blank', 'noopener')
  }

  const reserve = () => {
    // 비로그인 예약: 튕기지 말고 로그인 유도 후 이 상품으로 복귀.
    if (!accessToken) {
      toast('로그인이 필요합니다')
      navigate('/login', { state: { from: location.pathname + location.search } })
      return
    }
    createOrder.mutate(
      { sale_id: saleId, quantity: qty },
      { onSuccess: (order) => navigate(`/orders/${order.id}`) },
    )
  }

  return (
    <>
      <TopBar
        title="상품 상세"
        right={
          <div className="flex items-center">
            <button
              onClick={share}
              aria-label="공유"
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink-500"
            >
              <ShareIcon className="h-[22px] w-[22px]" />
            </button>
            <button
              onClick={() =>
                sale?.store_id != null &&
                toggleFavorite.mutate({ storeId: sale.store_id, favorited: liked })
              }
              disabled={toggleFavorite.isPending}
              aria-label={liked ? '관심 매장 해제' : '관심 매장 등록'}
              aria-pressed={liked}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full',
                liked ? 'text-danger' : 'text-ink-400',
              )}
            >
              <HeartIcon className="h-6 w-6" filled={liked} />
            </button>
          </div>
        }
      />

      <div className="px-5 pb-32">
        {/* 이미지 220px — 있으면 표시, 없으면 카테고리 톤 폴백 */}
        {resolveImageUrl(sale.image_url) ? (
          <img
            src={resolveImageUrl(sale.image_url) as string}
            alt={sale.title}
            className="mt-1 h-[220px] w-full rounded-card-lg object-cover"
          />
        ) : (
          <div
            className={cn(
              'mt-1 flex h-[220px] items-center justify-center rounded-card-lg text-xl font-extrabold',
              categoryTint(sale.category_code),
            )}
          >
            {catLabel}
          </div>
        )}

        {/* 상점명·거리 — 매장 상세 이동 + 길찾기 */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <Link
            to={`/stores/${sale.store_id}`}
            className="flex min-w-0 items-center gap-1 text-[13px] text-ink-600"
          >
            <span className="truncate font-semibold text-ink-900">{storeName}</span>
            {dist && <span className="shrink-0 text-ink-400"> · {dist}</span>}
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-300" />
          </Link>
          {destLat != null && destLng != null && (
            <button
              onClick={openDirections}
              className="flex shrink-0 items-center gap-1 rounded-pill border border-line-strong bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-700"
            >
              <LocationIcon className="h-4 w-4" />
              길찾기
            </button>
          )}
        </div>

        {/* 상품명 */}
        <h1 className="mt-1 text-[23px] font-bold tracking-[-0.5px] text-ink-900">{sale.title}</h1>
        {sale.description && (
          <p className="mt-1.5 whitespace-pre-line text-[14px] leading-relaxed text-ink-600">
            {sale.description}
          </p>
        )}

        {/* 가격줄 */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[13px] font-extrabold text-primary tnum">
            {sale.discount_rate}%
          </span>
          <span className="text-[15px] text-ink-300 line-through tnum">
            {formatWon(sale.normal_price)}
          </span>
          <span className="text-[27px] font-extrabold tracking-[-0.8px] text-ink-900 tnum">
            {formatWon(sale.sale_price)}
          </span>
        </div>

        {/* 마감 카운트다운 배너 */}
        {countdown && (
          <div
            className={cn(
              'mt-4 flex items-center justify-between rounded-card px-4 py-3',
              urgency === 'urgent' ? 'bg-danger-50' : urgency === 'soon' ? 'bg-amber-50' : 'bg-paper',
            )}
          >
            <span
              className={cn(
                'text-[13px] font-semibold',
                urgency === 'urgent' ? 'text-danger' : urgency === 'soon' ? 'text-amber' : 'text-ink-600',
              )}
            >
              마감까지
            </span>
            <span
              className={cn(
                'font-mono text-[18px] font-bold tracking-[1px] tnum',
                urgency === 'urgent' ? 'text-danger' : urgency === 'soon' ? 'text-amber' : 'text-ink-900',
              )}
            >
              {countdown}
            </span>
          </div>
        )}

        {/* 안내줄 */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-2 text-[13px] text-ink-600">
            <ClockIcon className="h-[18px] w-[18px] text-ink-400" />
            픽업 가능 시간 · {sale.pickup_window ?? `결제 후 마감 ${formatHHmm(sale.deadline_at)}까지`}
          </div>
          <div className="flex items-center gap-2 text-[13px] text-ink-600">
            <BoxIcon className="h-[18px] w-[18px] text-ink-400" />
            {soldout ? '재고 소진' : `남은 수량 ${sale.remaining_quantity}${unitLabel}`} · 1인 최대{' '}
            {Math.min(3, sale.remaining_quantity || 3)}
            {unitLabel}
          </div>
        </div>

        <div className="my-5 border-t border-line-soft" />

        {/* 수량 스테퍼 */}
        {!soldout && (
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-ink-900">수량</span>
            <QuantityStepper value={qty} min={sale.min_order} max={maxQty} onChange={setQty} />
          </div>
        )}
        {urgency === 'urgent' && !soldout && (
          <p className="mt-3 text-[12px] text-danger">마감이 얼마 남지 않았어요. 서둘러 예약해 주세요.</p>
        )}
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-[430px] border-t border-line-soft bg-surface px-5 pt-3 pb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] text-ink-600">총 결제금액</span>
            <span className="text-[18px] font-extrabold text-ink-900 tnum">{formatWon(total)}</span>
          </div>
          <Button
            fullWidth
            size="lg"
            className="rounded-[14px]"
            disabled={soldout}
            loading={createOrder.isPending}
            onClick={reserve}
          >
            {soldout ? '마감된 상품이에요' : '예약하고 결제하기'}
          </Button>
        </div>
      </div>

      <Sheet
        open={createOrder.isError}
        onClose={() => createOrder.reset()}
        title="예약에 실패했어요"
      >
        <p className="text-sm text-ink-600">
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
