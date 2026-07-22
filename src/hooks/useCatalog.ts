import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '../api'
import { qk } from './queryKeys'

export function useCategories() {
  return useQuery({
    queryKey: qk.categories,
    queryFn: catalogApi.getCategories,
    staleTime: 60 * 60 * 1000,
  })
}

export function useUnits() {
  return useQuery({
    queryKey: qk.units,
    queryFn: catalogApi.getUnits,
    staleTime: 60 * 60 * 1000,
  })
}
