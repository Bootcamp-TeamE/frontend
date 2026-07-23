/**
 * Mock 데이터 스토어 — 백엔드가 아직 /health 스캐폴드뿐이라, 유저 핵심 루프를
 * 목데이터로 실제 동작시키기 위한 인메모리 DB.
 *
 * 타입은 src/types(백엔드 계약 미러링)를 그대로 따르므로, 실제 API가 준비되면
 * 이 어댑터만 끄면(VITE_USE_MOCK=false) 코드 변경 없이 실서버로 전환된다.
 */
import type {
  Category,
  Dashboard,
  Notification,
  Order,
  Sale,
  SaleCreate,
  SaleUpdate,
  Store,
  StoreCreate,
  Subscription,
  SubscriptionCreate,
  SubscriptionUpdate,
  Unit,
} from '../../types'

// ── 카탈로그 ──
export const categories: Category[] = [
  { code: 'bakery', name_ko: '베이커리', default_unit_code: 'ea', sort_order: 1 },
  { code: 'greengrocer', name_ko: '청과', default_unit_code: 'ea', sort_order: 2 },
  { code: 'seafood', name_ko: '수산', default_unit_code: 'ea', sort_order: 3 },
  { code: 'egg_dairy', name_ko: '유제품', default_unit_code: 'ea', sort_order: 4 },
  { code: 'butcher', name_ko: '정육', default_unit_code: 'g', sort_order: 5 },
  { code: 'sidedish', name_ko: '반찬', default_unit_code: 'pack', sort_order: 6 },
]

export const units: Unit[] = [
  { code: 'ea', name_ko: '개', unit_type: 'count', sort_order: 1 },
  { code: 'pack', name_ko: '팩', unit_type: 'count', sort_order: 2 },
  { code: 'g', name_ko: 'g', unit_type: 'weight', sort_order: 3 },
]

// ── 매장 (회현동/남대문 일대) ──
export const stores: Store[] = [
  { id: 1, market_id: 1, owner_id: 1, category_code: 'bakery', name: '행복베이커리', address: '서울 중구 회현동1가 12-3', lat: 37.5601, lng: 126.9782, distance_m: 320, rating: 4.8, review_count: 126 },
  { id: 2, market_id: 1, owner_id: 2, category_code: 'egg_dairy', name: '신선마트', address: '서울 중구 회현동2가 45', lat: 37.5588, lng: 126.9799, distance_m: 540, rating: 4.6, review_count: 88 },
  { id: 3, market_id: 1, owner_id: 3, category_code: 'greengrocer', name: '초록상회', address: '서울 중구 남창동 34', lat: 37.5575, lng: 126.9768, distance_m: 780, rating: 4.9, review_count: 54 },
  { id: 4, market_id: 1, owner_id: 4, category_code: 'seafood', name: '남문수산', address: '서울 중구 남대문시장4길 9', lat: 37.5596, lng: 126.9772, distance_m: 1100, rating: 4.7, review_count: 203 },
]

const STORE_BY_ID = new Map(stores.map((s) => [s.id, s]))

/** 오늘 HH:mm 의 ISO. 이미 지났거나 임박하면 데모용으로 now+fallback 으로 밀어 카운트다운이 살아있게 함 */
function deadline(hh: number, mm: number, fallbackMin: number): string {
  const now = new Date()
  const t = new Date()
  t.setHours(hh, mm, 0, 0)
  const diffMin = (t.getTime() - now.getTime()) / 60000
  if (diffMin < 3) return new Date(now.getTime() + fallbackMin * 60000).toISOString()
  return t.toISOString()
}

function discountRate(normal: number, sale: number): number {
  return Math.round((1 - sale / normal) * 100)
}

interface SeedSale {
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
  deadline: [number, number, number]
  pickup_window: string
}

const SEED: SeedSale[] = [
  { id: 101, store_id: 1, category_code: 'bakery', title: '버터 크로와상', normal_price: 5000, sale_price: 2500, unit_code: 'ea', min_order: 1, total_quantity: 12, remaining_quantity: 5, deadline: [21, 0, 95], pickup_window: '오늘 18:00~21:00' },
  { id: 102, store_id: 2, category_code: 'egg_dairy', title: '국산 우유 1L', normal_price: 3200, sale_price: 1900, unit_code: 'ea', min_order: 1, total_quantity: 20, remaining_quantity: 8, deadline: [22, 0, 150], pickup_window: '오늘 17:00~22:00' },
  { id: 103, store_id: 3, category_code: 'greengrocer', title: '유기농 쌈채소', normal_price: 6000, sale_price: 3500, unit_code: 'pack', min_order: 1, total_quantity: 10, remaining_quantity: 3, deadline: [19, 30, 42], pickup_window: '오늘 16:00~19:30' },
  { id: 104, store_id: 4, category_code: 'seafood', title: '손질 고등어 2손', normal_price: 12000, sale_price: 7000, unit_code: 'ea', min_order: 1, total_quantity: 6, remaining_quantity: 2, deadline: [20, 0, 70], pickup_window: '오늘 15:00~20:00' },
  { id: 105, store_id: 1, category_code: 'bakery', title: '통밀 바게트', normal_price: 4500, sale_price: 2700, unit_code: 'ea', min_order: 1, total_quantity: 8, remaining_quantity: 4, deadline: [21, 0, 95], pickup_window: '오늘 18:00~21:00' },
  { id: 106, store_id: 1, category_code: 'bakery', title: '옛날 소보로 3개입', normal_price: 3600, sale_price: 2000, unit_code: 'pack', min_order: 1, total_quantity: 6, remaining_quantity: 0, deadline: [21, 0, 95], pickup_window: '오늘 18:00~21:00' },
  { id: 107, store_id: 3, category_code: 'greengrocer', title: '제철 방울토마토 500g', normal_price: 7000, sale_price: 4200, unit_code: 'pack', min_order: 1, total_quantity: 9, remaining_quantity: 6, deadline: [19, 30, 55], pickup_window: '오늘 16:00~19:30' },
]

function buildSale(seed: SeedSale): Sale {
  const store = STORE_BY_ID.get(seed.store_id)!
  const remaining = seed.remaining_quantity
  return {
    id: seed.id,
    store_id: seed.store_id,
    category_code: seed.category_code,
    title: seed.title,
    normal_price: seed.normal_price,
    sale_price: seed.sale_price,
    unit_code: seed.unit_code,
    min_order: seed.min_order,
    total_quantity: seed.total_quantity,
    remaining_quantity: remaining,
    deadline_at: deadline(seed.deadline[0], seed.deadline[1], seed.deadline[2]),
    status: remaining <= 0 ? 'soldout' : 'active',
    discount_rate: discountRate(seed.normal_price, seed.sale_price),
    store_name: store.name,
    store_distance_m: distanceFor(seed.store_id),
    lat: store.lat,
    lng: store.lng,
    pickup_window: seed.pickup_window,
  }
}

function distanceFor(storeId: number): number {
  return { 1: 320, 2: 540, 3: 780, 4: 1100 }[storeId] ?? 500
}

export const sales: Sale[] = SEED.map(buildSale)
const SALE_BY_ID = new Map(sales.map((s) => [s.id, s]))

// ── 주문 ──
export const orders = new Map<number, Order>()
let orderSeq = 5000
let pickupSeq = 141
let tokenSeq = 900

export function createOrder(userId: number, saleId: number, quantity = 1): Order {
  const sale = SALE_BY_ID.get(saleId)
  if (!sale) throw notFound('상품을 찾을 수 없습니다.')
  if (sale.status !== 'active' || sale.remaining_quantity <= 0)
    throw conflict('이미 마감된 상품입니다.')
  const qty = Math.max(sale.min_order, Math.min(quantity, sale.remaining_quantity))
  // 조건부 재고 차감(원자적 흉내)
  sale.remaining_quantity -= qty
  if (sale.remaining_quantity <= 0) sale.status = 'soldout'

  const now = new Date()
  orderSeq += 1
  const order: Order = {
    id: orderSeq,
    user_id: userId,
    sale_id: saleId,
    quantity: qty,
    total_price: sale.sale_price * qty,
    status: 'reserved',
    qr_token: null,
    pickup_no: null,
    reserved_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 10 * 60000).toISOString(),
    paid_at: null,
    picked_up_at: null,
  }
  orders.set(order.id, order)
  return order
}

export function payOrder(id: number): Order {
  const order = getOrder(id)
  if (order.status === 'expired') throw conflict('예약이 만료되었습니다.')
  if (order.status === 'reserved') {
    pickupSeq += 1
    tokenSeq += 1
    const letters = 'ABCDEFGH'
    order.status = 'paid'
    order.paid_at = new Date().toISOString()
    order.pickup_no = `${letters[pickupSeq % letters.length]}-${pickupSeq}`
    order.qr_token = `mgh:${order.id}:${tokenSeq}`
    // 결제 완료 알림 발행
    pushNotification({ order_id: order.id, sale_id: order.sale_id, type: 'order_paid' })
  }
  return order
}

export function cancelOrder(id: number): Order {
  const order = getOrder(id)
  if (order.status === 'reserved' || order.status === 'paid') {
    const sale = SALE_BY_ID.get(order.sale_id)
    if (sale) {
      sale.remaining_quantity += order.quantity
      if (sale.remaining_quantity > 0 && sale.status === 'soldout') sale.status = 'active'
    }
    order.status = 'cancelled'
  }
  return order
}

export function pickupOrder(id: number): Order {
  const order = getOrder(id)
  if (order.status === 'paid') {
    order.status = 'picked_up'
    order.picked_up_at = new Date().toISOString()
  }
  return order
}

export function getOrder(id: number): Order {
  const order = orders.get(id)
  if (!order) throw notFound('주문을 찾을 수 없습니다.')
  // 만료 스윕 흉내
  if (order.status === 'reserved' && new Date(order.expires_at).getTime() < Date.now()) {
    order.status = 'expired'
    const sale = SALE_BY_ID.get(order.sale_id)
    if (sale) {
      sale.remaining_quantity += order.quantity
      if (sale.remaining_quantity > 0 && sale.status === 'soldout') sale.status = 'active'
    }
  }
  return order
}

export function listOrders(userId: number): Order[] {
  return [...orders.values()].filter((o) => o.user_id === userId)
}

export function getSale(id: number): Sale {
  const sale = SALE_BY_ID.get(id)
  if (!sale) throw notFound('상품을 찾을 수 없습니다.')
  return sale
}

export function getStore(id: number): Store {
  const store = STORE_BY_ID.get(id)
  if (!store) throw notFound('매장을 찾을 수 없습니다.')
  return store
}

export function storeSales(storeId: number): Sale[] {
  return sales.filter((s) => s.store_id === storeId)
}

// ── 알림 ──
export const notifications: Notification[] = [
  {
    id: 700,
    user_id: 1,
    order_id: null,
    sale_id: 103,
    type: 'sale_nearby',
    is_read: false,
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
  },
]
let notiSeq = 700

function pushNotification(input: {
  order_id: number | null
  sale_id: number | null
  type: Notification['type']
}) {
  notiSeq += 1
  notifications.unshift({
    id: notiSeq,
    user_id: 1,
    order_id: input.order_id,
    sale_id: input.sale_id,
    type: input.type,
    is_read: false,
    created_at: new Date().toISOString(),
  })
}

export function listNotifications(userId: number, unread: boolean): Notification[] {
  return notifications.filter((n) => n.user_id === userId && (!unread || !n.is_read))
}
export function unreadCount(userId: number): number {
  return notifications.filter((n) => n.user_id === userId && !n.is_read).length
}
export function markRead(id: number): Notification {
  const n = notifications.find((x) => x.id === id)
  if (!n) throw notFound('알림을 찾을 수 없습니다.')
  n.is_read = true
  return n
}
export function markAllRead(userId: number): number {
  let count = 0
  notifications.forEach((n) => {
    if (n.user_id === userId && !n.is_read) {
      n.is_read = true
      count += 1
    }
  })
  return count
}

// ── 구독 ──
export const subscriptions: Subscription[] = []
let subSeq = 300

export function createSubscription(payload: SubscriptionCreate): Subscription {
  subSeq += 1
  const sub: Subscription = {
    id: subSeq,
    user_id: payload.user_id,
    categories: payload.categories,
    lat: payload.lat,
    lng: payload.lng,
    min_discount_rate: payload.min_discount_rate ?? 0,
    max_price: payload.max_price ?? null,
    radius_m: payload.radius_m ?? 2000,
    receive_from: payload.receive_from ?? 9,
    receive_to: payload.receive_to ?? 22,
    push_enabled: payload.push_enabled ?? true,
    opted_out: payload.opted_out ?? false,
  }
  subscriptions.push(sub)
  return sub
}

export function updateSubscription(id: number, payload: SubscriptionUpdate): Subscription {
  const sub = subscriptions.find((s) => s.id === id)
  if (!sub) throw notFound('구독을 찾을 수 없습니다.')
  Object.assign(sub, payload)
  return sub
}

// ── 점주(owner) ──
let storeSeq = 100
let saleSeq = 200

export function createStore(payload: StoreCreate, ownerId = 1): Store {
  storeSeq += 1
  const store: Store = {
    id: storeSeq,
    market_id: payload.market_id ?? 1,
    owner_id: ownerId,
    category_code: payload.category_code,
    name: payload.name,
    address: payload.address ?? null,
    lat: payload.lat,
    lng: payload.lng,
    distance_m: 0,
    rating: undefined,
    review_count: undefined,
  }
  stores.push(store)
  return store
}

export function getMyStore(ownerId: number): Store {
  const store = stores.find((s) => s.owner_id === ownerId)
  if (!store) throw notFound('등록된 매장이 없습니다.')
  return store
}

export function updateStore(id: number, payload: Partial<StoreCreate>): Store {
  const store = STORE_BY_ID.get(id) ?? stores.find((s) => s.id === id)
  if (!store) throw notFound('매장을 찾을 수 없습니다.')
  Object.assign(store, payload)
  return store
}

export function createSale(storeId: number, payload: SaleCreate): Sale {
  const store = stores.find((s) => s.id === storeId)
  if (!store) throw notFound('매장을 찾을 수 없습니다.')
  saleSeq += 1
  const sale: Sale = {
    id: saleSeq,
    store_id: storeId,
    category_code: payload.category_code ?? store.category_code,
    title: payload.title,
    normal_price: payload.normal_price,
    sale_price: payload.sale_price,
    unit_code: payload.unit_code ?? 'ea',
    min_order: payload.min_order ?? 1,
    total_quantity: payload.total_quantity,
    remaining_quantity: payload.total_quantity,
    deadline_at: payload.deadline_at,
    status: 'active',
    discount_rate: discountRate(payload.normal_price, payload.sale_price),
    store_name: store.name,
    store_distance_m: store.distance_m,
    lat: store.lat,
    lng: store.lng,
    pickup_window: '매장 운영시간 내',
  }
  sales.push(sale)
  SALE_BY_ID.set(sale.id, sale)
  return sale
}

export function updateSale(id: number, payload: SaleUpdate): Sale {
  const sale = SALE_BY_ID.get(id)
  if (!sale) throw notFound('상품을 찾을 수 없습니다.')
  if (payload.status) sale.status = payload.status
  if (payload.sale_price != null) {
    sale.sale_price = payload.sale_price
    sale.discount_rate = discountRate(sale.normal_price, payload.sale_price)
  }
  return sale
}

export function dashboard(ownerId: number): Dashboard {
  const store = stores.find((s) => s.owner_id === ownerId)
  const storeId = store?.id ?? -1
  const storeSaleIds = new Set(sales.filter((s) => s.store_id === storeId).map((s) => s.id))
  const storeOrders = [...orders.values()].filter((o) => storeSaleIds.has(o.sale_id))
  const paid = storeOrders.filter((o) => o.status === 'paid' || o.status === 'picked_up')
  return {
    owner_id: ownerId,
    store_id: storeId,
    active_sales: sales.filter((s) => s.store_id === storeId && s.status === 'active').length,
    today_orders: storeOrders.length,
    today_revenue: paid.reduce((sum, o) => sum + o.total_price, 0),
    total_reach: sales.filter((s) => s.store_id === storeId).length * 8,
  }
}

/** 점주 QR 확인: 픽업번호 또는 QR 토큰으로 주문 조회 */
export function lookupOrder(code: string): Order {
  const key = code.trim()
  const order = [...orders.values()].find(
    (o) => o.pickup_no === key || o.qr_token === key,
  )
  if (!order) throw notFound('해당 픽업번호의 주문을 찾을 수 없습니다.')
  return order
}

// ── 에러 헬퍼 (axios 인터셉터가 detail → message 로 승격) ──
export interface MockError {
  status: number
  detail: string
}
export function notFound(detail: string): MockError {
  return { status: 404, detail }
}
export function conflict(detail: string): MockError {
  return { status: 409, detail }
}
