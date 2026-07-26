import { apiRequest } from './http';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export type Review = {
  id: number;
  authorId?: number;
  name: string;
  text: string;
  rating: number;
  photoUrl?: string;
  createdAt: string;
};

export async function getReviews() {
  const response = await fetch(`${API_BASE_URL}/api/reviews`);
  if (!response.ok) throw new Error('Не удалось загрузить отзывы');
  return response.json() as Promise<Review[]>;
}

export function createReview(data: { text: string; rating: number; imageUrl?: string }) {
  return apiRequest<Review>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteReview(id: number) {
  return apiRequest<void>(`/api/reviews/${id}`, { method: 'DELETE' });
}
