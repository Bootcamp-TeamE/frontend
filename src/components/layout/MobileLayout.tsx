import { Outlet } from 'react-router-dom'
import { BottomTabBar } from './BottomTabBar'
import { DevRoleSwitcher } from '../DevRoleSwitcher'
import { useNotificationStream } from '../../hooks'
import { useAuthStore } from '../../store'

export function MobileLayout() {
  const userId = useAuthStore((s) => s.userId)
  useNotificationStream(userId)

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white shadow-sm">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomTabBar />
      <DevRoleSwitcher />
    </div>
  )
}
