import { create } from 'zustand'
import type { Sale } from '../types'

// 최근 본 상품(홈 '최근 본' 탭). 상품 상세 진입 시점의 Sale 스냅샷을 localStorage에 저장.
// 최근 본 순서(최신 먼저)로 유지하며, 마감 지난 항목은 화면에서 걸러 보여준다(여기선 원본 보관).
const KEY = 'recent-sales'
const MAX = 20

function load(): Sale[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Sale[]) : []
  } catch {
    return []
  }
}

function save(items: Sale[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // 저장 실패는 무시(프라이빗 모드 등).
  }
}

interface RecentState {
  items: Sale[]
  add: (sale: Sale) => void
}

export const useRecentStore = create<RecentState>((set) => ({
  items: load(),
  add: (sale) =>
    set((state) => {
      // 같은 상품은 최신 조회로 갱신하며 맨 앞으로.
      const items = [sale, ...state.items.filter((i) => i.id !== sale.id)].slice(0, MAX)
      save(items)
      return { items }
    }),
}))
