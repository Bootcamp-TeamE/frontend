import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'

// 로그인 붙기 전 임시. buyer↔owner 셸 전환용 개발 도구.
export function DevRoleSwitcher() {
  const role = useAuthStore((s) => s.role)
  const setRole = useAuthStore((s) => s.setRole)
  const navigate = useNavigate()

  const toggle = () => {
    const next = role === 'buyer' ? 'owner' : 'buyer'
    setRole(next)
    navigate(next === 'buyer' ? '/' : '/owner/dashboard')
  }

  return (
    <button
      onClick={toggle}
      className="fixed bottom-24 right-4 z-40 rounded-full bg-stone-900/85 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur"
    >
      dev · {role === 'buyer' ? '유저' : '점주'} 화면 ↔
    </button>
  )
}
