import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { getAllowedRolesForPath } from '../routes';
import { useLanguage } from '../contexts/LanguageContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Component
 * 
 * Enforces:
 * 1. Authentication: User must be logged in
 * 2. Authorization: User's role must match route's allowedRoles
 * 
 * TODO (Frontend & Backend Collaboration):
 * - Frontend: Hides UI and blocks navigation if user not authorized
 * - Backend: MUST independently validate role on API endpoints
 * - Users may attempt to bypass by manipulating client state or calling APIs directly
 * - Backend must enforce RBAC on every endpoint
 * 
 * Role Validation Flow:
 * 1. User action -> Navigate to /app/route
 * 2. ProtectedRoute checks: user exists? role in allowedRoles?
 * 3. If not authorized: redirect to /login or 403 page
 * 4. On API call: Authorization header with access_token sent
 * 5. Backend: Decode JWT, verify role, enforce permissions
 * 6. Backend response: 401 (token invalid), 403 (role not allowed), or 200 (success)
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Show loading spinner while restoring session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">A2</span>
          </div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Not authenticated: redirect to login
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check role-based access control
  // Extract the second segment of the path (route name under /app)
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const routePath = pathSegments[1]; // e.g., 'feedback', 'users', 'domains'
  
  if (routePath) {
    const allowedRoles = getAllowedRolesForPath(routePath);
    
    /**
     * TODO (Logging & Monitoring):
     * - Log unauthorized access attempts for security auditing
     * - Alert if same user attempts repeated unauthorized access
     * - Backend should also log denied requests
     * 
     * console.warn(`Unauthorized access attempt: ${user.email} (${user.role}) tried to access ${routePath}`);
     */
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User's role is not allowed for this route
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isAr ? 'تم رفض الوصول' : 'Access denied'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isAr
                ? `دورك (${user.role}) لا يملك صلاحية الوصول إلى هذه الصفحة.`
                : `Your role (${user.role}) does not have permission to access this page.`}
            </p>
            <a
              href="/app"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isAr ? 'العودة إلى لوحة التحكم' : 'Return to dashboard'}
            </a>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
}
