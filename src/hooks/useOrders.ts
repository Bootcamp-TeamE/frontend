import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api'
import type { OrderCreate } from '../types'
import { useAuthStore } from '../store'
import { qk } from './queryKeys'

export function useOrders() {
  const userId = useAuthStore((s) => s.user?.id)
  const enabled = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: qk.orders(userId ?? 0),
    queryFn: () => ordersApi.listOrders(),
    enabled,
  })
}

export function useOrder(id: number | undefined) {
  return useQuery({
    queryKey: qk.order(id ?? 0),
    queryFn: () => ordersApi.getOrder(id as number),
    enabled: !!id,
  })
}

// 점주 QR 확인: 픽업번호/토큰으로 주문 조회 (제출 시에만 실행)
export function useLookupOrder(code: string, enabled: boolean) {
  return useQuery({
    queryKey: qk.lookupOrder(code),
    queryFn: () => ordersApi.lookupOrder(code),
    enabled: enabled && code.trim().length > 0,
    retry: false,
  })
}

// 예약·결제·취소·수령은 재고/주문 상태를 바꾸므로 관련 목록을 넓게 무효화한다.
// lookup-order: 점주 QR 확인 화면이 픽업 처리 후 상태를 다시 읽도록 포함.
function useOrderMutation<TArgs, TData>(fn: (args: TArgs) => Promise<TData>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order'] })
      queryClient.invalidateQueries({ queryKey: ['lookup-order'] })
      queryClient.invalidateQueries({ queryKey: ['sale'] })
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['search-sales'] })
    },
  })
}

export function useCreateOrder() {
  return useOrderMutation((payload: OrderCreate) => ordersApi.createOrder(payload))
}

export function usePayOrder() {
  return useOrderMutation((id: number) => ordersApi.payOrder(id))
}

export function useCancelOrder() {
  return useOrderMutation((id: number) => ordersApi.cancelOrder(id))
}

export function usePickupOrder() {
  return useOrderMutation((id: number) => ordersApi.pickupOrder(id))
}
