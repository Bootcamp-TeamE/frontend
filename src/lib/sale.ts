import type { Sale } from '../types'

/** 품절 판정: 마감(비활성)이거나 남은 수량 소진. */
export function isSoldout(sale: Sale): boolean {
  return sale.status !== 'active' || sale.remaining_quantity <= 0
}
