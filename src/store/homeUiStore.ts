import { create } from 'zustand'

// 홈 정렬·카테고리를 세션 내 유지 → 상세로 갔다 돌아와도 보던 상태 그대로.
export type HomeSortKey = 'nearest' | 'closing' | 'discount'

interface HomeUiState {
  sort: HomeSortKey
  category: string | undefined
  setSort: (sort: HomeSortKey) => void
  setCategory: (category: string | undefined) => void
}

export const useHomeUiStore = create<HomeUiState>((set) => ({
  sort: 'nearest',
  category: undefined,
  setSort: (sort) => set({ sort }),
  setCategory: (category) => set({ category }),
}))
