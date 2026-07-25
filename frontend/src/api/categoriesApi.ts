import { apiRequest } from './http';
import type { Category } from '../types/category';

export function getCategories() {
  return apiRequest<Category[]>('/api/categories');
}
