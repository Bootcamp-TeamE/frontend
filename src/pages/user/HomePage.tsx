import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  CategoryFilter,
  EmptyState,
  LocationIcon,
  MapIcon,
  SaleCard,
  SaleCardSkeleton,
} from '../../components'
import { useCategories, useNow, useSearchSales, useUnits } from '../../hooks'
import { useLocationStore } from '../../store'

const MAX_RADIUS = 10000

export function HomePage() {
  const { lat, lng, label, setLocation } = useLocationStore()
  const [category, setCategory] = useState<string | undefined>()
  const [radius, setRadius] = useState(1000)
  const now = useNow(1000)

  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const { data: sales, isLoading, isError, error } = useSearchSales({ lat, lng, radius, category })

  const catName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.code, c.name_ko])),
    [categories],
  )
  const unitName = useMemo(
    () => Object.fromEntries(units.map((u) => [u.code, u.name_ko])),
    [units],
  )

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(pos.coords.latitude, pos.coords.longitude, '현재 위치'),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white/95 px-5 pb-1 pt-5 backdrop-blur">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-extrabold text-stone-900">내 주변 마감할인</h1>
          <Link to="/map">
            <Button variant="secondary" size="sm">
              <MapIcon className="h-4 w-4" />
              지도
            </Button>
          </Link>
        </div>
        <button
          onClick={requestCurrentLocation}
          className="mt-1 inline-flex items-center gap-1 text-sm text-stone-500"
        >
          <LocationIcon className="h-4 w-4 text-primary" />
          {label} · 반경 {(radius / 1000).toLocaleString()}km
        </button>
      </header>

      <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />

      <div className="space-y-3 px-5 pb-4 pt-1">
        {isLoading && [0, 1, 2, 3].map((i) => <SaleCardSkeleton key={i} />)}

        {isError && (
          <p className="py-12 text-center text-sm text-danger">
            백엔드에 연결하지 못했습니다.
            <br />
            서버(uvicorn)가 켜져 있는지 확인하세요.
            <br />
            <span className="text-xs text-stone-400">{(error as Error)?.message}</span>
          </p>
        )}

        {sales && sales.length === 0 && (
          <EmptyState
            title="주변에 진행 중인 마감세일이 없어요"
            description="반경을 넓히거나 위치를 옮겨 보세요."
            action={
              radius < MAX_RADIUS ? (
                <Button
                  variant="secondary"
                  onClick={() => setRadius((r) => Math.min(r + 1000, MAX_RADIUS))}
                >
                  반경 넓히기
                </Button>
              ) : undefined
            }
          />
        )}

        {sales?.map((sale) => (
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
