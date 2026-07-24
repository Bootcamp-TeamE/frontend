import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  EmptyState,
  HeartIcon,
  LoadingScreen,
  TopBar,
} from '../../components'
import {
  useCategories,
  useFavorites,
  useStore,
  useStoreSales,
  useToggleFavorite,
  useUnits,
} from '../../hooks'
import { useAuthStore } from '../../store'
import { categoryTint } from '../../lib/category'
import { cn } from '../../lib/cn'
import { formatHHmm, formatWon } from '../../lib/format'
import type { Sale } from '../../types'

export function StoreDetailPage() {
  const { id } = useParams()
  const storeId = Number(id)
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.userId)

  const { data: store, isLoading, isError } = useStore(storeId)
  const { data: sales = [] } = useStoreSales(storeId)
  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const { ids: favoriteIds } = useFavorites(userId)
  const toggleFavorite = useToggleFavorite(userId)
  const liked = favoriteIds.has(storeId)

  if (isLoading) {
    return (
      <>
        <TopBar title="매장 상세" />
        <LoadingScreen />
      </>
    )
  }
  if (isError || !store) {
    return (
      <>
        <TopBar title="매장 상세" />
        <EmptyState
          title="매장을 찾을 수 없어요"
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
    categories.find((c) => c.code === store.category_code)?.name_ko ?? store.category_code
  const unitName = Object.fromEntries(units.map((u) => [u.code, u.name_ko]))
  // 오늘 마감 = 판매 중 세일 중 가장 늦은 마감
  const latest = sales
    .map((s) => s.deadline_at)
    .sort()
    .at(-1)

  return (
    <>
      <TopBar title="매장 상세" />

      {/* 상단 이미지 자리 200px — 사진 없어 카테고리 톤+줄무늬 질감으로 대체 */}
      <div className={cn('thumb-stripe h-[200px]', categoryTint(store.category_code))} />

      <div className="px-5">
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold text-ink-900">{store.name}</h1>
            <p className="mt-1 text-[13px] text-ink-600">
              {catLabel}
              {store.address && ` · ${store.address}`}
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-[13px] text-ink-600">
              <HeartIcon className="h-4 w-4 text-danger" filled />
              <span className="font-bold text-ink-900">관심 {store.favorite_count ?? 0}</span>
              {latest && <span className="text-ink-400"> · 오늘 {formatHHmm(latest)} 마감</span>}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite.mutate({ storeId, favorited: liked })}
            disabled={toggleFavorite.isPending}
            aria-label={liked ? '관심 매장 해제' : '관심 매장 등록'}
            aria-pressed={liked}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors',
              liked ? 'border-danger/30 bg-danger-50 text-danger' : 'border-line-strong text-ink-400',
            )}
          >
            <HeartIcon className="h-[20px] w-[20px]" filled={liked} />
          </button>
        </div>

        <div className="my-4 border-t border-line-soft" />

        <h2 className="text-[15px] font-bold text-ink-900">판매 중인 마감세일</h2>
        <div className="mt-2 pb-8">
          {sales.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-400">
              지금은 진행 중인 마감세일이 없어요.
            </p>
          )}
          {sales.map((sale) => (
            <StoreSaleRow
              key={sale.id}
              sale={sale}
              categoryLabel={catLabel}
              unitLabel={unitName[sale.unit_code] ?? '개'}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function StoreSaleRow({
  sale,
  categoryLabel,
  unitLabel,
}: {
  sale: Sale
  categoryLabel: string
  unitLabel: string
}) {
  const soldout = sale.status !== 'active' || sale.remaining_quantity <= 0
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-line-soft py-3.5 last:border-0',
        soldout && 'opacity-50',
      )}
    >
      <div
        className={cn(
          'flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-thumb text-xs font-extrabold',
          categoryTint(sale.category_code),
        )}
      >
        {categoryLabel.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink-900">{sale.title}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[12px] font-extrabold text-primary tnum">{sale.discount_rate}%</span>
          <span className="text-[11px] text-ink-300 line-through tnum">
            {formatWon(sale.normal_price)}
          </span>
          <span className="text-[15px] font-extrabold text-ink-900 tnum">
            {formatWon(sale.sale_price)}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-ink-400">
          {soldout ? '품절' : `${sale.remaining_quantity}${unitLabel} 남음`}
        </p>
      </div>
      {soldout ? (
        <span className="shrink-0 rounded-[10px] bg-line px-4 py-2 text-[13px] font-semibold text-ink-400">
          마감
        </span>
      ) : (
        <Link
          to={`/sales/${sale.id}`}
          className="shrink-0 rounded-[10px] bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary-800"
        >
          예약
        </Link>
      )}
    </div>
  )
}
