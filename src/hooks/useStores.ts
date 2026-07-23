import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { marketsApi, salesApi, storesApi } from '../api'
import type { SaleCreate, SaleUpdate, StoreCreate } from '../types'
import { qk } from './queryKeys'

export function useStore(id: number | undefined) {
  return useQuery({
    queryKey: qk.store(id ?? 0),
    queryFn: () => storesApi.getStore(id as number),
    enabled: !!id,
  })
}

export function useStoreSales(id: number | undefined) {
  return useQuery({
    queryKey: qk.storeSales(id ?? 0),
    queryFn: () => storesApi.getStoreSales(id as number),
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StoreCreate) => storesApi.createStore(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-store'] }),
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<StoreCreate> }) =>
      storesApi.updateStore(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store'] })
      queryClient.invalidateQueries({ queryKey: ['store'] })
    },
  })
}

export function useCreateSale(storeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SaleCreate) => salesApi.createSale(storeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['search-sales'] })
      queryClient.invalidateQueries({ queryKey: ['store-sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SaleUpdate }) =>
      salesApi.updateSale(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sale'] })
      queryClient.invalidateQueries({ queryKey: ['search-sales'] })
      queryClient.invalidateQueries({ queryKey: ['store-sales'] })
    },
  })
}
