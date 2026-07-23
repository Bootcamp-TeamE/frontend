import { useState } from 'react'
import { Button, Card, EmptyState, LoadingScreen, Toggle, TopBar } from '../../components'
import { SubscriptionForm } from '../../components/subscription/SubscriptionForm'
import { useCategories, useSubscriptions, useUpdateSubscription } from '../../hooks'
import { useAuthStore } from '../../store'
import { formatWon } from '../../lib/format'
import type { Subscription } from '../../types'

export function SubscriptionsPage() {
  const userId = useAuthStore((s) => s.userId)
  const { data: subs, isLoading } = useSubscriptions(userId)
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <TopBar title="구독 설정" />
      <div className="space-y-3 px-5 py-3">
        <p className="text-sm text-stone-500">
          관심 조건을 등록하면 내 주변에 맞는 마감세일이 올라올 때 알림을 받아요.
        </p>

        {isLoading && <LoadingScreen />}

        {subs?.map((s) => <SubscriptionCard key={s.id} sub={s} />)}

        {subs && subs.length === 0 && !showForm && (
          <EmptyState
            title="등록한 구독이 없어요"
            description="관심 업종·반경을 등록해 보세요."
          />
        )}

        {showForm ? (
          <SubscriptionForm userId={userId} onDone={() => setShowForm(false)} />
        ) : (
          <Button variant="secondary" fullWidth onClick={() => setShowForm(true)}>
            새 구독 추가
          </Button>
        )}
      </div>
    </>
  )
}

function SubscriptionCard({ sub }: { sub: Subscription }) {
  const { data: categories = [] } = useCategories()
  const update = useUpdateSubscription()

  const catNames =
    sub.categories
      .map((c) => categories.find((x) => x.code === c)?.name_ko ?? c)
      .join(', ') || '전체 업종'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-stone-900">{catNames}</p>
        <Toggle
          on={sub.push_enabled}
          disabled={update.isPending}
          onChange={(v) => update.mutate({ id: sub.id, payload: { push_enabled: v } })}
        />
      </div>
      <p className="mt-1 text-sm text-stone-500">
        반경 {sub.radius_m / 1000}km · 할인 {sub.min_discount_rate}% 이상
        {sub.max_price ? ` · ${formatWon(sub.max_price)} 이하` : ''}
      </p>
      <p className="mt-0.5 text-xs text-stone-400">
        수신 {sub.receive_from}시~{sub.receive_to}시
        {!sub.push_enabled && ' · 알림 꺼짐'}
      </p>
    </Card>
  )
}
