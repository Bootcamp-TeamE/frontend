import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, EmptyState, LoadingScreen, TopBar } from '../../components'
import {
  useCategories,
  useCreateSubscription,
  useSubscriptions,
  useUpdateSubscription,
} from '../../hooks'
import { useAuthStore, useLocationStore } from '../../store'
import { categoryColor } from '../../lib/category'
import { cn } from '../../lib/cn'

const RADII = [1000, 2000, 3000, 5000]
const DISCOUNTS = [0, 20, 30, 40, 50]
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function SubscriptionFormPage() {
  const { id } = useParams()
  const editId = id ? Number(id) : null
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.userId)
  const { lat, lng } = useLocationStore()
  const { data: subs, isLoading } = useSubscriptions(userId)
  const { data: categories = [] } = useCategories()
  const create = useCreateSubscription()
  const update = useUpdateSubscription()

  const existing = editId != null ? subs?.find((s) => s.id === editId) : undefined

  const [cats, setCats] = useState<string[]>([])
  const [radius, setRadius] = useState(1000)
  const [minDiscount, setMinDiscount] = useState(0)
  const [maxPrice, setMaxPrice] = useState('')
  const [from, setFrom] = useState(9)
  const [to, setTo] = useState(22)
  const [push, setPush] = useState(true)

  useEffect(() => {
    if (!existing) return
    setCats(existing.categories)
    setRadius(existing.radius_m)
    setMinDiscount(existing.min_discount_rate)
    setMaxPrice(existing.max_price != null ? String(existing.max_price) : '')
    setFrom(existing.receive_from)
    setTo(existing.receive_to)
    setPush(existing.push_enabled)
  }, [existing])

  // 수정 모드: 목록 로딩 중 / 대상 없음 처리
  if (editId != null && isLoading) {
    return (
      <>
        <TopBar title="구독 수정" />
        <LoadingScreen />
      </>
    )
  }
  if (editId != null && !existing) {
    return (
      <>
        <TopBar title="구독 수정" />
        <EmptyState
          title="구독을 찾을 수 없어요"
          description="이미 삭제되었을 수 있어요."
          action={
            <Button variant="secondary" onClick={() => navigate('/subscriptions')}>
              구독 목록으로
            </Button>
          }
        />
      </>
    )
  }

  const toggleCat = (code: string) =>
    setCats((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))

  const save = () => {
    const payload = {
      categories: cats,
      radius_m: radius,
      min_discount_rate: minDiscount,
      max_price: maxPrice ? Number(maxPrice) : null,
      receive_from: from,
      receive_to: to,
      push_enabled: push,
    }
    const back = () => navigate('/subscriptions')
    if (editId != null) update.mutate({ id: editId, payload }, { onSuccess: back })
    else create.mutate({ user_id: userId, lat, lng, ...payload }, { onSuccess: back })
  }

  const saving = create.isPending || update.isPending

  return (
    <>
      <TopBar title={editId != null ? '구독 수정' : '구독 추가'} />
      <div className="px-5 pb-28 pt-2">
        <p className="text-[13px] text-ink-600">
          관심 카테고리·조건에 맞는 마감세일이 뜨면 알림으로 알려드려요.
        </p>

        <Section title="관심 카테고리">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Chip
                key={c.code}
                active={cats.includes(c.code)}
                color={categoryColor(c.code)}
                onClick={() => toggleCat(c.code)}
              >
                {c.name_ko}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="알림 반경">
          <div className="flex flex-wrap gap-2">
            {RADII.map((r) => (
              <Chip key={r} active={radius === r} onClick={() => setRadius(r)}>
                {(r / 1000).toLocaleString()}km
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="최소 할인율">
          <div className="flex flex-wrap gap-2">
            {DISCOUNTS.map((d) => (
              <Chip key={d} active={minDiscount === d} onClick={() => setMinDiscount(d)}>
                {d === 0 ? '전체' : `${d}%+`}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="최대 가격 (선택)">
          <div className="flex items-center gap-2 rounded-card border border-line-strong bg-surface px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30">
            <input
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="예: 5000"
              className="w-full bg-transparent text-[14px] text-ink-900 placeholder:text-ink-300 focus:outline-none"
            />
            <span className="shrink-0 text-[14px] text-ink-400">원 이하</span>
          </div>
        </Section>

        <Section title="받을 시간대">
          <div className="flex items-center gap-2">
            <HourSelect value={from} onChange={setFrom} />
            <span className="text-ink-400">~</span>
            <HourSelect value={to} onChange={setTo} />
          </div>
        </Section>

        <div className="mt-6 flex items-center justify-between rounded-card border border-line-soft bg-surface px-4 py-4">
          <div>
            <p className="text-[14px] font-semibold text-ink-900">푸시 알림</p>
            <p className="mt-0.5 text-[12px] text-ink-400">끄면 앱 안에서만 표시돼요.</p>
          </div>
          <Toggle on={push} onChange={setPush} />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-[430px] border-t border-line-soft bg-surface px-5 pt-3 pb-5">
          <Button
            fullWidth
            size="lg"
            className="rounded-[14px]"
            disabled={cats.length === 0}
            loading={saving}
            onClick={save}
          >
            {editId != null ? '구독 수정하기' : '구독 시작하기'}
          </Button>
          {cats.length === 0 && (
            <p className="mt-2 text-center text-[12px] text-ink-400">
              카테고리를 하나 이상 선택해 주세요.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-[14px] font-bold text-ink-900">{title}</h2>
      {children}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      style={active && color ? { backgroundColor: color, borderColor: color } : undefined}
      className={cn(
        'flex items-center gap-1.5 rounded-pill border px-3.5 py-2 text-[13px] font-semibold transition-colors',
        active
          ? color
            ? 'text-white'
            : 'border-primary bg-primary text-white'
          : 'border-line-strong bg-surface text-ink-600',
      )}
    >
      {color && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: active ? '#ffffff' : color }}
        />
      )}
      {children}
    </button>
  )
}

function HourSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-card border border-line-strong bg-surface px-3 py-2.5 text-[14px] font-semibold text-ink-900 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      {HOURS.map((h) => (
        <option key={h} value={h}>
          {String(h).padStart(2, '0')}:00
        </option>
      ))}
    </select>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        on ? 'bg-primary' : 'bg-line-strong',
      )}
    >
      <span
        className={cn(
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          on && 'translate-x-5',
        )}
      />
    </button>
  )
}
