import { NavLink } from 'react-router-dom'
import { BellIcon, HomeIcon, MapIcon, UserIcon } from '../icons'
import { useAuthStore } from '../../store'
import { useUnreadCount } from '../../hooks'
import { cn } from '../../lib/cn'

const tabs = [
  { to: '/', label: '홈', Icon: HomeIcon, end: true, badge: false },
  { to: '/map', label: '지도', Icon: MapIcon, end: false, badge: false },
  { to: '/notifications', label: '알림', Icon: BellIcon, end: false, badge: true },
  { to: '/my', label: '마이', Icon: UserIcon, end: false, badge: false },
]

export function BottomTabBar() {
  const userId = useAuthStore((s) => s.userId)
  const { data: unread = 0 } = useUnreadCount(userId)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-[430px] grid-cols-4">
        {tabs.map(({ to, label, Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-stone-400',
              )
            }
          >
            <span className="relative">
              <Icon className="h-6 w-6" />
              {badge && unread > 0 && (
                <span className="absolute -right-1.5 -top-1 min-w-4 rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
