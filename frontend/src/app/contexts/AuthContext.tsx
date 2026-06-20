import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../../services/authService';
import { UserRole } from '../../types/api';

export type { UserRole };

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
