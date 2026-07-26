import { Fragment, type ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellIcon, BoxIcon, CheckIcon, ClockIcon, EmptyState, ListSkeleton, TopBar } from '../../components'
import { useInfiniteScroll, useMarkAllRead, useMarkRead, useNotifications, useNow } from '../../hooks'
import { cn } from '../../lib/cn'
import { formatRelative } from '../../lib/format'
import type { Notification } from '../../types'

// 타입별 문구 + 구분색·아이콘. 결제=초록 / 픽업=파랑 / 환불=빨강 / 구독매칭=앰버
const META: Record<
  Notification['type'],
  { title: string; body: string; tint: string; Icon: ComponentType<{ className?: string }> }
> = {
  order_paid: {
    title: '결제가 완료됐어요',
    body: '픽업 시간 안에 매장에서 QR을 보여주세요.',
    tint: 'bg-primary-50 text-primary',
    Icon: CheckIcon,
  },
  order_picked_up: {
    title: '픽업이 완료됐어요',
    body: '상품을 잘 받으셨어요. 이용해 주셔서 감사합니다.',
    tint: 'bg-info/10 text-info',
    Icon: BoxIcon,
  },
  order_refunded: {
    title: '자동 환불됐어요',
    body: '픽업 시간이 지나 결제가 환불 처리됐어요.',
    tint: 'bg-danger-50 text-danger',
    Icon: ClockIcon,
  },
  sale_nearby: {
    title: '근처에 새 마감세일이 떴어요',
    body: '지금 반경 안에서 확인해 보세요.',
    tint: 'bg-amber-50 text-amber',
    Icon: BellIcon,
  },
}

function dayLabel(iso: string, now: number): string {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfThat = new Date(iso)
  startOfThat.setHours(0, 0, 0, 0)
  const diff = Math.round((startOfToday.getTime() - startOfThat.getTime()) / 86400000)
  if (diff <= 0) return '오늘'
  if (diff === 1) return '어제'
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function NotificationsPage() {
  const now = useNow(30000)
  const { data: items, isLoading } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const navigate = useNavigate()

  const hasUnread = items?.some((n) => !n.is_read)
  const { visible, hasMore, sentinelRef } = useInfiniteScroll(items ?? [], { pageSize: 20 })

  const open = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id)
    if (
      (n.type === 'order_paid' || n.type === 'order_picked_up' || n.type === 'order_refunded') &&
      n.order_id
    )
      navigate(`/orders/${n.order_id}`)
    else if (n.type === 'sale_nearby' && n.sale_id) navigate(`/sales/${n.sale_id}`)
  }

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <TopBar
        title="알림"
        back={false}
        right={
          hasUnread ? (
            <button
              onClick={() => markAllRead.mutate()}
              className="inline-flex items-center rounded-lg px-2 py-2 text-[13px] font-semibold text-primary hover:bg-primary-50"
            >
              모두 읽음
            </button>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="bg-surface px-5">
          <ListSkeleton count={5} avatar="circle" meta={false} />
        </div>
      )}

      {!isLoading && items && items.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            title="아직 알림이 없어요"
            description="결제 완료·근처 마감세일 소식이 여기에 표시돼요."
          />
        </div>
      )}

      {items && items.length > 0 && (
      <div className="bg-surface">
        {visible.map((n, i) => {
          const meta = META[n.type]
          if (!meta) return null
          const { Icon } = meta
          const label = dayLabel(n.created_at, now)
          const showHeader = i === 0 || dayLabel(visible[i - 1].created_at, now) !== label
          return (
            <Fragment key={n.id}>
              {showHeader && (
                <p className="bg-paper px-5 pt-4 pb-1.5 text-[12px] font-bold text-ink-400">{label}</p>
              )}
              <button
                onClick={() => open(n)}
              className={cn(
                'flex w-full items-start gap-3 border-b border-line-soft px-5 py-4 text-left last:border-0',
                !n.is_read && 'bg-primary-50/40',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  meta.tint,
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-ink-900">{meta.title}</p>
                <p className="mt-0.5 text-[13px] text-ink-600">{meta.body}</p>
                <p className="mt-1 text-[12px] text-ink-400">{formatRelative(n.created_at, now)}</p>
              </div>
              {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </button>
            </Fragment>
          )
        })}
        {hasMore && (
          <div ref={sentinelRef} className="py-4 text-center text-[12px] text-ink-400">
            더 불러오는 중…
          </div>
        )}
      </div>
      )}
    </div>
  )
}
