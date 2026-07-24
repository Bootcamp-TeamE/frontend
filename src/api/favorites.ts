import { api } from '../lib/axios'
import type { Store } from '../types'

export async function listFavorites(userId: number): Promise<Store[]> {
  const { data } = await api.get<Store[]>('/favorites', { params: { user_id: userId } })
  return data
}

export async function addFavorite(storeId: number, userId: number): Promise<void> {
  await api.post(`/stores/${storeId}/favorite`, { user_id: userId })
}

export async function removeFavorite(storeId: number, userId: number): Promise<void> {
  await api.delete(`/stores/${storeId}/favorite`, { params: { user_id: userId } })
}
