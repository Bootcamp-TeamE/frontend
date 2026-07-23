import { api } from '../lib/axios'
import type { Dashboard, Store } from '../types'

export async function getDashboard(ownerId: number): Promise<Dashboard> {
  const { data } = await api.get<Dashboard>('/owner/dashboard', {
    params: { owner_id: ownerId },
  })
  return data
}

export async function getMyStore(ownerId: number): Promise<Store> {
  const { data } = await api.get<Store>('/owner/store', {
    params: { owner_id: ownerId },
  })
  return data
}
