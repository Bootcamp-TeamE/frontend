// 쿼리 키 팩토리. 무효화 시 접두 배열(['notifications'] 등)로 부분 매칭한다.
export const qk = {
  categories: ['categories'] as const,
  units: ['units'] as const,
  sales: (category?: string) => ['sales', category ?? null] as const,
  sale: (id: number) => ['sale', id] as const,
  searchSales: (p: { lat: number; lng: number; radius: number; category?: string }) =>
    ['search-sales', p] as const,
  reach: (p: { lat: number; lng: number; category: string }) => ['reach', p] as const,
  store: (id: number) => ['store', id] as const,
  markets: (p: { lat: number; lng: number; radius: number }) => ['markets', p] as const,
  market: (id: number) => ['market', id] as const,
  marketStores: (id: number) => ['market-stores', id] as const,
  orders: (userId: number) => ['orders', userId] as const,
  order: (id: number) => ['order', id] as const,
  notifications: (userId: number, unread: boolean) =>
    ['notifications', userId, unread] as const,
  unreadCount: (userId: number) => ['unread-count', userId] as const,
  subscriptions: (userId: number) => ['subscriptions', userId] as const,
  dashboard: (ownerId: number) => ['dashboard', ownerId] as const,
}
