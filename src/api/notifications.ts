import { api } from '../lib/axios'
import type { Notification } from '../types'

export async function listNotifications(
  userId: number,
  unread = false,
): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>('/notifications', {
    params: { user_id: userId, unread },
  })
  return data
}

export async function getUnreadCount(userId: number): Promise<number> {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count', {
    params: { user_id: userId },
  })
  return data.count
}

export async function markRead(id: number): Promise<Notification> {
  const { data } = await api.patch<Notification>(`/notifications/${id}/read`)
  return data
}

export async function markAllRead(userId: number): Promise<number> {
  const { data } = await api.patch<{ updated: number }>('/notifications/read-all', null, {
    params: { user_id: userId },
  })
  return data.updated
}
