import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BellIcon, BoxIcon, ChevronRightIcon, HeartIcon, TopBar, UserIcon } from '../../components'
import { useFavorites, useOrders } from '../../hooks'
import { useAuthStore } from '../../store'
import mascot from '../../assets/mascot.png'

export function MyPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const { data: orders } = useOrders()
  const { data: favorites } = useFavorites()

  const activeCount =
    orders?.filter((o) => o.status === 'reserved' || o.status === 'paid').length ?? 0
  const favoriteCount = favorites?.length ?? 0

  const doLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="bg-paper">
      <TopBar title="마이" back={false} />

      {/* 프로필 카드 */}
      <div className="px-5 pt-1">
        <div className="flex items-center gap-3 overflow-hidden rounded-card-lg bg-surface p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-ink-900">{user?.name ?? user?.email}</p>
            <p className="mt-0.5 text-[12px] text-ink-400">{user?.email}</p>
          </div>
          <img
            src={mascot}
            alt=""
            aria-hidden
            className="-mb-4 -mr-1 ml-auto h-[72px] w-auto select-none"
          />
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

      {/* 로그아웃 */}
      <div className="mt-6 px-5">
        <button
          onClick={doLogout}
          className="flex w-full items-center justify-center rounded-card border border-line-strong bg-surface px-4 py-4 text-[14px] font-semibold text-ink-600"
        >
          로그아웃
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
