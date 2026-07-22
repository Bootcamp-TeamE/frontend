import { Outlet } from 'react-router-dom'
import { DevRoleSwitcher } from '../DevRoleSwitcher'

// 상세·예약처럼 밀려 들어오는 화면용. 하단 탭바 없이 프레임만.
export function MobilePushLayout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white shadow-sm">
      <Outlet />
      <DevRoleSwitcher />
    </div>
  )
}
