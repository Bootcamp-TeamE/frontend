export function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}

// 마감까지 남은 시간을 "01:23:45" 또는 "12분"처럼. 지났으면 null.
export function remainingUntil(deadlineISO: string, now = Date.now()): string | null {
  const diff = new Date(deadlineISO).getTime() - now
  if (diff <= 0) return null
  const totalSec = Math.floor(diff / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}
