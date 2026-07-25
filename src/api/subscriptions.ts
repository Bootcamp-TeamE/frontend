import { api } from '../lib/axios'
import type { Subscription, SubscriptionCreate, SubscriptionUpdate } from '../types'

export async function createSubscription(
  payload: SubscriptionCreate,
): Promise<Subscription> {
  const { data } = await api.post<Subscription>('/subscriptions', payload)
  return data
}

export async function listSubscriptions(userId: number): Promise<Subscription[]> {
  const { data } = await api.get<Subscription[]>('/subscriptions', {
    params: { user_id: userId },
  })
  return data
}

export async function updateSubscription(
  id: number,
  payload: SubscriptionUpdate,
): Promise<Subscription> {
  const { data } = await api.patch<Subscription>(`/subscriptions/${id}`, payload)
  return data
}

export async function deleteSubscription(id: number): Promise<void> {
  await api.delete(`/subscriptions/${id}`)
}
