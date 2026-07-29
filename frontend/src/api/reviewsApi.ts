import { apiRequest } from './http';
import { getStoredAuth } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

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

export type ReviewMedia = {
  url: string;
  type: 'image' | 'video';
};

export async function getReviews() {
  const response = await fetch(`${API_BASE_URL}/api/reviews`);
  if (!response.ok) throw new Error('Не удалось загрузить отзывы');
  return response.json() as Promise<Review[]>;
}

export function createReview(data: { text: string; rating: number; media?: ReviewMedia[] }) {
  return apiRequest<Review>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function uploadReviewMedia(file: File) {
  const token = getStoredAuth()?.token;
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${API_BASE_URL}/api/review-media`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!response.ok) {
    let message = 'Не удалось загрузить файл';
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      // Оставляем понятное общее сообщение.
    }
    throw new Error(message);
  }
  return response.json() as Promise<ReviewMedia>;
}

export function deleteReview(id: number) {
  return apiRequest<void>(`/api/reviews/${id}`, { method: 'DELETE' });
}
