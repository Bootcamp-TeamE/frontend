import { api } from '../lib/axios'
import type { Order, OrderCreate } from '../types'

export async function createOrder(payload: OrderCreate): Promise<Order> {
  const { data } = await api.post<Order>('/orders', payload)
  return data
}

export async function listOrders(userId: number): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/orders', { params: { user_id: userId } })
  return data
}

export async function getOrder(id: number): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}`)
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
