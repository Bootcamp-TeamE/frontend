import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CategoryFilter,
  EmptyState,
  MapIcon,
  SaleCard,
  SaleCardSkeleton,
} from '../../components'
import { useCategories, useNow, useSearchSales, useUnits } from '../../hooks'
import { useLocationStore } from '../../store'
import { cn } from '../../lib/cn'
import type { Sale } from '../../types'

const RADIUS = 2000

type SortKey = 'nearest' | 'closing' | 'discount'
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'nearest', label: '가까운 순' },
  { key: 'closing', label: '마감임박' },
  { key: 'discount', label: '할인율' },
]

function sortSales(list: Sale[], sort: SortKey): Sale[] {
  const soldRank = (s: Sale) => (s.status !== 'active' || s.remaining_quantity <= 0 ? 1 : 0)
  const cmp: Record<SortKey, (a: Sale, b: Sale) => number> = {
    nearest: (a, b) => (a.store_distance_m ?? 9e9) - (b.store_distance_m ?? 9e9),
    closing: (a, b) => new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime(),
    discount: (a, b) => b.discount_rate - a.discount_rate,
  }
  return [...list].sort((a, b) => soldRank(a) - soldRank(b) || cmp[sort](a, b))
}

export function HomePage() {
  const { lat, lng, label, setLocation } = useLocationStore()
  const [category, setCategory] = useState<string | undefined>()
  const [sort, setSort] = useState<SortKey>('nearest')
  const now = useNow(1000)

  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const {
    data: sales,
    isLoading,
    isError,
    error,
  } = useSearchSales({ lat, lng, radius: RADIUS, category })

  const catName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.code, c.name_ko])),
    [categories],
  )
  const unitName = useMemo(
    () => Object.fromEntries(units.map((u) => [u.code, u.name_ko])),
    [units],
  )

  const sorted = useMemo(() => (sales ? sortSales(sales, sort) : undefined), [sales, sort])
  const openCount =
    sorted?.filter((s) => s.status === 'active' && s.remaining_quantity > 0).length ?? 0

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(pos.coords.latitude, pos.coords.longitude, '현재 위치'),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className="bg-paper">
      {/* 위치 헤더 */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-paper/95 px-5 pt-5 pb-2 backdrop-blur">
        <button
          onClick={requestCurrentLocation}
          className="inline-flex items-center gap-2 text-[15px] font-bold text-ink-900"
        >
          <span className="h-[7px] w-[7px] rounded-full bg-primary" />
          {label}
          <span className="text-ink-400">▾</span>
        </button>
        <Link
          to="/map"
          aria-label="지도 보기"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line-strong bg-surface text-ink-700"
        >
          <MapIcon className="h-[18px] w-[18px]" />
        </Link>
      </header>

      {/* 히어로 카피 */}
      <div className="px-5 pt-3 pb-4">
        <h1 className="text-[27px] font-bold leading-[1.2] tracking-[-0.8px] text-ink-900">
          오늘 마감,
          <br />
          동네에서 담아요
        </h1>
        <p className="mt-2 text-[13px] text-ink-600">
          반경 {(RADIUS / 1000).toLocaleString()}km · 지금 마감세일{' '}
          <span className="font-bold text-primary">{openCount}곳</span>
        </p>
      </div>

      {/* 정렬 칩 */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={cn(
              'shrink-0 rounded-pill px-4 py-2 text-[13px] font-semibold transition-colors',
              sort === s.key
                ? 'bg-ink-900 text-white'
                : 'border border-line-strong bg-surface text-ink-600',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 카테고리 칩 */}
      <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />

      {/* 리스트 */}
      <div className="mt-1 min-h-[60vh] bg-surface px-5">
        {isLoading && (
          <div>
            {[0, 1, 2, 3].map((i) => (
              <SaleCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <p className="py-16 text-center text-sm text-danger">
            데이터를 불러오지 못했어요.
            <br />
            <span className="text-xs text-ink-400">{(error as Error)?.message}</span>
          </p>
        )}

        {sorted && sorted.length === 0 && (
          <EmptyState
            title="주변에 진행 중인 마감세일이 없어요"
            description="카테고리를 바꾸거나 잠시 후 다시 확인해 보세요."
          />
        )}

        {sorted?.map((sale) => (
          <SaleCard
            key={sale.id}
            sale={sale}
            categoryLabel={catName[sale.category_code] ?? sale.category_code}
            unitLabel={unitName[sale.unit_code] ?? '개'}
            now={now}
          />
        ))}
      </div>
    </div>
  )
}
