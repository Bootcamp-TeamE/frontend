import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BellIcon,
  BoxIcon,
  ChevronRightIcon,
  HeartIcon,
  LogoutIcon,
  StoreIcon,
  TopBar,
  UserIcon,
} from '../../components'
import { useFavorites, useOrders } from '../../hooks'
import { useAuthStore } from '../../store'

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
    navigate('/')
  }

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <TopBar title="마이" back={false} />

      <div className="flex-1 px-5 pt-1">
        {/* 프로필 카드 */}
        <div className="flex items-center gap-3 overflow-hidden rounded-card-lg bg-surface p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
            <UserIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            {user ? (
              <p className="truncate text-[15px] font-bold text-ink-900">{user.name ?? '내 계정'}</p>
            ) : (
              <>
                <p className="text-[15px] font-bold text-ink-900">로그인이 필요합니다</p>
                <Link
                  to="/login"
                  state={{ from: '/my' }}
                  className="mt-0.5 inline-block text-[13px] font-semibold text-primary"
                >
                  로그인하기
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 점주 센터 — 점주일 때만 노출되는 모드 전환 진입로 */}
        {user?.role === 'owner' && (
          <Link
            to="/owner"
            className="mt-4 flex items-center gap-3 rounded-card-lg bg-primary p-4 text-white transition-transform active:scale-[0.99]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <StoreIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold">점주 센터</p>
              <p className="mt-0.5 text-[12px] text-white/80">내 매장 · 대시보드 관리</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-white/70" />
          </Link>
        )}

        {/* 메뉴 카드 */}
        <div className="mt-4 overflow-hidden rounded-card-lg bg-surface">
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
          <MenuRow to="/subscriptions" icon={<BellIcon className="h-5 w-5" />} label="구독 관리" />
        </div>

        {/* 로그아웃 — 보조 액션이라 절제된 무게. 로그인 상태에서만 노출 */}
        {user && (
          <button
            onClick={doLogout}
            className="mt-5 flex w-full items-center justify-center gap-1.5 py-3 text-[13px] font-medium text-ink-400 transition-colors active:text-ink-600"
          >
            <LogoutIcon className="h-4 w-4" />
            로그아웃
          </button>
        )}
      </div>

      {/* 브랜드 푸터 — 하단 여백을 닫아준다 */}
      <footer className="px-5 pb-8 pt-6 text-center">
        <p className="text-[13px] font-bold tracking-tight text-ink-300">SOLDE</p>
        <p className="mt-0.5 text-[11px] text-ink-300">동네 마감세일</p>
      </footer>
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
      className="flex items-center gap-3 border-b border-line-soft px-4 py-4 transition-colors last:border-0 active:bg-paper"
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
