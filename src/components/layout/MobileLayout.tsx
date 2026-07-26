import { Outlet } from 'react-router-dom'
import { BottomTabBar } from './BottomTabBar'
import { Toaster } from '../Toaster'
import { useNotificationStream } from '../../hooks'

export function MobileLayout() {
  useNotificationStream()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white shadow-sm">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomTabBar />
      <Toaster />
    </div>
  )
}
