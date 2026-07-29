import type { Candle } from '../types/candle';
import type { Category } from '../types/category';
import type { OrderResponse, OrderStatus } from '../types/order';
import type { SiteContent } from '../types/siteContent';
import type { ReviewMedia } from './reviewsApi';
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
  priceTiers: Array<{
    quantity: number;
    unitPrice: number;
  }>;
};

export function getAdminCredentials() {
  const auth = getStoredAuth();
  return auth && (auth.role === 'ADMIN' || auth.role === 'MANAGER') ? auth : null;
}

export function clearAdminCredentials() {
  clearStoredAuth();
}

export class AdminApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

function wait(delayMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

async function fetchWithWakeRetry(url: string, options?: RequestInit) {
  const isSafeRequest = !options?.method || options.method === 'GET';
  const attempts = isSafeRequest ? 3 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);

      if (
        isSafeRequest
        && attempt < attempts - 1
        && [500, 502, 503, 504].includes(response.status)
      ) {
        await wait(1500 * (attempt + 1));
        continue;
      }

      return response;
    } catch {
      if (!isSafeRequest || attempt === attempts - 1) {
        break;
      }

      await wait(1500 * (attempt + 1));
    }
  }

  throw new AdminApiError(
    'Сервер магазина запускается. Подождите немного и попробуйте ещё раз.',
  );
}

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const credentials = getAdminCredentials();

  if (!credentials) {
    throw new Error('Нужен вход администратора');
  }

  const isFormData = options?.body instanceof FormData;
  const response = await fetchWithWakeRetry(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${credentials.token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = response.status === 401
      ? 'Сессия завершилась. Войдите снова.'
      : response.status >= 500
        ? 'Сервер магазина ещё запускается. Попробуйте снова через несколько секунд.'
        : 'Не удалось выполнить действие';

    try {
      const body = await response.json();
      message = body.message || Object.values(body.errors || {}).join('. ') || message;
    } catch {
      // Backend может вернуть ответ без JSON.
    }

    throw new AdminApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getAdminCategories() {
  return adminRequest<Category[]>('/api/admin/categories');
}

export async function getAdminCandles() {
  const response = await fetchWithWakeRetry(
    `${API_BASE_URL}/api/candles?size=100&sort=createdAt,desc`,
  );
  if (!response.ok) {
    throw new AdminApiError(
      response.status >= 500
        ? 'Сервер магазина ещё запускается. Попробуйте снова через несколько секунд.'
        : 'Не удалось загрузить свечи',
      response.status,
    );
  }
  return response.json() as Promise<{ items: Candle[] }>;
}

export function createAdminCandle(data: CandleFormData) {
  const { available: _available, ...request } = data;
  return adminRequest<Candle>('/api/admin/candles', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function createAdminCandleSize(valueCm: number) {
  return adminRequest<{ id: number; valueCm: number }>('/api/admin/candle-sizes', {
    method: 'POST',
    body: JSON.stringify({ valueCm }),
  });
}

export function uploadAdminImage(file: File) {
  const body = new FormData();
  body.append('file', file);
  return adminRequest<{ url: string }>('/api/admin/media', {
    method: 'POST',
    body,
  });
}

export type Review = {
  id: number;
  authorId?: number;
  name: string;
  text: string;
  rating: number;
  photoUrl?: string;
  media: ReviewMedia[];
  featured: boolean;
  createdAt: string;
};

export function getReviews() {
  return fetchWithWakeRetry(`${API_BASE_URL}/api/reviews`).then((response) => {
    if (!response.ok) throw new AdminApiError('Не удалось загрузить отзывы', response.status);
    return response.json() as Promise<Review[]>;
  });
}

export function createAdminReview(data: {
  displayName: string;
  text: string;
  rating: number;
  media?: ReviewMedia[];
  featured?: boolean;
}) {
  return adminRequest<Review>('/api/admin/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function setAdminReviewFeatured(id: number, featured: boolean) {
  return adminRequest<Review>(`/api/admin/reviews/${id}/featured`, {
    method: 'PATCH',
    body: JSON.stringify({ featured }),
  });
}

export function setAdminReviewMedia(id: number, media: ReviewMedia[]) {
  return adminRequest<Review>(`/api/admin/reviews/${id}/media`, {
    method: 'PATCH',
    body: JSON.stringify(media),
  });
}

export function setAdminReviewCover(id: number, imageUrl: string) {
  return adminRequest<Review>(`/api/admin/reviews/${id}/cover`, {
    method: 'PATCH',
    body: JSON.stringify({ imageUrl }),
  });
}

export function deleteAdminReview(id: number) {
  return adminRequest<void>(`/api/admin/reviews/${id}`, { method: 'DELETE' });
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

export function deleteAdminCategory(id: number) {
  return adminRequest<void>(`/api/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

export function getAdminContent() {
  return adminRequest<Partial<SiteContent>>('/api/admin/content');
}

export function updateAdminContent(content: Partial<SiteContent>) {
  return adminRequest<SiteContent>('/api/admin/content', {
    method: 'PUT',
    body: JSON.stringify(content),
  });
}
