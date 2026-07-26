import { apiRequest } from './http';
import type { CreateOrderRequest, OrderResponse } from '../types/order';

export function createOrder(order: CreateOrderRequest) {
  return apiRequest<OrderResponse>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export function trackOrders(phone: string, surname: string) {
  const params = new URLSearchParams({ phone, surname });

  return apiRequest<OrderResponse[]>(`/api/orders/tracking?${params.toString()}`);
}

export function getMyOrders() {
  return apiRequest<OrderResponse[]>('/api/users/me/orders');
}
