import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, EmptyState, LoadingScreen } from '../../components'
import { useMarkAllRead, useMarkRead, useNotifications, useUnreadCount } from '../../hooks'
import { useAuthStore } from '../../store'
import { NOTI_DESC, NOTI_LABEL, NOTI_TONE } from '../../lib/notification'
import { relativeTime } from '../../lib/time'
import { cn } from '../../lib/cn'
import type { Notification } from '../../types'

export function NotificationsPage() {
  const userId = useAuthStore((s) => s.userId)
  const navigate = useNavigate()
  const [onlyUnread, setOnlyUnread] = useState(false)

  const { data: notis, isLoading } = useNotifications(userId, onlyUnread)
  const { data: unread = 0 } = useUnreadCount(userId)
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()

  const open = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id)
    // 주문 알림(결제·픽업)은 예약 상세로, 발견 알림은 상품으로.
    if (n.order_id) navigate(`/orders/${n.order_id}`)
    else if (n.sale_id) navigate(`/sales/${n.sale_id}`)
  }

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white/95 px-5 pb-2 pt-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-stone-900">알림</h1>
          {unread > 0 && (
            <button
              onClick={() => markAll.mutate(userId)}
              className="text-sm font-semibold text-stone-500"
            >
              전체 읽음
            </button>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          {[
            { key: false, label: '전체' },
            { key: true, label: `안읽음${unread > 0 ? ` ${unread}` : ''}` },
          ].map((t) => (
            <button
              key={String(t.key)}
              onClick={() => setOnlyUnread(t.key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
                onlyUnread === t.key
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 text-stone-600',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {isLoading && <LoadingScreen />}
      {notis && notis.length === 0 && (
        <EmptyState
          title={onlyUnread ? '안읽은 알림이 없어요' : '알림이 없어요'}
          description="결제 완료·내 주변 마감세일 알림이 여기에 표시됩니다."
        />
      )}

      <ul>
        {notis?.map((n) => (
          <li key={n.id}>
            <button
              onClick={() => open(n)}
              className={cn(
                'flex w-full items-start gap-3 border-b border-stone-100 px-5 py-3.5 text-left',
                !n.is_read && 'bg-primary-50/60',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={NOTI_TONE[n.type]}>{NOTI_LABEL[n.type]}</Badge>
                  <span className="shrink-0 text-xs text-stone-400">
                    {relativeTime(n.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone-600">{NOTI_DESC[n.type]}</p>
              </div>
              {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
