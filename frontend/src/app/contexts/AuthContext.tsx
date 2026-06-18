import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../../services/authService';
import { UserRole } from '../../types/api';

export type { UserRole };

/**
 * User Interface
 * 
 * TODO (Backend - FastAPI):
 * - Returned by login and getCurrentUser endpoints
 * - Role should be decoded from JWT on backend
 * - companyId is required for all roles except superAdmin
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * Manages authentication state and provides auth methods to the app.
 * 
 * TODO (Backend - FastAPI):
 * - On app startup, AuthProvider attempts to restore session from storage
 * - Calls getCurrentUser() to verify token is still valid
 * - If token expired or invalid, clears session
 * - Frontend will request new login
 * 
 * TODO (Frontend):
 * - Coordinate with api.ts interceptor for 401 handling
 * - On 401 response: attempt token refresh
 * - If refresh fails: clear session and redirect to /login
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize auth on component mount
   * 
   * Attempts to restore user session from storage
   */
  useEffect(() => {
    const { user: restoredUser } = authService.initializeAuth();
    if (restoredUser) {
      setUser(restoredUser);
    }
    setIsLoading(false);
  }, []);

  /**
   * Login function
   * 
   * Accepts email and password, validates via authService.
   * On success: stores tokens and user in context + storage.
   * On failure: returns error message.
   * 
   * TODO (Backend - FastAPI):
   * - Endpoint: POST /api/v1/auth/login
   * - Request: { email, password }
   * - Response: { access_token, refresh_token, user }
   * - Validate email format
   * - Use bcrypt or similar for password hashing
   * - Return 400 if credentials invalid
   * - Return 429 if rate-limited
   */
 const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    try {
    const response = await authService.login(email, password);
    setUser(response.user);
    return { success: true, role: response.user.role };  // ← pass role back
  } catch (error) {
    const message = error instanceof Error ? error.message : 'فشل تسجيل الدخول';
    return { success: false, error: message };
  }
};

  /**
   * Logout function
   * 
   * Clears user and tokens from memory and storage.
   * 
   * TODO (Backend - FastAPI):
   * - Optional: Log logout event for audit trail
   * - Tokens are stateless; no server-side cleanup needed
   * - Or implement token blacklist if needed
   */
  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * 
 * Provides access to auth context throughout the app.
 * 
 * Usage:
 * ```tsx
 * const { user, login, logout } = useAuth();
 * ```
 * 
 * Throws if used outside AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
