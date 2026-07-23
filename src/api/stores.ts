import { api } from '../lib/axios'
import type { Sale, Store, StoreCreate } from '../types'

export async function getStore(id: number): Promise<Store> {
  const { data } = await api.get<Store>(`/stores/${id}`)
  return data
}

export async function getStoreSales(id: number): Promise<Sale[]> {
  const { data } = await api.get<Sale[]>(`/stores/${id}/sales`)
  return data
}

export async function createStore(payload: StoreCreate): Promise<Store> {
  const { data } = await api.post<Store>('/stores', payload)
  return data
}

export async function updateStore(id: number, payload: Partial<StoreCreate>): Promise<Store> {
  const { data } = await api.patch<Store>(`/stores/${id}`, payload)
  return data
}
