import { NavLink } from 'react-router-dom'
import { BellIcon, HomeIcon, MapIcon, UserIcon } from '../icons'
import { useUnreadCount } from '../../hooks'
import { cn } from '../../lib/cn'

const tabs = [
  { to: '/', label: '홈', Icon: HomeIcon, end: true, badge: false },
  { to: '/map', label: '지도', Icon: MapIcon, end: false, badge: false },
  { to: '/notifications', label: '알림', Icon: BellIcon, end: false, badge: true },
  { to: '/my', label: '마이', Icon: UserIcon, end: false, badge: false },
]

export function BottomTabBar() {
  const { data: unread = 0 } = useUnreadCount()

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-stone-200 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-4">
        {tabs.map(({ to, label, Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-semibold transition-colors',
                isActive ? 'text-primary' : 'text-ink-400',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon className="h-6 w-6" />
                  {badge && unread > 0 && (
                    <span className="absolute -right-1.5 -top-1 min-w-4 rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-white">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </span>
                {label}
                {/* 활성 탭 하단 점 (README: 활성색 + 하단 5px 점) */}
                <span
                  className={cn(
                    'mt-0.5 h-[5px] w-[5px] rounded-full transition-colors',
                    isActive ? 'bg-primary' : 'bg-transparent',
                  )}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
