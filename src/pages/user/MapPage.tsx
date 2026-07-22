import { isKakaoKeyConfigured } from '../../lib/kakao'

export function MapPage() {
  return (
    <div className="px-5 pt-5">
      <h1 className="text-xl font-bold text-stone-900">지도</h1>
      <div className="mt-6 rounded-card border border-dashed border-stone-300 bg-stone-50 px-4 py-16 text-center text-sm text-stone-400">
        {isKakaoKeyConfigured
          ? '지도 화면은 이후 이슈에서 구현됩니다.'
          : '카카오맵 키(VITE_KAKAO_MAP_KEY)를 .env에 설정하면 지도가 활성화됩니다.'}
      </div>
    </div>
  )
}
