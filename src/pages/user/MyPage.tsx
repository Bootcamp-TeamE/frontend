import { Link } from 'react-router-dom'
import { Card } from '../../components'
import { useAuthStore } from '../../store'

const menu = [
  { to: '/orders', label: '내 예약' },
  { to: '/subscriptions', label: '구독 설정' },
]

export function MyPage() {
  const userId = useAuthStore((s) => s.userId)

  return (
    <div className="px-5 pt-5">
      <h1 className="text-xl font-extrabold text-stone-900">마이페이지</h1>
      <p className="mt-1 text-sm text-stone-400">사용자 #{userId} · 로그인 전 임시</p>

      <div className="mt-5 space-y-2">
        {menu.map((m) => (
          <Link key={m.to} to={m.to} className="block">
            <Card className="flex items-center justify-between p-4 font-semibold text-stone-800">
              {m.label}
              <span className="text-stone-300">›</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
