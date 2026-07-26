import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  CategoryFilter,
  CheckIcon,
  EmptyState,
  HomeHeroBackdrop,
  ListSkeleton,
  LocationIcon,
  SaleCard,
  Spinner,
} from '../../components'
import {
  useCategories,
  useInfiniteScroll,
  useNow,
  usePullToRefresh,
  useSearchSales,
  useUnits,
} from '../../hooks'
import { useHomeUiStore, useLocationStore, useRecentStore } from '../../store'
import { cn } from '../../lib/cn'
import mascot from '../../assets/mascot.png'
import logo from '../../assets/logo.png'
import type { Sale } from '../../types'

const RADIUS = 1000

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
  const sort = useHomeUiStore((s) => s.sort)
  const setSort = useHomeUiStore((s) => s.setSort)
  const category = useHomeUiStore((s) => s.category)
  const setCategory = useHomeUiStore((s) => s.setCategory)
  const recent = useRecentStore((s) => s.items)
  const [showRecent, setShowRecent] = useState(false)
  const now = useNow(1000)

  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const {
    data: sales,
    isLoading,
    isError,
    error,
    refetch,
  } = useSearchSales({ lat, lng, radius: RADIUS, category })
  const { pull, refreshing } = usePullToRefresh(() => refetch())

  const catName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.code, c.name_ko])),
    [categories],
  )
  const unitName = useMemo(
    () => Object.fromEntries(units.map((u) => [u.code, u.name_ko])),
    [units],
  )

  const sorted = useMemo(() => (sales ? sortSales(sales, sort) : undefined), [sales, sort])
  // 최근 본: 최근 조회 순서 그대로, 마감 지난 항목은 제외(정렬 안 함).
  const recentActive = useMemo(
    () => recent.filter((s) => new Date(s.deadline_at).getTime() > now),
    [recent, now],
  )
  const openCount =
    sorted?.filter((s) => s.status === 'active' && s.remaining_quantity > 0).length ?? 0

  // 20개씩 끊어 보여주고, 바닥에 닿으면 더 불러온다.
  const activeList = showRecent ? recentActive : (sorted ?? [])
  const { visible, hasMore, sentinelRef } = useInfiniteScroll(activeList, {
    pageSize: 20,
    resetKey: `${showRecent}|${sort}|${category ?? 'all'}`,
  })

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
      {(pull > 0 || refreshing) && (
        <div
          className="pointer-events-none fixed left-1/2 top-3 z-40 -translate-x-1/2"
          style={{ opacity: refreshing ? 1 : Math.min(1, pull / 70) }}
        >
          <div className="rounded-full bg-surface p-2 shadow-card">
            <Spinner className="h-5 w-5 text-primary" />
          </div>
        </div>
      )}
      {/* 브랜드 헤더 + 위치 선택 */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-paper/95 px-5 pt-5 pb-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <img src={logo} alt="SOLDE 로고" className="h-7 w-7 rounded-[8px] object-cover" />
          <span className="text-[19px] font-extrabold tracking-[-0.2px] text-primary">SOLDE</span>
        </div>
        <button
          onClick={requestCurrentLocation}
          aria-label="현재 위치로 설정"
          className="inline-flex max-w-[56%] items-center gap-1 rounded-pill border border-line-strong bg-surface px-3 py-1.5 text-[13px] font-semibold text-ink-700 active:bg-paper"
        >
          <LocationIcon className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{label}</span>
          <span className="shrink-0 text-ink-400">▾</span>
        </button>
      </header>

      {/* 히어로 — 코드로 그린 마켓 배경 위에 마스코트(누끼)가 서서 마감 할인을 건네는 장면 */}
      <div className="relative flex min-h-[200px] items-center overflow-hidden px-5 pt-3 pb-4">
        <HomeHeroBackdrop className="pointer-events-none absolute inset-0 h-full w-full" />
        <img
          src={mascot}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-1 h-[158px] w-auto select-none drop-shadow-[0_6px_10px_rgba(20,19,15,0.10)]"
        />
        <div className="relative z-10 max-w-[58%]">
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
      </div>

      {/* 카테고리 스크롤 레일 (스크롤 시 헤더 아래 고정) */}
      <div className="sticky top-14 z-[9] bg-paper">
        <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
      </div>

      {/* 리스트 — 크림 상단에서 올라온 시트로 seam 완화 */}
      <div className="mt-3 min-h-[60vh] rounded-t-[22px] bg-surface px-5 pt-3 shadow-sheet-soft">
        {/* 리스트 헤더: 결과 수 + 정렬 */}
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-ink-500">
            {showRecent ? `최근 본 ${recentActive.length}개` : `지금 마감세일 ${openCount}개`}
          </p>
          <SortMenu
            sort={sort}
            showRecent={showRecent}
            hasRecent={recent.length > 0}
            onSort={(k) => {
              setSort(k)
              setShowRecent(false)
            }}
            onRecent={() => setShowRecent(true)}
          />
        </div>

        {showRecent && recentActive.length === 0 && (
          <EmptyState
            title="최근 본 상품이 없어요"
            description="상품을 둘러보면 여기에 최근 본 순서로 쌓여요."
          />
        )}

        {!showRecent && isLoading && <ListSkeleton count={4} />}

        {!showRecent && isError && (
          <EmptyState
            title="데이터를 불러오지 못했어요"
            description={(error as Error)?.message ?? '잠시 후 다시 시도해 주세요.'}
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                다시 시도
              </Button>
            }
          />
        )}

        {!showRecent && sorted && sorted.length === 0 && (
          <div className="relative overflow-hidden">
            {/* 은은한 배경 글로우 — 빈 영역 휑함 완화(배경색 변경 아님) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-6 flex justify-center"
            >
              <div className="h-56 w-56 rounded-full bg-primary-50/70 blur-3xl" />
            </div>
            <div className="relative">
              <EmptyState
                title="주변에 진행 중인 마감세일이 없어요"
                description="카테고리를 바꾸거나 반경을 넓혀 보세요."
                action={
                  <Link to="/map">
                    <Button variant="secondary">지도에서 둘러보기</Button>
                  </Link>
                }
              />
            </div>
          </div>
        )}

        {visible.map((sale) => (
          <SaleCard
            key={sale.id}
            sale={sale}
            categoryLabel={catName[sale.category_code] ?? sale.category_code}
            unitLabel={unitName[sale.unit_code] ?? '개'}
            now={now}
          />
        ))}
        {hasMore && (
          <div ref={sentinelRef} className="py-4 text-center text-[12px] text-ink-400">
            더 불러오는 중…
          </div>
        )}
      </div>
    </div>
  )
}

// 정렬 드롭다운 — 리스트 헤더 우측. 정렬 3종 + '최근 본' 보기 모드.
function SortMenu({
  sort,
  showRecent,
  hasRecent,
  onSort,
  onRecent,
}: {
  sort: SortKey
  showRecent: boolean
  hasRecent: boolean
  onSort: (key: SortKey) => void
  onRecent: () => void
}) {
  const [open, setOpen] = useState(false)
  const current = showRecent ? '최근 본' : (SORTS.find((s) => s.key === sort)?.label ?? '정렬')
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-[13px] font-bold text-ink-800"
      >
        {current}
        <span className={cn('text-[10px] text-ink-400 transition-transform', open && 'rotate-180')}>▾</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-30 mt-1 w-32 overflow-hidden rounded-card border border-line bg-surface py-1 shadow-card">
            {SORTS.map((s) => {
              const active = !showRecent && sort === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => {
                    onSort(s.key)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-left text-[13px]',
                    active ? 'font-bold text-primary' : 'text-ink-700',
                  )}
                >
                  {s.label}
                  {active && <CheckIcon className="h-4 w-4" />}
                </button>
              )
            })}
            {hasRecent && (
              <button
                onClick={() => {
                  onRecent()
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between border-t border-line-soft px-3 py-2 text-left text-[13px]',
                  showRecent ? 'font-bold text-primary' : 'text-ink-700',
                )}
              >
                최근 본
                {showRecent && <CheckIcon className="h-4 w-4" />}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
