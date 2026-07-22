import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api'
import type { OrderCreate } from '../types'
import { qk } from './queryKeys'

export function useOrders(userId: number) {
  return useQuery({
    queryKey: qk.orders(userId),
    queryFn: () => ordersApi.listOrders(userId),
    enabled: !!userId,
  })
}

export function useOrder(id: number | undefined) {
  return useQuery({
    queryKey: qk.order(id ?? 0),
    queryFn: () => ordersApi.getOrder(id as number),
    enabled: !!id,
  })
}

// 예약·결제·취소·수령은 재고/주문 상태를 바꾸므로 관련 목록을 넓게 무효화한다.
function useOrderMutation<TArgs, TData>(fn: (args: TArgs) => Promise<TData>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order'] })
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
