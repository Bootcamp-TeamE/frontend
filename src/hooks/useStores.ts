import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { marketsApi, salesApi, storesApi } from '../api'
import type { SaleCreate, StoreCreate } from '../types'
import { qk } from './queryKeys'

export function useStore(id: number | undefined) {
  return useQuery({
    queryKey: qk.store(id ?? 0),
    queryFn: () => storesApi.getStore(id as number),
    enabled: !!id,
  })
}

export function useMarkets(lat: number, lng: number, radius = 2000, enabled = true) {
  return useQuery({
    queryKey: qk.markets({ lat, lng, radius }),
    queryFn: () => marketsApi.searchMarkets(lat, lng, radius),
    enabled,
  })
}

export function useCreateStore() {
  return useMutation({
    mutationFn: (payload: StoreCreate) => storesApi.createStore(payload),
  })
}

export function useCreateSale(storeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SaleCreate) => salesApi.createSale(storeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['search-sales'] })
    },
  })
}
