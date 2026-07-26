import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ownerApi } from '../api'
import { createEventSource } from '../lib/sse'
import { useAuthStore } from '../store'
import { qk } from './queryKeys'

export function useDashboard() {
  const ownerId = useAuthStore((s) => s.user?.id)
  const enabled = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: qk.dashboard(ownerId ?? 0),
    queryFn: () => ownerApi.getDashboard(),
    enabled,
  })
}

export function useMyStore() {
  const ownerId = useAuthStore((s) => s.user?.id)
  const enabled = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: qk.myStore(ownerId ?? 0),
    queryFn: () => ownerApi.getMyStore(),
    enabled,
    retry: false,
  })
}

// 주문 커밋(예약·결제·취소·수령) 시 앱 프로세스가 발행 → 대시보드 스냅샷 재조회.
// 서버가 토큰으로 신원 판단 → SSE URL에 access token을 실어 인증. 미로그인 시 미연결.
export function useDashboardStream() {
  const token = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!token) return
    const es = createEventSource('/owner/dashboard/stream', { token })
    es.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
    return () => es.close()
  }, [token, queryClient])
}
