/**
 * API Type Definitions
 * 
 * This file defines all TypeScript interfaces for API requests and responses.
 * These represent the contract between the frontend and the FastAPI backend.
 * 
 */

/**
 * User Role Enum
 * 
 * Roles:
 * - manager: Full company management (highest level)
 * - customerServiceSupervisor: Monitor & supervision only
 * - websiteConfigurator: Technical integration/configuration only
 * 

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
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response
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
 */
export interface TokenRefreshRequest {
  refresh_token: string;
}

/**
 * Token Refresh Response
 */
export interface TokenRefreshResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

/**
 * Generic API Error Response
 * 
 */
export interface ApiErrorResponse {
  detail: string; // or message, depending on format
  status: number;
  timestamp?: string;
}

/**
 * Complaint / Feedback Domain
 * 
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
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated Response Wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
