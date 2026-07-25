import { Link, useNavigate, useParams } from 'react-router-dom'
import { CustomOverlayMap, Map } from 'react-kakao-maps-sdk'
import {
  Button,
  EmptyState,
  HeartIcon,
  LoadingScreen,
  LocationIcon,
  SalePrice,
  SaleThumb,
  TopBar,
} from '../../components'
import {
  useCategories,
  useFavorites,
  useNow,
  useStore,
  useStoreSales,
  useToggleFavorite,
  useUnits,
} from '../../hooks'
import { useAuthStore, useLocationStore } from '../../store'
import { isKakaoKeyConfigured, useKakaoMapLoader } from '../../lib/kakao'
import { categoryTint } from '../../lib/category'
import { cn } from '../../lib/cn'
import { formatHHmm } from '../../lib/format'
import { isSoldout } from '../../lib/sale'
import type { Sale } from '../../types'

export function StoreDetailPage() {
  const { id } = useParams()
  const storeId = Number(id)
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.userId)
  const origin = useLocationStore()
  const now = useNow(1000)

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
  // 홈과 동일하게 활성·미마감만 노출(엔드포인트 필터 + 클라이언트 방어).
  const activeSales = sales.filter(
    (s) => s.status === 'active' && new Date(s.deadline_at).getTime() > now,
  )
  // 오늘 마감 = 판매 중 세일 중 가장 늦은 마감
  const latest = activeSales
    .map((s) => s.deadline_at)
    .sort()
    .at(-1)

  const openDirections = () => {
    // 출발지는 서비스 내 현재 위치(GPS 허용 시 '현재 위치', 아니면 기본 위치).
    const from = `${encodeURIComponent(origin.label)},${origin.lat},${origin.lng}`
    const to = `${encodeURIComponent(store.name)},${store.lat},${store.lng}`
    window.open(`https://map.kakao.com/link/from/${from}/to/${to}`, '_blank', 'noopener')
  }

  return (
    <>
      <TopBar title="매장 상세" />

      {/* 상단 = 지도상 매장 위치 + 길찾기 */}
      <div className="relative h-[200px]">
        {isKakaoKeyConfigured ? (
          <StoreLocationMap lat={store.lat} lng={store.lng} name={store.name} />
        ) : (
          <div className={cn('thumb-stripe h-full', categoryTint(store.category_code))} />
        )}
        <button
          onClick={openDirections}
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-pill bg-surface/95 px-3.5 py-2 text-[13px] font-semibold text-ink-800 shadow-card backdrop-blur"
        >
          <LocationIcon className="h-4 w-4 text-primary" />
          길찾기
        </button>
      </div>

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
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors',
              liked ? 'border-danger/30 bg-danger-50 text-danger' : 'border-line-strong text-ink-400',
            )}
          >
            <HeartIcon className="h-[20px] w-[20px]" filled={liked} />
          </button>
        </div>

        <div className="my-4 border-t border-line-soft" />

        <h2 className="text-[15px] font-bold text-ink-900">판매 중인 마감세일</h2>
        <div className="mt-2 pb-8">
          {activeSales.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-400">
              지금은 진행 중인 마감세일이 없어요.
            </p>
          )}
          {activeSales.map((sale) => (
            <StoreSaleRow
              key={sale.id}
              sale={sale}
              categoryLabel={catLabel}
              unitLabel={unitName[sale.unit_code] ?? '개'}
              now={now}
            />
          ))}
        </div>
      </div>
    </>
  )
}

// 상단 매장 위치 미니맵(정적) — 카카오키 있을 때만.
function StoreLocationMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const [loading, error] = useKakaoMapLoader()
  if (loading || error) return <div className="h-full w-full bg-line" />
  return (
    <Map
      center={{ lat, lng }}
      level={3}
      style={{ width: '100%', height: '100%' }}
      draggable={false}
      zoomable={false}
    >
      <CustomOverlayMap position={{ lat, lng }} yAnchor={1}>
        <div className="flex flex-col items-center">
          <div className="max-w-[160px] truncate rounded-pill bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-locator">
            {name}
          </div>
          <div className="-mt-1 h-2.5 w-2.5 rotate-45 bg-primary" />
        </div>
      </CustomOverlayMap>
    </Map>
  )
}

function StoreSaleRow({
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
  const deadlineMs = new Date(sale.deadline_at).getTime()
  const closingSoon = deadlineMs > now && deadlineMs - now < 60 * 60 * 1000
  const total = sale.total_quantity || 0
  const remainPct = total > 0 ? Math.max(0, Math.min(100, (sale.remaining_quantity / total) * 100)) : 0
  const barColor = remainPct <= 20 ? '#c0392b' : remainPct <= 50 ? '#c49a3e' : '#557a88'
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-line-soft py-3.5 last:border-0',
        soldout && 'opacity-50',
      )}
    >
      <SaleThumb sale={sale} size="md" label={categoryLabel} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[14px] font-semibold text-ink-900">{sale.title}</p>
          {closingSoon && (
            <span className="shrink-0 rounded-full bg-danger-50 px-1.5 py-0.5 text-[10px] font-bold text-danger">
              마감임박
            </span>
          )}
        </div>
        <div className="mt-1">
          <SalePrice sale={sale} size="sm" />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[12px] text-ink-400">
            {soldout ? '품절' : `${sale.remaining_quantity}${unitLabel} 남음`}
          </span>
          {!soldout && total > 0 && (
            <div className="h-1 w-12 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full"
                style={{ width: `${remainPct}%`, backgroundColor: barColor }}
              />
            </div>
          )}
        </div>
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
