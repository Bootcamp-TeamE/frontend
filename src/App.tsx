import { Navigate, Route, Routes } from 'react-router-dom'
import { MobileLayout, MobilePushLayout, OwnerLayout, RequireAuth, RequireOwner } from './components'
import {
  FavoritesPage,
  HomePage,
  LoginPage,
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
  SubscriptionFormPage,
  SubscriptionsPage,
} from './pages'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* 유저 - 하단 탭 루트 (공개). 알림·마이는 미로그인 시 페이지가 직접 안내(리다이렉트 X) */}
      <Route element={<MobileLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/my" element={<MyPage />} />
      </Route>

      {/* 유저 - 밀려 들어오는 상세 화면 (탭바 없음, 공개) */}
      <Route element={<MobilePushLayout />}>
        <Route path="/stores/:id" element={<StoreDetailPage />} />
        <Route path="/sales/:id" element={<SaleDetailPage />} />
      </Route>

      {/* 유저 - 밀려 들어오는 화면 (로그인 필요) */}
      <Route element={<RequireAuth />}>
        <Route element={<MobilePushLayout />}>
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/subscriptions/new" element={<SubscriptionFormPage />} />
          <Route path="/subscriptions/:id/edit" element={<SubscriptionFormPage />} />
        </Route>
      </Route>

      {/* 점주 - 와이드 셸 */}
      <Route element={<RequireOwner />}>
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboardPage />} />
          <Route path="store" element={<OwnerStorePage />} />
          <Route path="sales/new" element={<OwnerSaleNewPage />} />
          <Route path="scan" element={<OwnerScanPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
