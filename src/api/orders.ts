import { api } from '../lib/axios'
import type { Order, OrderCreate } from '../types'

export async function createOrder(payload: OrderCreate): Promise<Order> {
  const { data } = await api.post<Order>('/orders', payload)
  return data
}

export async function listOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/orders')
  return data
}

export async function getOrder(id: number): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}`)
  return data
}

// 점주 QR 확인: 픽업번호 또는 QR 토큰으로 주문 조회
export async function lookupOrder(code: string): Promise<Order> {
  const { data } = await api.get<Order>('/orders/lookup', { params: { code } })
  return data
}

export async function payOrder(id: number): Promise<Order> {
  const { data } = await api.post<Order>(`/orders/${id}/pay`)
  return data
}

export async function cancelOrder(id: number): Promise<Order> {
  const { data } = await api.post<Order>(`/orders/${id}/cancel`)
  return data
}

export async function pickupOrder(id: number): Promise<Order> {
  const { data } = await api.post<Order>(`/orders/${id}/pickup`)
  return data
}
