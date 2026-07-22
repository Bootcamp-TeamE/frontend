import { api } from '../lib/axios'
import type { Sale } from '../types'

export async function searchSales(
  lat: number,
  lng: number,
  radius = 2000,
  category?: string,
): Promise<Sale[]> {
  const { data } = await api.get<Sale[]>('/search/sales', {
    params: { lat, lng, radius, ...(category ? { category } : {}) },
  })
  return data
}

export async function getReach(
  lat: number,
  lng: number,
  category: string,
): Promise<number> {
  const { data } = await api.get<{ reach: number }>('/search/reach', {
    params: { lat, lng, category },
  })
  return data.reach
}
