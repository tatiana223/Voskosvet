import type { AuthResponse } from '../types/auth';

const AUTH_STORAGE_KEY = 'voskosvet-auth';

export type StoredAuth = AuthResponse & {
  token: string;
};

export function getStoredAuth(): StoredAuth | null {
  const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawAuth) {
    return null;
  }

  try {
    const auth = JSON.parse(rawAuth) as StoredAuth;
    return auth.token ? auth : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function setStoredAuth(auth: AuthResponse) {
  if (!auth.token) {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event('auth-changed'));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event('auth-changed'));
}

export function subscribeToAuth(listener: () => void) {
  window.addEventListener('auth-changed', listener);
  window.addEventListener('storage', listener);

  return () => {
    window.removeEventListener('auth-changed', listener);
    window.removeEventListener('storage', listener);
  };
}
