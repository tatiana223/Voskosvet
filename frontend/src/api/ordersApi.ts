import { apiRequest } from './http';
import type { CreateOrderRequest, OrderResponse } from '../types/order';

export function createOrder(order: CreateOrderRequest) {
  return apiRequest<OrderResponse>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export function trackOrder(id: string, phone: string) {
  const params = new URLSearchParams({ phone });

  return apiRequest<OrderResponse>(`/api/orders/${id}/tracking?${params.toString()}`);
}

export function getMyOrders() {
  return apiRequest<OrderResponse[]>('/api/users/me/orders');
}
