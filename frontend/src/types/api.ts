/**
 * API Type Definitions
 * 
 * This file defines all TypeScript interfaces for API requests and responses.
 * These represent the contract between the frontend and the FastAPI backend.
 * 
 * TODO (Backend - FastAPI Team):
 * - Ensure all response DTOs match these interfaces exactly
 * - Add proper JSON schema validation in FastAPI using Pydantic models
 * - Document all fields, especially role field and permissions
 */

/**
 * User Role Enum
 * 
 * Roles:
 * - manager: Full company management (highest level)
 * - customerServiceSupervisor: Monitor & supervision only
 * - websiteConfigurator: Technical integration/configuration only
 * 
 * TODO (Backend - FastAPI):
 * - Strictly enforce role validation on server-side
 * - Do NOT trust role from client; decode from JWT token
 * - Implement role-to-permissions mapping server-side
 */
export type UserRole = 'manager' | 'customerServiceSupervisor' | 'websiteConfigurator';

/**
 * Role Permissions Matrix
 * 
 * Defines which permissions each role has.
 * Used for frontend UI display logic only.
 * Backend MUST independently validate permissions on all endpoints.
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  manager: [
    'manage_users',
    'manage_integrations',
    'manage_settings',
    'view_dashboard',
    'view_reports',
    'view_feedback',
  ],
  customerServiceSupervisor: [
    'view_dashboard',
    'view_reports',
    'view_feedback',
  ],
  websiteConfigurator: [
    'manage_integrations',
  ],
};

/**
 * Role Display Information
 * 
 * Color schemes and labels for UI display
 */
export const ROLE_DISPLAY = {
  manager: {
    label: 'Manager',
    color: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  customerServiceSupervisor: {
    label: 'Customer Service Supervisor',
    color: 'from-blue-600 to-indigo-700',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  websiteConfigurator: {
    label: 'Website Configurator',
    color: 'from-orange-500 to-amber-600',
    badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
};

/**
 * User Interface
 * 
 * TODO (Backend - FastAPI):
 * - Expected response fields: id, name, email, role, companyId, createdAt, updatedAt
 * - Role field should come from JWT claims
 * - companyId is NULL for superAdmin, REQUIRED for other roles
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Login Request
 * 
 * TODO (Backend - FastAPI):
 * - Expected endpoint: POST /api/v1/auth/login
 * - Accept: { email: string, password: string }
 * - No session cookies; issue tokens instead
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response
 * 
 * TODO (Backend - FastAPI):
 * - Expected endpoint response: POST /api/v1/auth/login
 * - Return: { access_token, refresh_token, user }
 * - access_token: short-lived JWT (15-30 min expiry, claims include: sub, role, companyId)
 * - refresh_token: long-lived (HTTP-only secure cookie recommended, NOT in body for production)
 * - user: full User object decoded from token
 * 
 * Note for production:
 * - Frontend will store access_token in memory (secure against XSS)
 * - Refresh token MUST be HTTP-only secure cookie (backend sets)
 * - Token refresh requested automatically before expiry via interceptor
 */
export interface LoginResponse {
  access_token: string;
  refresh_token?: string; // In production, this should be HTTP-only cookie, not in body
  user: User;
}

/** API channel types for signup (at least one required except Email which is optional) */
export type SignupApiChannel = 'facebook' | 'x' | 'email';

/**
 * Signup Request (multi-step)
 * TODO (Backend - FastAPI): POST /api/v1/auth/signup
 */
export interface SignupRequest {
  f_name: string;
  l_name: string;
  email: string;
  company: string;
  phone: string;
  password: string;
  domainId: number;
  domainLabel?: string;
  apis: { facebook: boolean; x: boolean; email: boolean };
  extraUser?: { name: string; email: string; role: UserRole };
}

/**
 * Signup Response
 * Backend sends verification email; user must verify then login.
 */
export interface SignupResponse {
  success: boolean;
  message: string;
  /** Verification token for email link (backend sends in email) */
  verificationToken?: string;
}

/**
 * Token Refresh Request
 * 
 * TODO (Backend - FastAPI):
 * - Expected endpoint: POST /api/v1/auth/refresh
 * - Accept refresh token from HTTP-only cookie or Authorization header
 * - Return new access_token and optionally new refresh_token
 */
export interface TokenRefreshRequest {
  refresh_token: string;
}

/**
 * Token Refresh Response
 * 
 * TODO (Backend - FastAPI):
 * - Return: { access_token, refresh_token?, user }
 */
export interface TokenRefreshResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

/**
 * Generic API Error Response
 * 
 * TODO (Backend - FastAPI):
 * - All error responses should follow this structure
 * - Expected endpoint: ALL
 * - Use standard HTTP status codes (400, 401, 403, 404, 500, etc.)
 */
export interface ApiErrorResponse {
  detail: string; // or message, depending on format
  status: number;
  timestamp?: string;
}

/**
 * Complaint / Feedback Domain
 * 
 * TODO (Backend - FastAPI):
 * - Define full Complaint model with: id, customerId, content, status, sentiment, emotion, priority, category, companyId, createdAt, assignedTo, resolution
 * - Sentiment enum: 'positive' | 'negative' | 'neutral'
 * - Emotion enum: varies based on business rules
 * - Status enum: 'open' | 'inProgress' | 'resolved' | 'closed'
 * - Priority enum: 'low' | 'medium' | 'high'
 */
export interface Complaint {
  id: string;
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  emotion?: string;
  status?: 'open' | 'inProgress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  companyId: string;
  createdAt: string;
  assignedTo?: string;
  resolution?: string;
}

/**
 * Company Domain
 * 
 * TODO (Backend - FastAPI):
 * - Define Company model with: id, name, domain, active, createdAt, subscriptionTier, contactEmail
 * - Multi-tenant scoping: companyAdmins can only see/manage their own company
 * - superAdmin can see all companies
 */
export interface Company {
  id: string;
  name: string;
  domain?: string;
  active: boolean;
  createdAt?: string;
  subscriptionTier?: string;
  contactEmail?: string;
}

/**
 * Pagination Metadata
 * 
 * TODO (Backend - FastAPI):
 * - Include pagination info in list endpoints
 * - Expected fields: total, page, pageSize, totalPages
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated Response Wrapper
 * 
 * TODO (Backend - FastAPI):
 * - Wrap all list endpoints with pagination
 * - Expected response: { data: T[], pagination: PaginationMeta }
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
