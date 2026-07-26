import { api } from '../lib/axios'
import type { Dashboard, Store } from '../types'

export async function getDashboard(): Promise<Dashboard> {
  const { data } = await api.get<Dashboard>('/owner/dashboard')
  return data
}

export async function getMyStore(): Promise<Store> {
  const { data } = await api.get<Store>('/owner/store')
  return data
}
