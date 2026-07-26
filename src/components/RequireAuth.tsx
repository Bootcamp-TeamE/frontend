import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function RequireAuth() {
  const token = useAuthStore((s) => s.accessToken)
  const location = useLocation()
  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  )
}
