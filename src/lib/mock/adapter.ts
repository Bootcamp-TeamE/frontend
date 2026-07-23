/**
 * axios mock 어댑터 — api 인스턴스의 adapter 를 교체해, 백엔드 없이도
 * 모든 엔드포인트가 목데이터로 응답하게 한다. (VITE_USE_MOCK 로 on/off)
 *
 * 라우트 표는 백엔드 API 명세(src/api/*.ts 의 경로)와 1:1 로 맞춰져 있으므로,
 * 실서버가 준비되면 이 어댑터를 끄기만 하면 된다.
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import * as db from './db'

const LATENCY = 220

type Params = Record<string, unknown>
type Handler = (m: RegExpMatchArray, cfg: InternalAxiosRequestConfig) => unknown

interface Route {
  method: string
  pattern: RegExp
  handler: Handler
}

function params(cfg: InternalAxiosRequestConfig): Params {
  return (cfg.params as Params) ?? {}
}
function body<T>(cfg: InternalAxiosRequestConfig): T {
  if (!cfg.data) return {} as T
  return (typeof cfg.data === 'string' ? JSON.parse(cfg.data) : cfg.data) as T
}
function num(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const routes: Route[] = [
  { method: 'get', pattern: /^\/categories$/, handler: () => db.categories },
  { method: 'get', pattern: /^\/units$/, handler: () => db.units },

  {
    method: 'get',
    pattern: /^\/search\/sales$/,
    handler: (_m, cfg) => {
      const p = params(cfg)
      const category = p.category as string | undefined
      let list = db.sales.filter((s) => !category || s.category_code === category)
      // 지오 검색 흉내: 거리순 기본 정렬 + active 우선
      list = [...list].sort((a, b) => {
        const soldA = a.status !== 'active' ? 1 : 0
        const soldB = b.status !== 'active' ? 1 : 0
        if (soldA !== soldB) return soldA - soldB
        return (a.store_distance_m ?? 0) - (b.store_distance_m ?? 0)
      })
      return list
    },
  },
  {
    method: 'get',
    pattern: /^\/search\/reach$/,
    handler: (_m, cfg) => {
      const category = params(cfg).category as string | undefined
      const reach = db.sales.filter((s) => !category || s.category_code === category).length
      return { reach: reach * 3 }
    },
  },

  {
    method: 'get',
    pattern: /^\/sales$/,
    handler: (_m, cfg) => {
      const category = params(cfg).category as string | undefined
      return db.sales.filter((s) => !category || s.category_code === category)
    },
  },
  { method: 'get', pattern: /^\/sales\/(\d+)$/, handler: (m) => db.getSale(num(m[1])) },

  { method: 'get', pattern: /^\/stores\/(\d+)$/, handler: (m) => db.getStore(num(m[1])) },
  {
    method: 'get',
    pattern: /^\/stores\/(\d+)\/sales$/,
    handler: (m) => db.storeSales(num(m[1])),
  },

  {
    method: 'get',
    pattern: /^\/markets$/,
    handler: () => [
      { id: 1, name: '남대문시장', market_type: '전통시장', address: '서울 중구 남대문시장길', lat: 37.5599, lng: 126.9774, distance_m: 400 },
    ],
  },
  {
    method: 'get',
    pattern: /^\/markets\/(\d+)$/,
    handler: () => ({ id: 1, name: '남대문시장', market_type: '전통시장', address: '서울 중구 남대문시장길', lat: 37.5599, lng: 126.9774, store_count: db.stores.length }),
  },
  { method: 'get', pattern: /^\/markets\/(\d+)\/stores$/, handler: () => db.stores },

  // 주문
  {
    method: 'post',
    pattern: /^\/orders$/,
    handler: (_m, cfg) => {
      const b = body<{ user_id: number; sale_id: number; quantity?: number }>(cfg)
      return db.createOrder(b.user_id, b.sale_id, b.quantity ?? 1)
    },
  },
  {
    method: 'get',
    pattern: /^\/orders$/,
    handler: (_m, cfg) => db.listOrders(num(params(cfg).user_id)),
  },
  { method: 'get', pattern: /^\/orders\/(\d+)$/, handler: (m) => db.getOrder(num(m[1])) },
  { method: 'post', pattern: /^\/orders\/(\d+)\/pay$/, handler: (m) => db.payOrder(num(m[1])) },
  { method: 'post', pattern: /^\/orders\/(\d+)\/cancel$/, handler: (m) => db.cancelOrder(num(m[1])) },
  { method: 'post', pattern: /^\/orders\/(\d+)\/pickup$/, handler: (m) => db.pickupOrder(num(m[1])) },

  // 알림
  {
    method: 'get',
    pattern: /^\/notifications$/,
    handler: (_m, cfg) => {
      const p = params(cfg)
      return db.listNotifications(num(p.user_id), p.unread === true || p.unread === 'true')
    },
  },
  {
    method: 'get',
    pattern: /^\/notifications\/unread-count$/,
    handler: (_m, cfg) => ({ count: db.unreadCount(num(params(cfg).user_id)) }),
  },
  { method: 'patch', pattern: /^\/notifications\/(\d+)\/read$/, handler: (m) => db.markRead(num(m[1])) },
  {
    method: 'patch',
    pattern: /^\/notifications\/read-all$/,
    handler: (_m, cfg) => ({ updated: db.markAllRead(num(params(cfg).user_id)) }),
  },

  // 구독
  {
    method: 'get',
    pattern: /^\/subscriptions$/,
    handler: (_m, cfg) => db.subscriptions.filter((s) => s.user_id === num(params(cfg).user_id)),
  },
  {
    method: 'post',
    pattern: /^\/subscriptions$/,
    handler: (_m, cfg) => db.createSubscription(body(cfg)),
  },
  {
    method: 'patch',
    pattern: /^\/subscriptions\/(\d+)$/,
    handler: (m, cfg) => db.updateSubscription(num(m[1]), body(cfg)),
  },

  // 점주(owner)
  {
    method: 'get',
    pattern: /^\/owner\/dashboard$/,
    handler: (_m, cfg) => db.dashboard(num(params(cfg).owner_id)),
  },
  {
    method: 'get',
    pattern: /^\/owner\/store$/,
    handler: (_m, cfg) => db.getMyStore(num(params(cfg).owner_id)),
  },
  { method: 'post', pattern: /^\/stores$/, handler: (_m, cfg) => db.createStore(body(cfg)) },
  {
    method: 'patch',
    pattern: /^\/stores\/(\d+)$/,
    handler: (m, cfg) => db.updateStore(num(m[1]), body(cfg)),
  },
  {
    method: 'post',
    pattern: /^\/stores\/(\d+)\/sales$/,
    handler: (m, cfg) => db.createSale(num(m[1]), body(cfg)),
  },
  {
    method: 'patch',
    pattern: /^\/sales\/(\d+)$/,
    handler: (m, cfg) => db.updateSale(num(m[1]), body(cfg)),
  },

  // 점주 QR 확인
  {
    method: 'get',
    pattern: /^\/orders\/lookup$/,
    handler: (_m, cfg) => db.lookupOrder(String(params(cfg).code ?? '')),
  },
]

function resolve(cfg: InternalAxiosRequestConfig): unknown {
  const method = (cfg.method ?? 'get').toLowerCase()
  const url = (cfg.url ?? '').split('?')[0]
  for (const route of routes) {
    if (route.method !== method) continue
    const m = url.match(route.pattern)
    if (m) return route.handler(m, cfg)
  }
  throw db.notFound(`mock 라우트 없음: ${method.toUpperCase()} ${url}`)
}

export const mockAdapter: AxiosAdapter = (cfg) =>
  new Promise<AxiosResponse>((resolve_, reject) => {
    setTimeout(() => {
      try {
        const data = resolve(cfg as InternalAxiosRequestConfig)
        resolve_({
          data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: cfg,
        } as AxiosResponse)
      } catch (e) {
        const err = e as db.MockError
        const status = err?.status ?? 500
        const detail = err?.detail ?? '목 어댑터 오류'
        // axios 인터셉터가 response.data.detail → message 로 승격
        reject(
          Object.assign(new Error(detail), {
            isAxiosError: true,
            config: cfg,
            response: { data: { detail }, status, statusText: 'Error', headers: {}, config: cfg },
          }),
        )
      }
    }, LATENCY)
  })
