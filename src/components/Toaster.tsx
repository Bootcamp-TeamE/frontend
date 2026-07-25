import { useToastStore } from '../store'
import { cn } from '../lib/cn'

// 전역 토스트. MobileLayout에 한 번 렌더링되어 어디서든 useToastStore.show / toast()로 노출.
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 flex-col items-center gap-2 px-5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto max-w-[90%] truncate rounded-pill px-4 py-2.5 text-[13px] font-semibold shadow-card',
            t.type === 'error'
              ? 'bg-danger text-white'
              : t.type === 'success'
                ? 'bg-primary text-white'
                : 'bg-ink-900 text-white',
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
