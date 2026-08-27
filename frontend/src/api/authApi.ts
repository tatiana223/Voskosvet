import { apiRequest } from './http';
import type { AuthResponse, LoginRequest, MessageResponse, RegisterRequest, UpdateProfileRequest } from '../types/auth';

/** Legacy client helpers retained for old source files; their routes are disabled by App and the server. */
export function register(request: RegisterRequest) {
  return apiRequest<MessageResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function verifyEmail(token: string) {
  return apiRequest<MessageResponse>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
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
