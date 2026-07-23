import { NavLink, Outlet } from 'react-router-dom'
import { DevRoleSwitcher } from '../DevRoleSwitcher'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/owner/dashboard', label: '판매 모니터링' },
  { to: '/owner/store', label: '매장 관리' },
  { to: '/owner/sales/new', label: '세일 등록' },
  { to: '/owner/scan', label: 'QR 확인' },
]

export function OwnerLayout() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <span className="flex items-center gap-2 text-lg font-extrabold text-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            마감할인 점주센터
          </span>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-ink-400 hover:bg-paper',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
      <DevRoleSwitcher />
    </div>
  )
}
