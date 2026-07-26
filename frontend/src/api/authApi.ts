import { apiRequest } from './http';
import type { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest } from '../types/auth';

export function register(request: RegisterRequest) {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function login(request: LoginRequest) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function getCurrentUser() {
  return apiRequest<AuthResponse>('/api/users/me');
}

export function updateCurrentUser(request: UpdateProfileRequest) {
  return apiRequest<AuthResponse>('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}
