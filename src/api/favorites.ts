import { api } from '../lib/axios'
import type { Store } from '../types'

export async function listFavorites(): Promise<Store[]> {
  const { data } = await api.get<Store[]>('/favorites')
  return data
}

export async function addFavorite(storeId: number): Promise<void> {
  await api.post(`/stores/${storeId}/favorite`)
}

export async function removeFavorite(storeId: number): Promise<void> {
  await api.delete(`/stores/${storeId}/favorite`)
}
