import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../api'
import { createEventSource } from '../lib/sse'
import { useAuthStore } from '../store'
import { qk } from './queryKeys'

export function useNotifications(unread = false) {
  const userId = useAuthStore((s) => s.user?.id)
  const enabled = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: qk.notifications(userId ?? 0, unread),
    queryFn: () => notificationsApi.listNotifications(unread),
    enabled,
  })
}

export function useUnreadCount() {
  const userId = useAuthStore((s) => s.user?.id)
  const enabled = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: qk.unreadCount(userId ?? 0),
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled,
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
  return useNotificationMutation((_: void) => notificationsApi.markAllRead())
}

// 워커→앱 Redis 백플레인을 거쳐 온 SSE 신호. 데이터는 없고 깨우기용 → 캐시 무효화로 재조회.
// 서버가 토큰으로 신원 판단 → SSE URL에 access token을 실어 인증. 미로그인 시 미연결.
export function useNotificationStream() {
  const token = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!token) return
    const es = createEventSource('/notifications/stream', { token })
    es.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    }
    return () => es.close()
  }, [token, queryClient])
}
