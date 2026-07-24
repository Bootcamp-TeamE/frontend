import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CustomOverlayMap, Map } from 'react-kakao-maps-sdk'
import { ChevronRightIcon, SalePrice, SaleThumb, SearchIcon, Spinner } from '../../components'
import { useCategories, useNow, useSearchSales } from '../../hooks'
import { useLocationStore } from '../../store'
import { isKakaoKeyConfigured, useKakaoMapLoader } from '../../lib/kakao'
import { cn } from '../../lib/cn'
import { formatDistance } from '../../lib/format'
import type { Category, Sale } from '../../types'

const RADIUS = 2000
const CLOSING_SOON_MS = 60 * 60 * 1000

interface Cluster {
  key: string
  lat: number
  lng: number
  sales: Sale[]
}

// 줌 레벨에 비례한 격자로 밀집 핀을 묶는다(카카오 level: 작을수록 확대).
// 같은 매장의 여러 세일은 좌표가 같아 항상 한 묶음이 된다.
function clusterize(sales: Sale[], level: number): Cluster[] {
  const cell = 0.0004 * Math.pow(2, level - 3)
  const buckets: Record<string, Sale[]> = {}
  for (const s of sales) {
    if (s.lat == null || s.lng == null) continue
    const gy = Math.floor(s.lat / cell)
    const gx = Math.floor(s.lng / cell)
    const key = `${gy}:${gx}`
    ;(buckets[key] ??= []).push(s)
  }
  return Object.entries(buckets).map(([key, arr]) => ({
    key,
    lat: arr.reduce((a, s) => a + (s.lat as number), 0) / arr.length,
    lng: arr.reduce((a, s) => a + (s.lng as number), 0) / arr.length,
    sales: arr,
  }))
}

export function MapPage() {
  const { lat, lng } = useLocationStore()
  const [category, setCategory] = useState<string | undefined>()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Sale[] | null>(null)

  const { data: categories = [] } = useCategories()
  const { data: sales = [], isLoading } = useSearchSales({ lat, lng, radius: RADIUS, category })

  const filtered = useMemo(() => {
    const q = query.trim()
    const withCoords = sales.filter((s) => s.lat != null && s.lng != null)
    if (!q) return withCoords
    return withCoords.filter((s) => s.title.includes(q) || (s.store_name ?? '').includes(q))
  }, [sales, query])

  // 필터·검색이 바뀌면 하단 선택 해제.
  useEffect(() => setSelected(null), [filtered])

  const selectedKey = selected
    ? `${selected.length}:${selected.map((s) => s.id).join(',')}`
    : null

  return (
    <div className="relative h-[calc(100vh-5rem)] overflow-hidden bg-paper">
      {isKakaoKeyConfigured ? (
        <KakaoMap
          lat={lat}
          lng={lng}
          sales={filtered}
          selectedKey={selectedKey}
          onSelect={setSelected}
        />
      ) : (
        <PseudoMap
          lat={lat}
          lng={lng}
          sales={filtered}
          selectedKey={selectedKey}
          onSelect={setSelected}
        />
      )}

      {/* 상단 플로팅: 검색바 + 필터칩 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-[14px] bg-surface px-4 py-3 shadow-[0_2px_8px_rgba(20,19,15,0.1)]">
          <SearchIcon className="h-[18px] w-[18px] text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="지역·매장 검색"
            className="w-full bg-transparent text-[14px] text-ink-900 placeholder:text-ink-300 focus:outline-none"
          />
        </div>
        <div className="no-scrollbar pointer-events-auto mt-2 flex gap-2 overflow-x-auto">
          <MapChips categories={categories} selected={category} onSelect={setCategory} />
        </div>
      </div>

      {/* 로딩 중: 지도가 빈 것처럼 보이지 않도록 플로팅 표시 */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-[13px] font-semibold text-ink-600 shadow-[0_2px_8px_rgba(20,19,15,0.1)]">
            <Spinner className="h-4 w-4" />
            주변 마감세일 불러오는 중…
          </div>
        </div>
      )}

      {/* 하단 리스트 시트 (바닥에 붙임) */}
      {selected && selected.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 z-20">
          <SalesPanel sales={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  )
}

function MapChips({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[]
  selected: string | undefined
  onSelect: (c: string | undefined) => void
}) {
  const chip = (active: boolean) =>
    cn(
      'shrink-0 rounded-pill border px-3.5 py-1.5 text-[13px] font-semibold shadow-chip transition-colors',
      active ? 'border-primary bg-primary text-white' : 'border-line-strong bg-surface text-ink-600',
    )
  return (
    <>
      <button className={chip(!selected)} onClick={() => onSelect(undefined)}>
        전체
      </button>
      {categories.map((c) => (
        <button key={c.code} className={chip(selected === c.code)} onClick={() => onSelect(c.code)}>
          {c.name_ko}
        </button>
      ))}
    </>
  )
}

function KakaoMap({
  lat,
  lng,
  sales,
  selectedKey,
  onSelect,
}: {
  lat: number
  lng: number
  sales: Sale[]
  selectedKey: string | null
  onSelect: (sales: Sale[]) => void
}) {
  const [loading, error] = useKakaoMapLoader()
  const [level, setLevel] = useState(4)
  const clusters = useMemo(() => clusterize(sales, level), [sales, level])

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
        <p className="text-[14px] font-semibold text-ink-700">지도를 불러오지 못했어요</p>
        <p className="text-[12px] leading-relaxed text-ink-400">
          카카오 개발자 콘솔 → 앱 설정 → 플랫폼 → Web '사이트 도메인'에
          <br />
          현재 주소(http://localhost:5173)가 등록돼 있는지 확인해 주세요.
        </p>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-400">
        지도를 불러오는 중…
      </div>
    )
  }
  return (
    <Map
      center={{ lat, lng }}
      level={4}
      style={{ width: '100%', height: '100%' }}
      onZoomChanged={(map) => setLevel(map.getLevel())}
    >
      <CustomOverlayMap position={{ lat, lng }}>
        <span className="block h-3.5 w-3.5 rounded-full border-2 border-white bg-info shadow-[0_0_0_6px_rgba(47,109,240,0.25)]" />
      </CustomOverlayMap>
      {clusters.map((c) => {
        const key = clusterSelectKey(c)
        return (
          <CustomOverlayMap key={c.key} position={{ lat: c.lat, lng: c.lng }}>
            <ClusterMarker
              cluster={c}
              active={selectedKey === key}
              onClick={() => onSelect(c.sales)}
            />
          </CustomOverlayMap>
        )
      })}
    </Map>
  )
}

/** kakao 키가 없을 때: 좌표를 화면에 정규화해 배치한 의사 지도 */
function PseudoMap({
  lat,
  lng,
  sales,
  selectedKey,
  onSelect,
}: {
  lat: number
  lng: number
  sales: Sale[]
  selectedKey: string | null
  onSelect: (sales: Sale[]) => void
}) {
  const clusters = useMemo(() => clusterize(sales, 4), [sales])
  const bounds = useMemo(() => {
    const lats = [lat, ...sales.map((s) => s.lat as number)]
    const lngs = [lng, ...sales.map((s) => s.lng as number)]
    const pad = 0.0015
    return {
      minLat: Math.min(...lats) - pad,
      maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad,
      maxLng: Math.max(...lngs) + pad,
    }
  }, [lat, lng, sales])

  const pos = (plat: number, plng: number) => ({
    top: `${((bounds.maxLat - plat) / (bounds.maxLat - bounds.minLat)) * 100}%`,
    left: `${((plng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100}%`,
  })

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapBackdrop />
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(lat, lng)}>
        <span className="block h-3.5 w-3.5 rounded-full border-2 border-white bg-info shadow-[0_0_0_6px_rgba(47,109,240,0.25)]" />
      </div>
      {clusters.map((c) => (
        <div
          key={c.key}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={pos(c.lat, c.lng)}
        >
          <ClusterMarker
            cluster={c}
            active={selectedKey === clusterSelectKey(c)}
            onClick={() => onSelect(c.sales)}
          />
        </div>
      ))}
      {sales.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-500">
          주변에 표시할 마감세일이 없어요.
        </div>
      )}
    </div>
  )
}

function clusterSelectKey(c: Cluster): string {
  return `${c.sales.length}:${c.sales.map((s) => s.id).join(',')}`
}

/** kakao 키가 없을 때 배경용 일러스트 지도 — 공원·강·도로·블록으로 화사하게. */
function MapBackdrop() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 375 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="375" height="700" fill="#eaf1e1" />
      <path
        d="M-40 180 C 90 240, 120 330, 250 360 S 430 470, 470 560 L 470 700 L -40 700 Z"
        fill="#c3e2ec"
        opacity="0.7"
      />
      <path
        d="M-40 180 C 90 240, 120 330, 250 360 S 430 470, 470 560"
        fill="none"
        stroke="#a9d6e4"
        strokeWidth="3"
        opacity="0.6"
      />
      <rect x="26" y="86" width="104" height="86" rx="16" fill="#cbe6b6" />
      <rect x="250" y="470" width="112" height="132" rx="18" fill="#cbe6b6" />
      <circle cx="300" cy="118" r="34" fill="#d4ebc2" />
      {[
        [40, 250, 90, 70],
        [150, 250, 80, 60],
        [250, 250, 96, 74],
        [60, 400, 84, 66],
        [40, 520, 96, 90],
        [180, 560, 92, 80],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="10" fill="#ffffff" opacity="0.55" />
      ))}
      <g stroke="#ffffff" strokeLinecap="round">
        <line x1="0" y1="220" x2="375" y2="230" strokeWidth="16" opacity="0.9" />
        <line x1="150" y1="0" x2="168" y2="700" strokeWidth="16" opacity="0.9" />
        <line x1="0" y1="490" x2="375" y2="470" strokeWidth="13" opacity="0.85" />
        <line x1="300" y1="0" x2="315" y2="700" strokeWidth="11" opacity="0.8" />
      </g>
      <g stroke="#ffffff" strokeWidth="5" opacity="0.6" strokeLinecap="round">
        <line x1="60" y1="0" x2="70" y2="700" />
        <line x1="0" y1="350" x2="375" y2="345" />
        <line x1="0" y1="600" x2="375" y2="595" />
      </g>
    </svg>
  )
}

function ClusterMarker({
  cluster,
  active,
  onClick,
}: {
  cluster: Cluster
  active: boolean
  onClick: () => void
}) {
  const minPrice = Math.min(...cluster.sales.map((s) => s.sale_price))
  const count = cluster.sales.length

  if (count === 1) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'whitespace-nowrap rounded-pill border px-3 py-1.5 text-[13px] font-bold shadow-chip tnum',
          active
            ? 'border-primary bg-primary text-white'
            : 'border-line-strong bg-surface text-ink-900',
        )}
      >
        {minPrice.toLocaleString('ko-KR')}원
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2 py-1 shadow-chip',
        active ? 'border-primary bg-primary text-white' : 'border-line-strong bg-surface text-ink-900',
      )}
    >
      <span
        className={cn(
          'flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[12px] font-extrabold tnum',
          active ? 'bg-white text-primary' : 'bg-primary text-white',
        )}
      >
        {count}
      </span>
      <span className="pr-1 text-[13px] font-bold tnum">
        {minPrice.toLocaleString('ko-KR')}원~
      </span>
    </button>
  )
}

function SalesPanel({ sales, onClose }: { sales: Sale[]; onClose: () => void }) {
  const sorted = useMemo(
    () => [...sales].sort((a, b) => (a.store_distance_m ?? 9e9) - (b.store_distance_m ?? 9e9)),
    [sales],
  )
  return (
    <div className="mx-auto max-w-[430px] overflow-hidden rounded-t-2xl bg-surface shadow-[0_-6px_28px_rgba(20,19,15,0.18)]">
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong" />
      <div className="flex items-center justify-between px-4 pt-2 pb-2">
        <p className="text-[15px] font-extrabold text-ink-900">
          이 지역 마감세일 <span className="text-primary">{sales.length}</span>
        </p>
        <button onClick={onClose} className="text-[13px] font-semibold text-ink-400">
          닫기
        </button>
      </div>
      {/* 고정 높이 + 내부 스크롤: 항목 수와 무관하게 시트 크기 일정, 많으면 드래그로 탐색 */}
      <div className="no-scrollbar h-[236px] divide-y divide-line-soft overflow-y-auto overscroll-contain pb-2">
        {sorted.map((s) => (
          <SaleRow key={s.id} sale={s} />
        ))}
      </div>
    </div>
  )
}

function SaleRow({ sale }: { sale: Sale }) {
  const now = useNow(1000)
  const soon = new Date(sale.deadline_at).getTime() - now < CLOSING_SOON_MS
  const dist = formatDistance(sale.store_distance_m)
  return (
    <Link to={`/sales/${sale.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-paper/60">
      <SaleThumb sale={sale} size="sm" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[14px] font-bold text-ink-900">
            {sale.store_name ?? sale.title}
          </p>
          {soon && (
            <span className="shrink-0 rounded-full bg-danger-50 px-1.5 py-0.5 text-[10px] font-bold text-danger">
              마감임박
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[12px] text-ink-400">
          {sale.title}
          {dist && ` · ${dist}`} · {sale.remaining_quantity}개 남음
        </p>
      </div>

      <SalePrice sale={sale} size="sm" align="stacked" />
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-300" />
    </Link>
  )
}
