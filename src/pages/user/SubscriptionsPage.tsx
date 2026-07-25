import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, LoadingScreen, Sheet, TopBar } from '../../components'
import {
  useCategories,
  useCreateSubscription,
  useSubscriptions,
  useUpdateSubscription,
} from '../../hooks'
import { useAuthStore, useLocationStore } from '../../store'
import { cn } from '../../lib/cn'

const RADII = [1000, 2000, 3000, 5000]
const DISCOUNTS = [0, 20, 30, 40, 50]
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function SubscriptionsPage() {
  const userId = useAuthStore((s) => s.userId)
  const { lat, lng } = useLocationStore()
  const { data: subs, isLoading } = useSubscriptions(userId)
  const { data: categories = [] } = useCategories()
  const create = useCreateSubscription()
  const update = useUpdateSubscription()

  const existing = subs?.[0]

  const [cats, setCats] = useState<string[]>([])
  const [radius, setRadius] = useState(2000)
  const [minDiscount, setMinDiscount] = useState(0)
  const [maxPrice, setMaxPrice] = useState('')
  const [from, setFrom] = useState(9)
  const [to, setTo] = useState(22)
  const [push, setPush] = useState(true)
  const [done, setDone] = useState(false)

  // 기존 구독이 있으면 프리필
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

  if (isLoading) {
    return (
      <>
        <TopBar title="구독 설정" />
        <LoadingScreen />
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
    if (existing) {
      update.mutate({ id: existing.id, payload }, { onSuccess: () => setDone(true) })
    } else {
      create.mutate({ user_id: userId, lat, lng, ...payload }, { onSuccess: () => setDone(true) })
    }
  }

  const saving = create.isPending || update.isPending

  return (
    <>
      <TopBar title="구독 설정" />
      <div className="px-5 pb-28 pt-2">
        <p className="text-[13px] text-ink-600">
          관심 카테고리·조건에 맞는 마감세일이 뜨면 알림으로 알려드려요.
        </p>

        <Section title="관심 카테고리">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Chip key={c.code} active={cats.includes(c.code)} onClick={() => toggleCat(c.code)}>
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
            {existing ? '구독 수정하기' : '구독 시작하기'}
          </Button>
          {cats.length === 0 && (
            <p className="mt-2 text-center text-[12px] text-ink-400">
              카테고리를 하나 이상 선택해 주세요.
            </p>
          )}
        </div>
      </div>

      <Sheet open={done} onClose={() => setDone(false)} title="구독을 저장했어요">
        <p className="text-sm text-ink-600">조건에 맞는 마감세일이 뜨면 알림으로 알려드릴게요.</p>
        <Button variant="secondary" fullWidth className="mt-4" onClick={() => setDone(false)}>
          확인
        </Button>
      </Sheet>
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
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-pill px-3.5 py-2 text-[13px] font-semibold transition-colors',
        active ? 'bg-primary text-white' : 'border border-line-strong bg-surface text-ink-600',
      )}
    >
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
        'relative h-7 w-12 shrink-0 rounded-full transition-colors',
        on ? 'bg-primary' : 'bg-line-strong',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
          on ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
