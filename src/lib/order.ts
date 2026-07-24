import type { OrderStatus } from '../types'

type Tone = 'primary' | 'success' | 'danger' | 'neutral'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  reserved: '결제 대기',
  paid: '픽업 대기',
  picked_up: '픽업 완료',
  cancelled: '취소됨',
  expired: '예약 만료',
  refunded: '환불됨',
}

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  reserved: 'primary',
  paid: 'success',
  picked_up: 'neutral',
  cancelled: 'danger',
  expired: 'danger',
  refunded: 'danger',
}
