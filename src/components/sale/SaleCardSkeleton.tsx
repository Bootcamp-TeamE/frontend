import { Card } from '../Card'

export function SaleCardSkeleton() {
  return (
    <Card className="flex gap-3 p-3">
      <div className="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-stone-200" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
        <div className="mt-auto h-5 w-28 animate-pulse rounded bg-stone-200" />
      </div>
    </Card>
  )
}
