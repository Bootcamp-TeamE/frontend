import { api } from '../lib/axios'
import type { Store, StoreCreate } from '../types'

export async function getStore(id: number): Promise<Store> {
  const { data } = await api.get<Store>(`/stores/${id}`)
  return data
}

export async function createStore(payload: StoreCreate): Promise<Store> {
  const { data } = await api.post<Store>('/stores', payload)
  return data
}
