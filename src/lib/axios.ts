import axios from 'axios'
import { mockAdapter } from './mock/adapter'

const root = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const API_ROOT = root
export const API_PREFIX = '/api/v1'

/**
 * 목데이터 모드.
 * - VITE_USE_MOCK=true  → 강제 on
 * - VITE_USE_MOCK=false → 강제 off (실서버)
 * - 미설정 시: API 베이스 URL 이 비어 있으면 자동 on (백엔드 스캐폴드 단계 기본값)
 */
export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  (import.meta.env.VITE_USE_MOCK !== 'false' && !import.meta.env.VITE_API_BASE_URL)

export const api = axios.create({
  baseURL: `${root}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

if (USE_MOCK) {
  api.defaults.adapter = mockAdapter
  // eslint-disable-next-line no-console
  console.info('[마감할인] 목데이터 모드로 실행 중입니다. 실서버 연동 시 VITE_USE_MOCK=false')
}

// 백엔드 에러 본문은 {"detail": "<한글 메시지>"} → 화면에서 바로 쓰도록 message로 승격.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err?.response?.data?.detail
    if (typeof detail === 'string') err.message = detail
    return Promise.reject(err)
  },
)

export default api
