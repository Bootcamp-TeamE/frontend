import { API_ROOT } from './axios'

// 백엔드가 주는 상대 경로(/uploads/xxx.jpg)를 절대 URL로. 없으면 null → 화면에서 카테고리 톤 폴백.
export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_ROOT}${path}`
}
