import { useState, type ReactNode } from 'react'
import { Button, Card } from '../index'
import { useCategories, useCreateSubscription } from '../../hooks'
import { useLocationStore } from '../../store'
import { cn } from '../../lib/cn'

const DISCOUNT_OPTIONS = [0, 10, 20, 30, 40, 50]
const RADIUS_OPTIONS = [1000, 2000, 3000]

export function SubscriptionForm({ userId, onDone }: { userId: number; onDone: () => void }) {
  const { data: categories = [] } = useCategories()
  const { lat, lng, label } = useLocationStore()
  const create = useCreateSubscription()

  const [selected, setSelected] = useState<string[]>([])
  const [minDiscount, setMinDiscount] = useState(0)
  const [maxPrice, setMaxPrice] = useState('')
  const [radius, setRadius] = useState(1000)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(24)

  const toggleCat = (code: string) =>
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )

  const submit = () =>
    create.mutate(
      {
        user_id: userId,
        categories: selected,
        lat,
        lng,
        min_discount_rate: minDiscount,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        radius_m: radius,
        receive_from: from,
        receive_to: to,
      },
      { onSuccess: onDone },
    )

  const valid = selected.length > 0 && from < to

  return (
    <Card className="space-y-4 p-4">
      <Field label="관심 업종">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Chip key={c.code} active={selected.includes(c.code)} onClick={() => toggleCat(c.code)}>
              {c.name_ko}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="최소 할인율">
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_OPTIONS.map((d) => (
            <Chip key={d} active={minDiscount === d} onClick={() => setMinDiscount(d)}>
              {d === 0 ? '제한 없음' : `${d}% 이상`}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="최대 가격 (선택)">
        <input
          type="number"
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="예: 10000"
          className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </Field>

      <Field label="알림 반경">
        <div className="flex gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <Chip key={r} active={radius === r} onClick={() => setRadius(r)}>
              {r / 1000}km
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="받는 시간대">
        <div className="flex items-center gap-2">
          <HourSelect value={from} onChange={setFrom} />
          <span className="text-stone-400">~</span>
          <HourSelect value={to} onChange={setTo} />
        </div>
        {from >= to && <p className="mt-1 text-xs text-danger">시작 시각이 종료 시각보다 빨라야 해요.</p>}
      </Field>

      <p className="text-xs text-stone-400">위치 기준: {label}</p>

      {create.isError && (
        <p className="text-sm text-danger">
          {(create.error as Error)?.message ?? '구독 등록에 실패했어요.'}
        </p>
      )}

      <div className="flex gap-2">
        <Button variant="ghost" fullWidth onClick={onDone}>
          취소
        </Button>
        <Button fullWidth disabled={!valid || create.isPending} onClick={submit}>
          {create.isPending ? '등록 중…' : '구독 추가'}
        </Button>
      </div>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-stone-700">{label}</p>
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
        'rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
        active ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600',
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
      className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
    >
      {Array.from({ length: 25 }, (_, i) => (
        <option key={i} value={i}>
          {i}시
        </option>
      ))}
    </select>
  )
}
