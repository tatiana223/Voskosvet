import type { Candle } from '../types/candle';
import { getStoredAuth } from './auth';

const FAVORITES_EVENT = 'voskosvet-favorites-change';

function getFavoritesKey() {
  const auth = getStoredAuth();
  return auth ? `voskosvet-favorites-${auth.id}` : null;
}

export function getFavorites(): Candle[] {
  const key = getFavoritesKey();

  if (!key) {
    return [];
  }

  const value = localStorage.getItem(key);

  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as Candle[];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: Candle[]) {
  const key = getFavoritesKey();

  if (!key) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(favorites));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

export function isFavorite(candleId: number) {
  return getFavorites().some((candle) => candle.id === candleId);
}

export function toggleFavorite(candle: Candle) {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.id === candle.id);

  if (exists) {
    saveFavorites(favorites.filter((item) => item.id !== candle.id));
    return false;
  }

  saveFavorites([candle, ...favorites]);
  return true;
}

export function subscribeToFavorites(listener: () => void) {
  window.addEventListener(FAVORITES_EVENT, listener);
  window.addEventListener('storage', listener);

  return () => {
    window.removeEventListener(FAVORITES_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}
