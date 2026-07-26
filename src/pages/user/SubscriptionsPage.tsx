import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, LoadingScreen, Sheet, TopBar } from '../../components'
import { useCategories, useDeleteSubscription, useSubscriptions } from '../../hooks'
import { formatWon } from '../../lib/format'
import type { Subscription } from '../../types'

const pad = (h: number) => String(h).padStart(2, '0')

export function SubscriptionsPage() {
  const { data: subs, isLoading } = useSubscriptions()
  const { data: categories = [] } = useCategories()
  const del = useDeleteSubscription()

  const catName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.code, c.name_ko])),
    [categories],
  )
  const [target, setTarget] = useState<Subscription | null>(null)

  const doDelete = () => {
    if (target) del.mutate(target.id, { onSuccess: () => setTarget(null) })
  }

  const hasSubs = subs && subs.length > 0

  return (
    <>
      <TopBar
        title="구독"
        right={
          hasSubs ? (
            <Link
              to="/subscriptions/new"
              className="inline-flex min-h-[44px] items-center px-2 text-[14px] font-semibold text-primary"
            >
              + 추가
            </Link>
          ) : undefined
        }
      />

      {isLoading && <LoadingScreen />}

      {subs && subs.length === 0 && (
        <EmptyState
          title="아직 구독이 없어요"
          description="관심 카테고리·조건을 등록하면 맞는 마감세일을 알림으로 받아요."
          action={
            <Link to="/subscriptions/new">
              <Button variant="secondary">구독 추가하기</Button>
            </Link>
          }
        />
      )}

      <div className="space-y-3 px-5 py-3">
        {subs?.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            sub={sub}
            catName={catName}
            onDelete={() => setTarget(sub)}
          />
        ))}
      </div>

      <Sheet
        open={!!target}
        onClose={() => setTarget(null)}
        title="이 구독을 삭제할까요?"
      >
        <p className="text-sm text-ink-600">삭제하면 이 조건의 알림을 더 이상 받지 않아요.</p>
        {del.isError && (
          <p className="mt-2 text-sm text-danger">
            {(del.error as Error)?.message ?? '삭제에 실패했어요.'}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="danger" fullWidth loading={del.isPending} onClick={doDelete}>
            삭제하기
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setTarget(null)}>
            닫기
          </Button>
        </div>
      </Sheet>
    </>
  )
}

function SubscriptionCard({
  sub,
  catName,
  onDelete,
}: {
  sub: Subscription
  catName: Record<string, string>
  onDelete: () => void
}) {
  const cats = sub.categories.map((c) => catName[c] ?? c).join(' · ')

  return (
    <div className="rounded-card-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-[15px] font-bold text-ink-900">
          {cats || '전체 카테고리'}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            to={`/subscriptions/${sub.id}/edit`}
            className="rounded-lg px-2 py-1.5 text-[13px] font-semibold text-ink-600 hover:bg-paper"
          >
            수정
          </Link>
          <button
            onClick={onDelete}
            className="rounded-lg px-2 py-1.5 text-[13px] font-semibold text-danger hover:bg-danger-50"
          >
            삭제
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-500">
        <span>반경 {(sub.radius_m / 1000).toLocaleString()}km</span>
        <span>{sub.min_discount_rate === 0 ? '전체 할인' : `${sub.min_discount_rate}%+`}</span>
        {sub.max_price != null && <span>{formatWon(sub.max_price)} 이하</span>}
        <span>
          {pad(sub.receive_from)}~{pad(sub.receive_to)}시
        </span>
        <span className={sub.push_enabled ? 'text-primary' : 'text-ink-400'}>
          푸시 {sub.push_enabled ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  )
}
