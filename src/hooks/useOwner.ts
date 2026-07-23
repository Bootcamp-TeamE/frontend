import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ownerApi } from '../api'
import { createEventSource } from '../lib/sse'
import { qk } from './queryKeys'

export function useDashboard(ownerId: number) {
  return useQuery({
    queryKey: qk.dashboard(ownerId),
    queryFn: () => ownerApi.getDashboard(ownerId),
    enabled: !!ownerId,
  })
}

export function useMyStore(ownerId: number) {
  return useQuery({
    queryKey: qk.myStore(ownerId),
    queryFn: () => ownerApi.getMyStore(ownerId),
    enabled: !!ownerId,
    retry: false,
  })
}

// 주문 커밋(예약·결제·취소·수령) 시 앱 프로세스가 발행 → 대시보드 스냅샷 재조회.
export function useDashboardStream(ownerId: number) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!ownerId) return
    const es = createEventSource('/owner/dashboard/stream', { owner_id: ownerId })
    es.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
    return () => es.close()
  }, [ownerId, queryClient])
}
