import { create } from 'zustand'

// 탐색 기준 위치. 온보딩/GPS 연동 전 기본값 = 시흥삼미시장(공공데이터 매장 밀집).
interface LocationState {
  lat: number
  lng: number
  label: string
  setLocation: (lat: number, lng: number, label?: string) => void
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: 37.44,
  lng: 126.7837,
  label: '시흥삼미시장',
  setLocation: (lat, lng, label = '현재 위치') => set({ lat, lng, label }),
}))
