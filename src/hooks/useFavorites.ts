import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { favoritesApi } from '../api'
import type { Store } from '../types'
import { useAuthStore } from '../store'
import { qk } from './queryKeys'

export function useFavorites() {
  const userId = useAuthStore((s) => s.user?.id)
  const enabled = useAuthStore((s) => !!s.accessToken)
  const query = useQuery({
    queryKey: qk.favorites(userId ?? 0),
    queryFn: () => favoritesApi.listFavorites(),
    enabled,
  })
  // 하트 상태 판정을 위한 store_id 집합.
  const ids = useMemo(
    () => new Set((query.data ?? []).map((s) => s.id)),
    [query.data],
  )
  return { ...query, ids }
}

// 하트 토글. 관심 수(store.favorite_count)는 낙관적으로 ±1 반영하고,
// 하트 상태(favorites 목록)와 정확한 수치는 onSettled 무효화로 서버와 확정한다.
export function useToggleFavorite() {
  const userId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ storeId, favorited }: { storeId: number; favorited: boolean }) =>
      favorited
        ? favoritesApi.removeFavorite(storeId)
        : favoritesApi.addFavorite(storeId),
    onMutate: async ({ storeId, favorited }) => {
      await queryClient.cancelQueries({ queryKey: qk.store(storeId) })
      const prev = queryClient.getQueryData<Store>(qk.store(storeId))
      if (prev) {
        queryClient.setQueryData<Store>(qk.store(storeId), {
          ...prev,
          favorite_count: Math.max(0, (prev.favorite_count ?? 0) + (favorited ? -1 : 1)),
        })
      }
      return { prev }
    },
    onError: (_err, { storeId }, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk.store(storeId), ctx.prev)
    },
    onSettled: (_data, _err, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: qk.favorites(userId ?? 0) })
      queryClient.invalidateQueries({ queryKey: qk.store(storeId) })
    },
  })
}
