export function SaleCardSkeleton() {
  return (
    <div className="flex items-center gap-3.5 border-b border-line-soft px-1 py-[18px] last:border-0">
      <div className="h-[72px] w-[72px] shrink-0 animate-pulse rounded-thumb bg-line" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-3.5 w-24 animate-pulse rounded bg-line" />
        <div className="h-4 w-36 animate-pulse rounded bg-line" />
        <div className="mt-1 h-5 w-28 animate-pulse rounded bg-line" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="h-3.5 w-10 animate-pulse rounded bg-line" />
        <div className="h-3 w-12 animate-pulse rounded bg-line" />
      </div>
    </div>
  )
}
