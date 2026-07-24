import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { favoritesApi } from '../api'
import { qk } from './queryKeys'

export function useFavorites(userId: number) {
  const query = useQuery({
    queryKey: qk.favorites(userId),
    queryFn: () => favoritesApi.listFavorites(userId),
    enabled: !!userId,
  })
  // 하트 상태 판정을 위한 store_id 집합.
  const ids = useMemo(
    () => new Set((query.data ?? []).map((s) => s.id)),
    [query.data],
  )
  return { ...query, ids }
}

// 낙관적 토글 — 즉시 하트 반영 후 서버 반영, 실패 시 롤백.
export function useToggleFavorite(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ storeId, favorited }: { storeId: number; favorited: boolean }) =>
      favorited
        ? favoritesApi.removeFavorite(storeId, userId)
        : favoritesApi.addFavorite(storeId, userId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
}
