import axios from 'axios'

const root = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const API_ROOT = root
export const API_PREFIX = '/api/v1'

export const api = axios.create({
  baseURL: `${root}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
