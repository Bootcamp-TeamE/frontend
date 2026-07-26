import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast, useAuthStore } from '../store'

export default function RequireAuth() {
  const token = useAuthStore((s) => s.accessToken)
  const location = useLocation()
  // 미로그인 상태로 보호된 페이지에 들어오면 조용히 튕기지 않고 이유를 알린 뒤 이동.
  useEffect(() => {
    if (!token) toast('로그인이 필요합니다')
  }, [token])
  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  )
}
