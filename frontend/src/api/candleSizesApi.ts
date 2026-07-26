import { apiRequest } from './http';

export type CandleSizeOption = {
  id: number;
  valueCm: number;
};

export function getCandleSizes() {
  return apiRequest<CandleSizeOption[]>('/api/candle-sizes');
}
