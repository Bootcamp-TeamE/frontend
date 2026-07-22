import { create } from 'zustand'

// 탐색 기준 위치. 온보딩/GPS 연동 전 기본값 = 데모 데이터가 많은 서울 시청 근처.
interface LocationState {
  lat: number
  lng: number
  label: string
  setLocation: (lat: number, lng: number, label?: string) => void
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: 37.5665,
  lng: 126.978,
  label: '서울 시청 근처',
  setLocation: (lat, lng, label = '현재 위치') => set({ lat, lng, label }),
}))
