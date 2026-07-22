import type { ReactNode } from 'react'

// 하단에서 올라오는 바텀시트 모달. 결제·예약 실패 등에 사용.
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-auto w-full max-w-[430px] rounded-t-2xl bg-white p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-300" />
        {title && <h2 className="mb-3 text-lg font-bold text-stone-900">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
