import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const root = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const API_ROOT = root
export const API_PREFIX = '/api/v1'

export const api = axios.create({
  baseURL: `${root}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청마다 로그인 토큰을 Bearer로 첨부. store는 순환참조 회피 위해 getState()로 접근.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 백엔드 에러 본문은 {"detail": "<한글 메시지>"} → 화면에서 바로 쓰도록 message로 승격.
// 401은 토큰 만료/무효 → 로그아웃 후 로그인 화면으로.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      useAuthStore.getState().logout()
      if (location.pathname !== '/login') location.assign('/login')
    }
    const detail = err?.response?.data?.detail
    if (typeof detail === 'string') err.message = detail
    return Promise.reject(err)
  },
)

export default api
