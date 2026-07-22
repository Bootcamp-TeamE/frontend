import { useEffect, useState } from 'react'

// 마감 카운트다운처럼 매초 갱신이 필요한 화면용 시계.
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
