import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subscriptionsApi } from '../api'
import type { SubscriptionCreate, SubscriptionUpdate } from '../types'
import { qk } from './queryKeys'

export function useSubscriptions(userId: number) {
  return useQuery({
    queryKey: qk.subscriptions(userId),
    queryFn: () => subscriptionsApi.listSubscriptions(userId),
    enabled: !!userId,
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
