import { useQuery } from '@tanstack/react-query'
import { salesApi, searchApi } from '../api'
import { qk } from './queryKeys'

export function useSales(category?: string) {
  return useQuery({
    queryKey: qk.sales(category),
    queryFn: () => salesApi.listSales(category),
  })
}

export function useSale(id: number | undefined) {
  return useQuery({
    queryKey: qk.sale(id ?? 0),
    queryFn: () => salesApi.getSale(id as number),
    enabled: !!id,
  })
}

interface Coords {
  lat: number
  lng: number
  radius?: number
  category?: string
  enabled?: boolean
}

export function useSearchSales({ lat, lng, radius = 2000, category, enabled = true }: Coords) {
  return useQuery({
    queryKey: qk.searchSales({ lat, lng, radius, category }),
    queryFn: () => searchApi.searchSales(lat, lng, radius, category),
    enabled,
  })
}
