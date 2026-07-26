import { cn } from '../lib/cn'

/** 로딩 자리표시 기본 블록. animate-pulse 회색 바. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-line', className)} />
}

type Avatar = 'thumb' | 'circle' | 'none'

/** 리스트 로딩용 공용 행 — 썸네일/원형 아바타 + 텍스트 줄 + (선택)우측 메타. */
export function RowSkeleton({ avatar = 'thumb', meta = true }: { avatar?: Avatar; meta?: boolean }) {
  return (
    <div className="flex items-center gap-3.5 border-b border-line-soft py-[18px] last:border-0">
      {avatar !== 'none' && (
        <Skeleton
          className={cn('h-16 w-16 shrink-0', avatar === 'circle' ? 'rounded-full' : 'rounded-thumb')}
        />
      )}
      <div className="flex flex-1 flex-col gap-2 py-1">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-1 h-5 w-28" />
      </div>
      {meta && (
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3 w-12" />
        </div>
      )}
    </div>
  )
}

/** 행 스켈레톤 N개. 가로 여백은 부모 컨테이너(px-5 등)에서 상속. */
export function ListSkeleton({
  count = 4,
  avatar,
  meta,
}: {
  count?: number
  avatar?: Avatar
  meta?: boolean
}) {
  return (
    <div>
      {Array.from({ length: count }, (_, i) => (
        <RowSkeleton key={i} avatar={avatar} meta={meta} />
      ))}
    </div>
  )
}
