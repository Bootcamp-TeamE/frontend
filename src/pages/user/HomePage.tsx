import { Badge, EmptyState, LoadingScreen } from '../../components'
import { useCategories } from '../../hooks'

// 셋업 검증용 실연동 화면: 카테고리를 실제 API에서 불러와 CORS·API 배선을 확인한다.
export function HomePage() {
  const { data: categories, isLoading, isError, error } = useCategories()

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white/95 px-5 pb-3 pt-5 backdrop-blur">
        <h1 className="text-xl font-extrabold text-stone-900">내 주변 마감할인</h1>
        <p className="mt-0.5 text-sm text-stone-400">현재 위치 기준 · 반경 2km</p>
      </header>

      {categories && (
        <div className="flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
          {categories.map((c) => (
            <Badge key={c.code} tone="neutral" className="shrink-0 px-3 py-1">
              {c.name_ko}
            </Badge>
          ))}
        </div>
      )}

      <div className="px-5">
        {isLoading && <LoadingScreen />}
        {isError && (
          <p className="py-12 text-center text-sm text-danger">
            백엔드에 연결하지 못했습니다.
            <br />
            서버(uvicorn)가 켜져 있는지 확인하세요.
            <br />
            <span className="text-xs text-stone-400">{(error as Error)?.message}</span>
          </p>
        )}
        {categories && (
          <EmptyState
            title="곧 마감세일 목록이 표시됩니다"
            description="탐색·예약 화면은 이후 이슈에서 구현됩니다."
          />
        )}
      </div>
    </div>
  )
}
