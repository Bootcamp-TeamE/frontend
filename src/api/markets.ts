import { api } from '../lib/axios'
import type { Market, MarketDetail, Store } from '../types'

export async function searchMarkets(
  lat: number,
  lng: number,
  radius = 2000,
): Promise<Market[]> {
  const { data } = await api.get<Market[]>('/markets', { params: { lat, lng, radius } })
  return data
}

export async function getMarket(id: number): Promise<MarketDetail> {
  const { data } = await api.get<MarketDetail>(`/markets/${id}`)
  return data
}

export async function getMarketStores(id: number): Promise<Store[]> {
  const { data } = await api.get<Store[]>(`/markets/${id}/stores`)
  return data
}
