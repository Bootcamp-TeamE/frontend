import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BellIcon, BoxIcon, ChevronRightIcon, HeartIcon, UserIcon } from '../../components'
import { useFavorites, useOrders } from '../../hooks'
import { useAuthStore } from '../../store'

export function MyPage() {
  const userId = useAuthStore((s) => s.userId)
  const setRole = useAuthStore((s) => s.setRole)
  const navigate = useNavigate()
  const { data: orders } = useOrders(userId)
  const { data: favorites } = useFavorites(userId)

  const activeCount =
    orders?.filter((o) => o.status === 'reserved' || o.status === 'paid').length ?? 0
  const favoriteCount = favorites?.length ?? 0

  const goOwner = () => {
    setRole('owner')
    navigate('/owner/dashboard')
  }

  return (
    <div className="bg-paper">
      <header className="px-5 pt-6 pb-2">
        <h1 className="text-[20px] font-extrabold text-ink-900">마이</h1>
      </header>

      {/* 프로필 카드 */}
      <div className="px-5">
        <div className="flex items-center gap-3 rounded-card-lg bg-surface p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-ink-900">사용자 #{userId}</p>
            <p className="mt-0.5 text-[12px] text-ink-400">로그인 연동 전 데모 계정</p>
          </div>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="mt-4 bg-surface">
        <MenuRow
          to="/orders"
          icon={<BoxIcon className="h-5 w-5" />}
          label="내 예약"
          trailing={activeCount > 0 ? `진행 중 ${activeCount}` : undefined}
        />
        <MenuRow
          to="/favorites"
          icon={<HeartIcon className="h-5 w-5" />}
          label="관심 매장"
          trailing={favoriteCount > 0 ? `${favoriteCount}곳` : undefined}
        />
        <MenuRow
          to="/subscriptions"
          icon={<BellIcon className="h-5 w-5" />}
          label="구독 관리"
        />
      </div>

      {/* 점주 전환 */}
      <div className="mt-6 px-5">
        <button
          onClick={goOwner}
          className="flex w-full items-center justify-between rounded-card border border-line-strong bg-surface px-4 py-4 text-left"
        >
          <div>
            <p className="text-[14px] font-semibold text-ink-900">점주센터로 전환</p>
            <p className="mt-0.5 text-[12px] text-ink-400">내 매장의 마감세일을 등록·관리해요.</p>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-ink-300" />
        </button>
      </div>
    </div>
  )
}

function MenuRow({
  to,
  icon,
  label,
  trailing,
}: {
  to: string
  icon: ReactNode
  label: string
  trailing?: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 border-b border-line-soft px-5 py-4 last:border-0"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink-600">
        {icon}
      </span>
      <span className="flex-1 text-[15px] font-semibold text-ink-900">{label}</span>
      {trailing && <span className="text-[13px] text-ink-400">{trailing}</span>}
      <ChevronRightIcon className="h-5 w-5 text-ink-300" />
    </Link>
  )
}
