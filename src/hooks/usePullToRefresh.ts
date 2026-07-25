import { useEffect, useRef, useState } from 'react'

// 모바일 당겨서 새로고침. 페이지 최상단에서 아래로 당기면 onRefresh 호출.
// 터치 기반이라 데스크톱(마우스/트랙패드)에선 동작하지 않는다.
export function usePullToRefresh(
  onRefresh: () => Promise<unknown> | void,
  opts?: { threshold?: number },
): { pull: number; refreshing: boolean } {
  const threshold = opts?.threshold ?? 70
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const pullRef = useRef(0)
  const busyRef = useRef(false)

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      startY.current = window.scrollY <= 0 && !busyRef.current ? e.touches[0].clientY : null
    }
    const onMove = (e: TouchEvent) => {
      if (startY.current == null) return
      const dy = e.touches[0].clientY - startY.current
      if (dy > 0 && window.scrollY <= 0) {
        const p = Math.min(dy * 0.5, threshold + 24) // 저항감
        pullRef.current = p
        setPull(p)
      }
    }
    const onEnd = async () => {
      if (startY.current == null) return
      startY.current = null
      if (pullRef.current >= threshold) {
        busyRef.current = true
        setRefreshing(true)
        setPull(threshold)
        try {
          await onRefresh()
        } finally {
          busyRef.current = false
          setRefreshing(false)
          pullRef.current = 0
          setPull(0)
        }
      } else {
        pullRef.current = 0
        setPull(0)
      }
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [onRefresh, threshold])

  return { pull, refreshing }
}
