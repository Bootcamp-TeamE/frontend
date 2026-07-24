import type { ReactNode } from 'react'

/** 빈 상태 기본 일러스트 — 장바구니 + 할인 % 배지(브랜드 톤). */
function EmptyIllustration() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden="true">
      {/* 봉투 몸통 */}
      <path
        d="M14 24h36l-2.4 28.2A6 6 0 0 1 41.6 58H22.4a6 6 0 0 1-6-5.8L14 24z"
        className="fill-primary-50 stroke-primary-200"
        strokeWidth="2"
      />
      {/* 손잡이 */}
      <path
        d="M24 24v-3a8 8 0 0 1 16 0v3"
        className="stroke-primary-200"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* 할인 % 배지 */}
      <circle cx="32" cy="40" r="9" className="fill-primary" />
      <path d="M28.5 43.5l7-7" className="stroke-white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="29.3" cy="37" r="1.2" className="fill-white" />
      <circle cx="34.7" cy="43" r="1.2" className="fill-white" />
    </svg>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="mb-1">{icon ?? <EmptyIllustration />}</div>
      <p className="font-semibold text-ink-700">{title}</p>
      {description && <p className="text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
