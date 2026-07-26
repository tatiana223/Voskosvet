import type { Candle } from '../types/candle';
import type { Category } from '../types/category';
import type { OrderResponse, OrderStatus } from '../types/order';
import { clearStoredAuth, getStoredAuth } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
export type CandleFormData = {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  scent: string;
  color: string;
  size: string;
  weightGrams: number;
  burnTimeHours: number;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  categoryId: number;
};

export function getAdminCredentials() {
  const auth = getStoredAuth();
  return auth && (auth.role === 'ADMIN' || auth.role === 'MANAGER') ? auth : null;
}

export function clearAdminCredentials() {
  clearStoredAuth();
}

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const credentials = getAdminCredentials();

  if (!credentials) {
    throw new Error('Нужен вход администратора');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${credentials.token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = response.status === 401 ? 'Неверный логин или пароль' : 'Не удалось выполнить действие';

    try {
      const body = await response.json();
      message = body.message || Object.values(body.errors || {}).join('. ') || message;
    } catch {
      // Backend может вернуть ответ без JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getAdminCategories() {
  return adminRequest<Category[]>('/api/admin/categories');
}

export async function getAdminCandles() {
  const response = await fetch(`${API_BASE_URL}/api/candles?size=100&sort=createdAt,desc`);
  if (!response.ok) throw new Error('Не удалось загрузить свечи');
  return response.json() as Promise<{ items: Candle[] }>;
}

export function createAdminCandle(data: CandleFormData) {
  const { available: _available, ...request } = data;
  return adminRequest<Candle>('/api/admin/candles', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function updateAdminCandle(id: number, data: CandleFormData) {
  return adminRequest<Candle>(`/api/admin/candles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function hideAdminCandle(id: number) {
  return adminRequest<void>(`/api/admin/candles/${id}`, { method: 'DELETE' });
}

export function getAdminOrders(status?: OrderStatus) {
  const params = new URLSearchParams({ size: '100' });
  if (status) params.set('status', status);
  return adminRequest<{ items: OrderResponse[] }>(`/api/admin/orders?${params.toString()}`);
}

export function updateAdminOrderStatus(id: number, status: OrderStatus) {
  return adminRequest<OrderResponse>(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export type AdminCustomer = {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
};

export function getAdminCustomers() {
  return adminRequest<AdminCustomer[]>('/api/admin/customers');
}

export function createAdminCategory(name: string, description: string) {
  return adminRequest<Category>('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify({ name, description, active: true }),
  });
}

export function updateAdminCategory(id: number, name: string, description: string, active: boolean) {
  return adminRequest<Category>(`/api/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description, active }),
  });
}
