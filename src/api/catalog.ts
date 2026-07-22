import { api } from '../lib/axios'
import type { Category, Unit } from '../types'

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

export async function getUnits(): Promise<Unit[]> {
  const { data } = await api.get<Unit[]>('/units')
  return data
}
