/**
 * Authentication Service
 * 
 * Handles all authentication flows: login, logout, token refresh, and current user.
 * Currently uses mock promises to define the expected API contract.
 * 
 * TODO (Frontend - Integration):
 * - Replace mock promises with actual `request<T>()` calls from api.ts
 * - Add error handling and retry logic
 * - Coordinate with AuthContext for state management
 */
import { UserRole } from '../app/contexts/AuthContext';
import { BASE_URL, request } from './api';
import {
  User,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from '../types/api';

/**
 * Mock token storage
 * 
 * TODO (Frontend - Production):
 * - Replace with secure memory storage or sessionStorage
 * - Never store tokens in localStorage (XSS vulnerable)
 * - Refresh token should be HTTP-only cookie (server-set)
 * 
 * TODO (Backend - FastAPI):
 * - Issue access_token with short expiry (15-30 min)
 * - Issue refresh_token as HTTP-only secure cookie
 * - No need to send refresh_token in response body in production
 */
const tokenStorage = {
  accessToken: null as string | null,
  refreshToken: null as string | null,
  user: null as User | null,

  setTokens(accessToken: string, refreshToken?: string, user?: User) {
    this.accessToken = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;
    if (user) this.user = user;
  },

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
  },

  getAccessToken() {
    return this.accessToken;
  },

  getRefreshToken() {
    return this.refreshToken;
  },
};

/**
 * Signup Function
 *
 * Registers a new company admin. Backend sends verification email.
 * User must verify email then use login to authenticate.
 *
 * TODO (Backend - FastAPI):
 * - Endpoint: POST /api/v1/auth/signup
 * - Validate domain exists, at least one API selected, etc.
 * - Create company + company admin user (unverified)
 * - Send verification email with link containing token
 * - Return 201 { success, message }; do NOT return tokens
 */
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await request<SignupResponse>('/companies/', {
    method: 'POST',
    body: JSON.stringify({
      company_name: data.company,
      email: data.email,
      phone: data.phone,
      domain_id: data.domainId,
      f_name: data.f_name,
      l_name: data.l_name,
      password: data.password,
    }),
    skipAuth: true,
  });
  return { success: true, message: 'Account created successfully' };
}

/**
 * التحقق من البريد الإلكتروني (called when user clicks link in email)
 * TODO (Backend - FastAPI): GET/POST /api/v1/auth/verify-email?token=...
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (!token || !token.startsWith('mock-verify-')) {
    return { success: false, error: 'Invalid or expired verification link' };
  }
  return { success: true };
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await request<{ message: string }>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
    return { success: true, message: response.message };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reset code',
    };
  }
}

export async function verifyResetCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    await request('/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
      skipAuth: true,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid reset code',
    };
  }
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    await request('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password: newPassword }),
      skipAuth: true,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset password',
    };
  }
}

/**
 * Login Function
 * 
 * TODO (Backend - FastAPI):
 * - Endpoint: POST /api/v1/auth/login
 * - Request body: { email: string, password: string }
 * - Response: {
 *     access_token: string (JWT with exp, sub, role, companyId),
 *     refresh_token?: string (in body for demo; HTTP-only cookie in prod),
 *     user: User
 *   }
 * 
 * - Validate email format
 * - Hash password comparison (use bcrypt or similar)
 * - Return 400 if credentials invalid
 * - Return 429 if too many failed attempts (rate limiting)
 * - JWT should include roles/permissions for client-side rendering hints
 * - BUT frontend should NOT trust role for authorization; server enforces
 * 
 * @param email - User email
 * @param password - User password
 * @throws Error with message if login fails
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = (errorData as { detail?: string }).detail || 'Login failed';
    throw new Error(message);
  }

  const data = (await response.json()) as { access_token: string; token_type: string };

  // Store token first so /users/me can use it
  localStorage.setItem('ara2kom-access-token', data.access_token);
  tokenStorage.setTokens(data.access_token);

  // Give the backend a moment before the follow-up request.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Fetch real user info including role_id
  const me = await request<{
    user_id: number;
    f_name: string;
    l_name: string;
    email: string;
    role_id: number;
    company_id: number;
  }>('/users/me');

  const user: User = {
    id: String(me.user_id),
    firstName: me.f_name,
    lastName: me.l_name,
    email: me.email,
    role: mapRoleIdToRole(me.role_id),   // ← converts 1,2,3 to role string
    companyId: String(me.company_id),
  };

  tokenStorage.setTokens(data.access_token, undefined, user);
  localStorage.setItem('ara2kom-user', JSON.stringify(user));

  return {
    access_token: data.access_token,
    refresh_token: '',
    user,
  };
}

// ← ADD THIS helper
function mapRoleIdToRole(role_id: number): UserRole {
  switch (role_id) {
    case 1: return 'manager';
    case 2: return 'customerServiceSupervisor';
    case 3: return 'websiteConfigurator';
    default: return 'websiteConfigurator';
  }
}

export async function logout(): Promise<void> {
  // TODO: Replace with actual API call (optional):
  // await request('/auth/logout', {
  //   method: 'POST',
  // }).catch(console.error); // Ignore errors; always logout client-side

  // Clear tokens
  tokenStorage.clearTokens();

  // Clear from localStorage (demo)
  localStorage.removeItem('ara2kom-access-token');
  localStorage.removeItem('ara2kom-user');
}

/**
 * Refresh Token Function
 * 
 * TODO (Backend - FastAPI):
 * - Endpoint: POST /api/v1/auth/refresh
 * - Request: send refresh_token via:
 *   a) HTTP-only cookie (automatic, no JS needed)
 *   b) Authorization header: Bearer <refresh_token>
 * - Response: { access_token, refresh_token?, user }
 * 
 * - Validate refresh_token (signature, expiry)
 * - Return 401 if invalid/expired
 * - Issue new access_token and optionally new refresh_token
 * - Update HTTP-only cookie if new refresh_token issued
 * 
 * Frontend side:
 * - Call this before access_token expiry (proactive)
 * - Or call on 401 response (reactive)
 * - Update in-memory token storage
 */
export async function refreshToken(): Promise<LoginResponse> {
  const refreshTokenValue = tokenStorage.getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }


  // Mock response
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = tokenStorage.user;
  if (!user) {
    throw new Error('User not found in storage');
  }

  const mockResponse: LoginResponse = {
    access_token: `mock-access-token-${Date.now()}`,
    refresh_token: `mock-refresh-token-${Date.now()}`,
    user,
  };

  tokenStorage.setTokens(
    mockResponse.access_token,
    mockResponse.refresh_token,
    mockResponse.user
  );

  localStorage.setItem('ara2kom-access-token', mockResponse.access_token);

  return mockResponse;
}

/**
 * Get Current User Function
 * 
 * TODO (Backend - FastAPI):
 * - Endpoint: GET /api/v1/auth/me
 * - Authorization required: Bearer <access_token>
 * - Response: User object with current user info
 * 
 * - Decode user from JWT or fetch from DB
 * - Return 401 if token invalid/expired
 * - Client will retry with refreshed token if needed
 * 
 * Frontend use case:
 * - Called on app startup to restore user session
 * - Verifies access_token is still valid
 * - Allows graceful handling of expired tokens
 */
export async function getCurrentUser(): Promise<User> {
  // TODO: Replace with actual API call:
  // const user = await request<User>('/auth/me', {
  //   method: 'GET',
  // });
  // return user;

  // Mock: return cached user or throw
  if (tokenStorage.user) {
    return tokenStorage.user;
  }

  throw new Error('No user session');
}

/**
 * Get Access Token (utility for context)
 * 
 * Used by api.ts to attach Authorization header
 */
export function getAccessToken(): string | null {
  return tokenStorage.getAccessToken();
}

/**
 * Initialize Auth from Storage (on app startup)
 * 
 * Called by AuthContext on mount to restore session
 * 
 * TODO (Frontend):
 * - Called in useEffect(() => { ... }, []) on app start
 * - Attempts to restore tokens from localStorage/sessionStorage
 * - Verifies token is still valid by calling getCurrentUser()
 * - If invalid, clears tokens and redirects to login
 * - If valid, restores user state
 */
export function initializeAuth(): { user: User | null; tokens: boolean } {
  // TODO: Restore from localStorage (demo) -> should be sessionStorage or memory in prod
  const storedUser = localStorage.getItem('ara2kom-user');
  const storedToken = localStorage.getItem('ara2kom-access-token');

  if (storedUser && storedToken) {
    try {
      const parsed = JSON.parse(storedUser) as User & { name?: string };

      // Backward compatibility for previously stored users with `name` only.
      const user: User = {
        ...parsed,
        firstName: parsed.firstName || parsed.name?.split(' ')[0] || '',
        lastName: parsed.lastName || parsed.name?.split(' ').slice(1).join(' ') || '',
      };

      tokenStorage.setTokens(storedToken, undefined, user);
      return { user, tokens: true };
    } catch {
      // Invalid stored data
      localStorage.removeItem('ara2kom-user');
      localStorage.removeItem('ara2kom-access-token');
      return { user: null, tokens: false };
    }
  }

  return { user: null, tokens: false };
}
