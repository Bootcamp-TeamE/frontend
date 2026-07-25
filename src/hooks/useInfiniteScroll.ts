import { useEffect, useRef, useState, type RefObject } from 'react'

// 클라이언트 무한 스크롤 — 이미 받아온 목록을 pageSize(기본 20)개씩 끊어 보여준다.
// 바닥의 sentinel이 보이면 다음 20개를 더 노출. resetKey가 바뀌면 처음(20개)으로.
// 내부 스크롤 영역이면 root에 그 컨테이너를 넘긴다(없으면 뷰포트 기준).
export function useInfiniteScroll<T>(
  items: T[],
  opts?: { pageSize?: number; resetKey?: string; root?: HTMLElement | null },
): { visible: T[]; hasMore: boolean; sentinelRef: RefObject<HTMLDivElement | null> } {
  const pageSize = opts?.pageSize ?? 20
  const resetKey = opts?.resetKey
  const root = opts?.root ?? null
  const [count, setCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // 필터·정렬·모드가 바뀌면 처음부터.
  useEffect(() => {
    setCount(pageSize)
  }, [resetKey, pageSize])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setCount((c) => c + pageSize)
      },
      { root, rootMargin: '240px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [pageSize, root, items.length])

  return { visible: items.slice(0, count), hasMore: count < items.length, sentinelRef }
}
