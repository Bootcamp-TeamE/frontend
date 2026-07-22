import { useKakaoLoader as useKakaoLoaderOrigin } from 'react-kakao-maps-sdk'

export const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY ?? ''
export const isKakaoKeyConfigured = KAKAO_MAP_KEY.length > 0

// [loading, error]. 키 미설정이면 지도 화면에서 안내 폴백을 띄운다.
export function useKakaoMapLoader() {
  return useKakaoLoaderOrigin({ appkey: KAKAO_MAP_KEY, libraries: ['services'] })
}
