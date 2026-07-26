import { api } from '../lib/axios'
import type { Notification } from '../types'

export async function listNotifications(unread = false): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>('/notifications', {
    params: { unread },
  })
  return data
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count')
  return data.count
}

export async function markRead(id: number): Promise<Notification> {
  const { data } = await api.patch<Notification>(`/notifications/${id}/read`)
  return data
}

export async function markAllRead(): Promise<number> {
  const { data } = await api.patch<{ updated: number }>('/notifications/read-all')
  return data.updated
}
