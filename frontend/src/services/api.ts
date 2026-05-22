import { ApiErrorResponse } from '../types/api';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function getAccessToken(): string | null {
  return localStorage.getItem('ara2kom-access-token');
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  skipAuth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuth, ...fetchOptions } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const queryString = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ).toString();
    url += `?${queryString}`;
  }

  const headers = new Headers(fetchOptions.headers as HeadersInit);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('ngrok-skip-browser-warning')) {
    headers.set('ngrok-skip-browser-warning', '1');
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorData: ApiErrorResponse;
      if (isJson) {
        errorData = await response.json();
      } else {
        errorData = {
          detail: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      if (response.status === 401) {
        localStorage.removeItem('ara2kom-access-token');
        localStorage.removeItem('ara2kom-user');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Handle Pydantic 422 validation errors — detail is an array
      let message: string;
      if (Array.isArray(errorData.detail)) {
        message = errorData.detail
          .map((e: any) => {
            const msg = e.msg || '';
            return msg.replace(/^Value error, /, '');
          })
          .join(' • ');
      } else if (typeof errorData.detail === 'string') {
        message = errorData.detail;
      } else {
        message = 'Unknown error';
      }

      if (response.status === 401) {
        message = 'Your session expired. Please log in again.';
      }

      throw new ApiError(message, response.status, errorData);
    }

    // 204 No Content
    if (response.status === 204) return null as T;

    // Success
    if (isJson) {
      const data: T = await response.json();
      return data;
    } else {
      return {} as T;
    }

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Network error';
    throw new ApiError(`Request failed: ${message}`, 0, { detail: message, status: 0 });
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: ApiErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export { request, BASE_URL };