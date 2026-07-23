import { create } from 'zustand'

// 탐색 기준 위치. 온보딩/GPS 연동 전 기본값 = 데모 데이터가 많은 회현동(남대문 일대).
interface LocationState {
  lat: number
  lng: number
  label: string
  setLocation: (lat: number, lng: number, label?: string) => void
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: 37.5596,
  lng: 126.9779,
  label: '회현동',
  setLocation: (lat, lng, label = '현재 위치') => set({ lat, lng, label }),
}))
