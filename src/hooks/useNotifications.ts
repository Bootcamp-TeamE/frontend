import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../api'
import { createEventSource } from '../lib/sse'
import { qk } from './queryKeys'

export function useNotifications(userId: number, unread = false) {
  return useQuery({
    queryKey: qk.notifications(userId, unread),
    queryFn: () => notificationsApi.listNotifications(userId, unread),
    enabled: !!userId,
  })
}

export function useUnreadCount(userId: number) {
  return useQuery({
    queryKey: qk.unreadCount(userId),
    queryFn: () => notificationsApi.getUnreadCount(userId),
    enabled: !!userId,
  })
}

function useNotificationMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })
}

export function useMarkRead() {
  return useNotificationMutation((id: number) => notificationsApi.markRead(id))
}

export function useMarkAllRead() {
  return useNotificationMutation((userId: number) => notificationsApi.markAllRead(userId))
}

// 워커→앱 Redis 백플레인을 거쳐 온 SSE 신호. 데이터는 없고 깨우기용 → 캐시 무효화로 재조회.
export function useNotificationStream(userId: number) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!userId) return
    const es = createEventSource('/notifications/stream', { user_id: userId })
    es.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    }
    return () => es.close()
  }, [userId, queryClient])
}
