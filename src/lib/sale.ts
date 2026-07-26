import type { Sale } from '../types'

/** 품절 판정: 마감(비활성)이거나 남은 수량 소진. */
export function isSoldout(sale: Sale): boolean {
  return sale.status !== 'active' || sale.remaining_quantity <= 0
}

// 마감 임박도. 빨강(urgent)은 픽업 소요(30분)와 맞춰, 그 안이면 지금 움직여야 하는 구간.
const URGENT_MS = 30 * 60 * 1000
const SOON_MS = 60 * 60 * 1000

export type Urgency = 'closed' | 'urgent' | 'soon' | 'calm'

/** 남은 시간에 따른 긴박도. urgent=<30분(빨강), soon=<60분(앰버), calm=그 외(중립). */
export function saleUrgency(deadlineISO: string, now: number): Urgency {
  const remain = new Date(deadlineISO).getTime() - now
  if (remain <= 0) return 'closed'
  if (remain < URGENT_MS) return 'urgent'
  if (remain < SOON_MS) return 'soon'
  return 'calm'
}
