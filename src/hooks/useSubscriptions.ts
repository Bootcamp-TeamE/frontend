import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subscriptionsApi } from '../api'
import type { SubscriptionCreate, SubscriptionUpdate } from '../types'
import { useAuthStore } from '../store'
import { qk } from './queryKeys'

export function useSubscriptions() {
  const userId = useAuthStore((s) => s.user?.id)
  const enabled = useAuthStore((s) => !!s.accessToken)
  return useQuery({
    queryKey: qk.subscriptions(userId ?? 0),
    queryFn: () => subscriptionsApi.listSubscriptions(),
    enabled,
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SubscriptionCreate) =>
      subscriptionsApi.createSubscription(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubscriptionUpdate }) =>
      subscriptionsApi.updateSubscription(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  })
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => subscriptionsApi.deleteSubscription(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  })
}
