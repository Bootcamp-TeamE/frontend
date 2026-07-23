import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CustomOverlayMap, Map } from 'react-kakao-maps-sdk'
import { ChevronRightIcon, SearchIcon } from '../../components'
import { useCategories, useNow, useSearchSales } from '../../hooks'
import { useLocationStore } from '../../store'
import { isKakaoKeyConfigured, useKakaoMapLoader } from '../../lib/kakao'
import { categoryTint } from '../../lib/category'
import { cn } from '../../lib/cn'
import { formatDistance, formatWon } from '../../lib/format'
import type { Category, Sale } from '../../types'

const RADIUS = 2000
const CLOSING_SOON_MS = 60 * 60 * 1000

export function MapPage() {
  const { lat, lng } = useLocationStore()
  const [category, setCategory] = useState<string | undefined>()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: categories = [] } = useCategories()
  const { data: sales = [] } = useSearchSales({ lat, lng, radius: RADIUS, category })

  const filtered = useMemo(() => {
    const q = query.trim()
    const withCoords = sales.filter((s) => s.lat != null && s.lng != null)
    if (!q) return withCoords
    return withCoords.filter((s) => s.title.includes(q) || (s.store_name ?? '').includes(q))
  }, [sales, query])

  const selected = filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? null

  return (
    <div className="relative h-[calc(100vh-5rem)] overflow-hidden bg-paper">
      {isKakaoKeyConfigured ? (
        <KakaoMap
          lat={lat}
          lng={lng}
          sales={filtered}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
        />
      ) : (
        <PseudoMap
          lat={lat}
          lng={lng}
          sales={filtered}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
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

      {/* 하단 peek 카드 */}
      {selected && (
        <div className="absolute inset-x-0 bottom-0 z-20 p-4">
          <PeekCard sale={selected} />
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
      'shrink-0 rounded-pill px-3.5 py-1.5 text-[13px] font-semibold shadow-chip transition-colors',
      active ? 'bg-primary text-white' : 'bg-surface text-ink-600',
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
  selectedId,
  onSelect,
}: {
  lat: number
  lng: number
  sales: Sale[]
  selectedId: number | null
  onSelect: (id: number) => void
}) {
  const [loading, error] = useKakaoMapLoader()
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
    <Map center={{ lat, lng }} level={4} style={{ width: '100%', height: '100%' }}>
      <CustomOverlayMap position={{ lat, lng }}>
        <span className="block h-3.5 w-3.5 rounded-full border-2 border-white bg-info shadow-[0_0_0_6px_rgba(47,109,240,0.25)]" />
      </CustomOverlayMap>
      {sales.map((s) => (
        <CustomOverlayMap key={s.id} position={{ lat: s.lat as number, lng: s.lng as number }}>
          <PricePin sale={s} active={s.id === selectedId} onClick={() => onSelect(s.id)} />
        </CustomOverlayMap>
      ))}
    </Map>
  )
}

/** kakao 키가 없을 때: 좌표를 화면에 정규화해 배치한 의사 지도 */
function PseudoMap({
  lat,
  lng,
  sales,
  selectedId,
  onSelect,
}: {
  lat: number
  lng: number
  sales: Sale[]
  selectedId: number | null
  onSelect: (id: number) => void
}) {
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
      {sales.map((s) => (
        <div
          key={s.id}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={pos(s.lat as number, s.lng as number)}
        >
          <PricePin sale={s} active={s.id === selectedId} onClick={() => onSelect(s.id)} />
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

/** kakao 키가 없을 때 배경용 일러스트 지도 — 공원·강·도로·블록으로 화사하게. */
function MapBackdrop() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 375 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {/* 화사한 그린 크림 베이스 */}
      <rect width="375" height="700" fill="#eaf1e1" />

      {/* 강 — 부드러운 블루 밴드 */}
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

      {/* 공원 — 신선한 그린 블록 */}
      <rect x="26" y="86" width="104" height="86" rx="16" fill="#cbe6b6" />
      <rect x="250" y="470" width="112" height="132" rx="18" fill="#cbe6b6" />
      <circle cx="300" cy="118" r="34" fill="#d4ebc2" />

      {/* 도시 블록 — 살짝 떠 있는 화이트 타일 */}
      {[
        [40, 250, 90, 70],
        [150, 250, 80, 60],
        [250, 250, 96, 74],
        [60, 400, 84, 66],
        [40, 520, 96, 90],
        [180, 560, 92, 80],
      ].map(([x, y, w, h], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          rx="10"
          fill="#ffffff"
          opacity="0.55"
        />
      ))}

      {/* 도로 — 굵은 흰 길 + 얇은 골목 */}
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

function PricePin({
  sale,
  active,
  onClick,
}: {
  sale: Sale
  active: boolean
  onClick: () => void
}) {
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
      {sale.sale_price.toLocaleString('ko-KR')}원
    </button>
  )
}

function PeekCard({ sale }: { sale: Sale }) {
  const now = useNow(1000)
  const soon = new Date(sale.deadline_at).getTime() - now < CLOSING_SOON_MS
  const dist = formatDistance(sale.store_distance_m)
  return (
    <Link
      to={`/sales/${sale.id}`}
      className="flex items-center gap-3 rounded-card-lg bg-surface p-3 shadow-[0_8px_28px_rgba(20,19,15,0.2)]"
    >
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-thumb text-xs font-extrabold',
          categoryTint(sale.category_code),
        )}
      >
        {(sale.store_name ?? sale.title).slice(0, 2)}
      </div>
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
        <p className="mt-0.5 text-[15px] font-extrabold text-ink-900 tnum">
          {formatWon(sale.sale_price)}
        </p>
      </div>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-300" />
    </Link>
  )
}
