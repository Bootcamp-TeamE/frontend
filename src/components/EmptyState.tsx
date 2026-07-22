import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="mb-1 h-12 w-12 rounded-2xl bg-stone-200/70" />
      <p className="font-semibold text-stone-700">{title}</p>
      {description && <p className="text-sm text-stone-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
