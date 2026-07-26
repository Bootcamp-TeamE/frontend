import { cn } from '../lib/cn'

export function QuantityStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (next: number) => void
}) {
  const btn = 'flex h-10 w-10 items-center justify-center text-xl font-bold disabled:opacity-30'
  return (
    <div className="inline-flex items-center rounded-xl border border-stone-200">
      <button
        className={cn(btn, 'text-stone-600')}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        aria-label="수량 감소"
      >
        −
      </button>
      <span className="w-10 text-center font-bold tabular-nums">{value}</span>
      <button
        className={cn(btn, 'text-primary')}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        aria-label="수량 증가"
      >
        +
      </button>
    </div>
  )
}
