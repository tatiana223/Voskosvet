const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const AUTH_STORAGE_KEY = 'voskosvet-auth';

function getAuthToken() {
  const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawAuth) {
    return null;
  }

  try {
    return JSON.parse(rawAuth).token as string | null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status}`;

    try {
      const errorBody = await response.json();

      if (typeof errorBody.message === 'string') {
        errorMessage = errorBody.message;
      }

      if (errorBody.errors && typeof errorBody.errors === 'object') {
        const validationMessages = Object.values(errorBody.errors).filter(Boolean);

        if (validationMessages.length > 0) {
          errorMessage = validationMessages.join('. ');
        }
      }
    } catch {
      // If the backend did not send JSON, keep the HTTP status message.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
