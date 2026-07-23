import type { NotificationType } from '../types'

export const NOTI_LABEL: Record<NotificationType, string> = {
  order_paid: '결제 완료',
  order_picked_up: '픽업 완료',
  sale_nearby: '내 주변 마감세일',
}

export const NOTI_DESC: Record<NotificationType, string> = {
  order_paid: '결제가 완료됐어요. 픽업 시간을 확인하세요.',
  order_picked_up: '픽업이 완료됐어요. 이용해 주셔서 감사합니다.',
  sale_nearby: '조건에 맞는 마감세일이 근처에 떴어요.',
}

export const NOTI_TONE: Record<NotificationType, 'success' | 'primary' | 'neutral'> = {
  order_paid: 'success',
  order_picked_up: 'neutral',
  sale_nearby: 'primary',
}
