import { useNavigate } from 'react-router-dom'
import { BellIcon, BoxIcon, CheckIcon, EmptyState, ListSkeleton } from '../../components'
import { useMarkAllRead, useMarkRead, useNotifications, useNow } from '../../hooks'
import { useAuthStore } from '../../store'
import { cn } from '../../lib/cn'
import { formatRelative } from '../../lib/format'
import type { Notification } from '../../types'

const META: Record<Notification['type'], { title: string; body: string }> = {
  order_paid: { title: '결제가 완료됐어요', body: '픽업 시간 안에 매장에서 QR을 보여주세요.' },
  order_picked_up: { title: '픽업이 완료됐어요', body: '상품을 잘 받으셨어요. 이용해 주셔서 감사합니다.' },
  sale_nearby: { title: '근처에 새 마감세일이 떴어요', body: '지금 반경 안에서 확인해 보세요.' },
}

export function NotificationsPage() {
  const userId = useAuthStore((s) => s.userId)
  const now = useNow(30000)
  const { data: items, isLoading } = useNotifications(userId)
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const navigate = useNavigate()

  const hasUnread = items?.some((n) => !n.is_read)

  const open = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id)
    if ((n.type === 'order_paid' || n.type === 'order_picked_up') && n.order_id)
      navigate(`/orders/${n.order_id}`)
    else if (n.type === 'sale_nearby' && n.sale_id) navigate(`/sales/${n.sale_id}`)
  }

  return (
    <div className="bg-paper">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-paper/95 px-5 pt-5 pb-3 backdrop-blur">
        <h1 className="text-[20px] font-extrabold text-ink-900">알림</h1>
        {hasUnread && (
          <button
            onClick={() => markAllRead.mutate(userId)}
            className="text-[13px] font-semibold text-primary"
          >
            모두 읽음
          </button>
        )}
      </header>

      {isLoading && (
        <div className="bg-surface px-5">
          <ListSkeleton count={5} avatar="circle" meta={false} />
        </div>
      )}

      {items && items.length === 0 && (
        <EmptyState
          title="아직 알림이 없어요"
          description="결제 완료·근처 마감세일 소식이 여기에 표시돼요."
        />
      )}

      <div className="bg-surface">
        {items?.map((n) => {
          const meta = META[n.type]
          if (!meta) return null
          return (
            <button
              key={n.id}
              onClick={() => open(n)}
              className={cn(
                'flex w-full items-start gap-3 border-b border-line-soft px-5 py-4 text-left last:border-0',
                !n.is_read && 'bg-primary-50/40',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  n.type === 'sale_nearby'
                    ? 'bg-danger-50 text-danger'
                    : 'bg-primary-50 text-primary',
                )}
              >
                {n.type === 'order_paid' ? (
                  <CheckIcon className="h-5 w-5" />
                ) : n.type === 'order_picked_up' ? (
                  <BoxIcon className="h-5 w-5" />
                ) : (
                  <BellIcon className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-ink-900">{meta.title}</p>
                <p className="mt-0.5 text-[13px] text-ink-600">{meta.body}</p>
                <p className="mt-1 text-[12px] text-ink-400">{formatRelative(n.created_at, now)}</p>
              </div>
              {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
