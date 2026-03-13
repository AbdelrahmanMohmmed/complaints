/**
 * Centralized API Client
 * 
 * This module provides a centralized HTTP client for all API requests.
 * 
 * TODO (Backend - FastAPI Team):
 * - Set BASE_URL to your FastAPI backend URL (e.g., http://localhost:8000 or https://api.example.com)
 * - Implement CORS to allow frontend origin
 * - All endpoints should be prefixed with /api/v1/
 * 
 * Frontend TODO:
 * - Environment variables: VITE_API_BASE_URL (set in .env files per environment)
 * - Interceptor will automatically attach Authorization header with access token
 * - Centralized error handling and code-to-message mapping
 */

import { ApiErrorResponse } from '../types/api';

/**
 * Base URL for the FastAPI backend
 * 
 * TODO: Update with backend URL or load from environment
 * Environment variable: VITE_API_BASE_URL
 */
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Get the current access token from storage
 * 
 * In production:
 * - Token stored in memory (not localStorage) to prevent XSS attacks
 * - Token persists for page lifetime
 * - On page reload, token is cleared; user must login/refresh
 * 
 * TODO (Backend - FastAPI):
 * - No need for session state; tokens are stateless
 * - Validate token signature server-side; revocation is optional
 */
function getAccessToken(): string | null {
  // TODO (Frontend): Replace with secure memory storage or sessionStorage
  // Currently placeholder for localStorage
  return localStorage.getItem('ara2kom-access-token');
}

/**
 * Interface for API request options
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  skipAuth?: boolean; // Skip authorization header (for login endpoint)
}

/**
 * Centralized API request handler
 * 
 * Handles:
 * - Automatic Authorization header injection
 * - Query param serialization
 * - Centralized error handling
 * - Request/response logging (TODO: add to production)
 * 
 * @param endpoint - API endpoint path (e.g., '/auth/login')
 * @param options - Fetch RequestInit + custom options
 * @throws ApiError with normalized error message
 * 
 * TODO (Backend - FastAPI):
 * - All errors should return consistent structure: { detail: string, status: number }
 * - Frontend will map status codes to user-friendly messages
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuth, ...fetchOptions } = options;

  // Construct URL with query params
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const queryString = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ).toString();
    url += `?${queryString}`;
  }

  // Build headers using the Fetch Headers object to accept Headers | string[][] | Record<string, string>
  const headers = new Headers(fetchOptions.headers as HeadersInit);
  // Ensure a default Content-Type if not provided
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach authorization header if token exists and not skipped
  // TODO (Backend - FastAPI):
  // - Expected header format: Authorization: Bearer <access_token>
  // - Validate token in every request; return 401 if invalid/expired
  // - Frontend will attempt token refresh on 401
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

    // Handle non-JSON responses
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
    // TODO: Trigger token refresh
  }
  throw new ApiError(errorData.detail || 'Unknown error', response.status, errorData);
}

// ← 204 check goes HERE, after the error block
if (response.status === 204) return null as T;

// Success: parse JSON response
if (isJson) {
  const data: T = await response.json();
  return data;
} else {
  return {} as T;
}
  } catch (error) {
    // Network or parsing error
    if (error instanceof ApiError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Network error';
    throw new ApiError(`Request failed: ${message}`, 0, { detail: message, status: 0 });
  }
}

/**
 * Custom error class for API errors
 * 
 * Allows caller to distinguish API errors from network errors
 */
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

/**
 * Export the request function for internal service modules
 * 
 * Usage in authService, complaintsService, etc.:
 * ```
 * const response = await request<LoginResponse>('/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({ email, password }),
 *   skipAuth: true,
 * });
 * ```
 */
export { request, BASE_URL };
