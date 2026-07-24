import { Navigate, Route, Routes } from 'react-router-dom'
import { MobileLayout, MobilePushLayout, OwnerLayout } from './components'
import {
  FavoritesPage,
  HomePage,
  MapPage,
  MyPage,
  NotFoundPage,
  NotificationsPage,
  OrderDetailPage,
  OrdersPage,
  OwnerDashboardPage,
  OwnerSaleNewPage,
  OwnerScanPage,
  OwnerStorePage,
  SaleDetailPage,
  StoreDetailPage,
  SubscriptionsPage,
} from './pages'

function App() {
  return (
    <Routes>
      {/* 유저 - 하단 탭 루트 */}
      <Route element={<MobileLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/my" element={<MyPage />} />
      </Route>

      {/* 유저 - 밀려 들어오는 상세 화면 (탭바 없음) */}
      <Route element={<MobilePushLayout />}>
        <Route path="/stores/:id" element={<StoreDetailPage />} />
        <Route path="/sales/:id" element={<SaleDetailPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
      </Route>

      {/* 점주 - 와이드 셸 */}
      <Route path="/owner" element={<OwnerLayout />}>
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboardPage />} />
        <Route path="store" element={<OwnerStorePage />} />
        <Route path="sales/new" element={<OwnerSaleNewPage />} />
        <Route path="scan" element={<OwnerScanPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
