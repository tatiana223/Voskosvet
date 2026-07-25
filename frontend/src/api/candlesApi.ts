import { apiRequest } from './http';
import type { Candle } from '../types/candle';
import type { PageResponse } from '../types/page';

export type CandleQuery = {
  categoryId?: number;
  featured?: boolean;
  scent?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  size?: number;
};

export function getCandles(query: CandleQuery = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return apiRequest<PageResponse<Candle>>(`/api/candles${queryString ? `?${queryString}` : ''}`);
}

export function getCandleBySlug(slug: string) {
  return apiRequest<Candle>(`/api/candles/slug/${slug}`);
}
