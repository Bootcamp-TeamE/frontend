import { api } from '../lib/axios'
import type { Dashboard } from '../types'

export async function getDashboard(ownerId: number): Promise<Dashboard> {
  const { data } = await api.get<Dashboard>('/owner/dashboard', {
    params: { owner_id: ownerId },
  })
  return data
}
