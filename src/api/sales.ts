import { api } from '../lib/axios'
import type { Sale, SaleCreate, SaleUpdate } from '../types'

export async function getSale(id: number): Promise<Sale> {
  const { data } = await api.get<Sale>(`/sales/${id}`)
  return data
}

export async function listSales(category?: string): Promise<Sale[]> {
  const { data } = await api.get<Sale[]>('/sales', {
    params: category ? { category } : undefined,
  })
  return data
}

export async function createSale(storeId: number, payload: SaleCreate): Promise<Sale> {
  const { data } = await api.post<Sale>(`/stores/${storeId}/sales`, payload)
  return data
}

export async function updateSale(id: number, payload: SaleUpdate): Promise<Sale> {
  const { data } = await api.patch<Sale>(`/sales/${id}`, payload)
  return data
}
