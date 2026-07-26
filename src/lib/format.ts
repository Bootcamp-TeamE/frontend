export function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}

// 320 → "320m", 1100 → "1.1km"
export function formatDistance(meters: number | undefined | null): string | null {
  if (meters == null) return null
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

// ISO → "21:00"
export function formatHHmm(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ISO → "방금 전" / "12분 전" / "3시간 전" / "2일 전"
export function formatRelative(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  return `${Math.floor(hr / 24)}일 전`
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
