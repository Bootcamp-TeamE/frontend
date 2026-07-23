// 백엔드 응답/요청 미러링. 기준: docs/final/05-API명세서.md

export type SaleStatus = 'active' | 'soldout' | 'closed'
export type OrderStatus = 'reserved' | 'paid' | 'picked_up' | 'cancelled' | 'expired'
export type NotificationType = 'order_paid' | 'sale_nearby'
export type UnitType = 'count' | 'weight'

export interface Category {
  code: string
  name_ko: string
  default_unit_code: string
  sort_order: number
}

export interface Unit {
  code: string
  name_ko: string
  unit_type: UnitType
  sort_order: number
}

export interface Market {
  id: number
  name: string
  market_type: string | null
  address: string | null
  lat: number
  lng: number
  distance_m?: number | null
}

export interface MarketDetail extends Market {
  store_count: number
}

export interface Store {
  id: number
  market_id: number | null
  owner_id: number | null
  category_code: string
  name: string
  address: string | null
  lat: number
  lng: number
  // ── 디자인(매장 상세)에서 필요로 하는 선택 필드 ──
  distance_m?: number
  rating?: number
  review_count?: number
}

export interface Sale {
  id: number
  store_id: number
  category_code: string
  title: string
  normal_price: number
  sale_price: number
  unit_code: string
  min_order: number
  total_quantity: number
  remaining_quantity: number
  deadline_at: string
  status: SaleStatus
  discount_rate: number
  // ── 디자인(홈 리스트·지도·상세)에서 필요로 하는 선택 필드 ──
  // 백엔드 목록/검색 응답에 조인해 내려주면 그대로 사용됨. 없으면 화면에서 graceful 처리.
  store_name?: string
  store_distance_m?: number
  lat?: number
  lng?: number
  /** 픽업 가능 시간대 표기 "오늘 18:00~21:00" */
  pickup_window?: string
}

export interface Order {
  id: number
  user_id: number
  sale_id: number
  quantity: number
  total_price: number
  status: OrderStatus
  qr_token: string | null
  pickup_no: string | null
  reserved_at: string
  expires_at: string
  paid_at: string | null
  picked_up_at: string | null
}

export interface Notification {
  id: number
  user_id: number
  order_id: number | null
  sale_id: number | null
  type: NotificationType
  is_read: boolean
  created_at: string
}

export interface Subscription {
  id: number
  user_id: number
  categories: string[]
  lat: number
  lng: number
  min_discount_rate: number
  max_price: number | null
  radius_m: number
  receive_from: number
  receive_to: number
  push_enabled: boolean
  opted_out: boolean
}

export interface Dashboard {
  owner_id: number
  store_id: number
  active_sales: number
  today_orders: number
  today_revenue: number
  total_reach: number
}

// ── 요청 페이로드 ──

export interface OrderCreate {
  user_id: number
  sale_id: number
  quantity?: number
}

export interface StoreCreate {
  category_code: string
  name: string
  lat: number
  lng: number
  market_id?: number | null
  address?: string | null
}

export interface SaleCreate {
  title: string
  normal_price: number
  sale_price: number
  total_quantity: number
  deadline_at: string
  category_code?: string | null
  unit_code?: string | null
  min_order?: number
}

export interface SaleUpdate {
  status?: SaleStatus
  sale_price?: number
}

export interface SubscriptionCreate {
  user_id: number
  categories: string[]
  lat: number
  lng: number
  min_discount_rate?: number
  max_price?: number | null
  radius_m?: number
  receive_from?: number
  receive_to?: number
  push_enabled?: boolean
  opted_out?: boolean
}

export type SubscriptionUpdate = Partial<Omit<SubscriptionCreate, 'user_id'>>
