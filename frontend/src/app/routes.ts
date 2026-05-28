import { createBrowserRouter, RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyEmailSent } from './pages/VerifyEmailSent';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { Dashboard } from './pages/Dashboard';
import { FeedbackList } from './pages/FeedbackList';
import { FeedbackDetails } from './pages/FeedbackDetails';
import { DomainManagement } from './pages/DomainManagement';
import { CompanyManagement } from './pages/CompanyManagement';
import { UserManagement } from './pages/UserManagement';
import { IntegrationSettings } from './pages/IntegrationSettings';
import { CategoryManagement } from './pages/CategoryManagement';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { MyFeedback } from './pages/MyFeedback';
// import { SystemLogs } from './pages/SystemLogs';
// import { SystemAnalytics } from './pages/SystemAnalytics';
// import { TeamPerformance } from './pages/TeamPerformance';
import { AgentProfile } from './pages/AgentProfile';
import { NotFound } from './pages/NotFound';
import { UserRole } from './contexts/AuthContext';

/**
 * Route metadata for RBAC.
 *
 * NOTE:
 * - This extends the core react-router `RouteObject` shape with optional
 *   RBAC-related properties used only on the client.
 * - The router itself still only cares about the standard `RouteObject` fields.
 */
type RouteWithMeta = RouteObject & {
  /**
   * Roles allowed to access this route
   * If undefined or empty, route is public or special (Layout role-gating)
   * 
   * TODO (Backend - FastAPI):
   * - Decode role from JWT
   * - Check against route-specific permissions
   * - Return 403 Forbidden if not allowed
   */
  allowedRoles?: UserRole[];
  /**
   * Human-readable route name (for debugging/logging)
   */
  name?: string;
};

const routes = [
  // Public routes (no auth required)
  { path: '/', name: 'Landing', Component: LandingPage },
  { path: '/sign-in', name: 'Sign In', Component: SignInPage },
  { path: '/signup', name: 'Signup', Component: SignupPage },
  { path: '/forgot-password', name: 'نسيت كلمة المرور', Component: ForgotPasswordPage },
  { path: '/reset-password', name: 'إعادة تعيين كلمة المرور', Component: ResetPasswordPage },
  { path: '/verify-email/sent', name: 'تم إرسال التحقق من البريد الإلكتروني', Component: VerifyEmailSent },
  { path: '/verify-email', name: 'التحقق من البريد الإلكتروني', Component: VerifyEmail },

  {
    path: '/app',
    name: 'تخطيط التطبيق',
    Component: Layout,
    children: [
      {
        index: true,
        name: 'Dashboard',
        Component: Dashboard,
        allowedRoles: ['manager', 'customerServiceSupervisor'],
      },

      /**
       * ========== MANAGER & SUPERVISOR ROUTES ==========
       * Feedback and reports accessible to both
       */
      {
        path: 'feedback',
        name: 'قائمة التعليقات',
        Component: FeedbackList,
        allowedRoles: ['manager', 'customerServiceSupervisor'],
      },
      {
        path: 'feedback/:id',
        name: 'تفاصيل التعليقات',
        Component: FeedbackDetails,
        allowedRoles: ['manager', 'customerServiceSupervisor'],
      },

      /**
       * ========== REPORTS & ANALYTICS ==========
       * Accessible by manager and supervisor
       */
      {
        path: 'reports',
        name: 'Reports',
        Component: Reports,
        allowedRoles: ['manager', 'customerServiceSupervisor'],
      },
      /**
       * ========== MANAGER ONLY ==========
       * Full company management: users, categories, settings
       */
      {
        path: 'users',
        name: 'إدارة المستخدمين',
        Component: UserManagement,
        allowedRoles: ['manager'],
      },
      {
        path: 'categories',
        name: 'إدارة التصنيفات',
        Component: CategoryManagement,
        allowedRoles: ['manager'],
      },
      {
        path: 'settings',
        name: 'Settings',
        Component: Settings,
        allowedRoles: ['manager', 'customerServiceSupervisor', 'websiteConfigurator'],
      },

      /**
       * ========== WEBSITE CONFIGURATOR ONLY ==========
       * Integration and API configuration
       */
      {
        path: 'integrations',
        name: 'إعدادات التكامل',
        Component: IntegrationSettings,
        allowedRoles: ['websiteConfigurator'],
      },
    ],
  },

  // Catch-all 404
  { path: '*', name: 'غير موجود', Component: NotFound },
] as unknown as RouteWithMeta[];

export const router = createBrowserRouter(
  routes as unknown as RouteObject[]
) as unknown as ReturnType<typeof createBrowserRouter> & {
  _definingPlugin: undefined;
};

/**
 * Helper to extract allowed roles from a route path
 * 
 * Used by ProtectedRoute to check if current user's role is allowed
 * 
 * TODO (Frontend - Enhancement):
 * - This is a client-side hint only
 * - Backend must independently validate permissions
 * - Never trust client-side role checks for authorization decisions
 */
export function getAllowedRolesForPath(path: string): UserRole[] | undefined {
  const appRoute = router.routes.find((r) => r.path === '/app');
  if (!appRoute?.children) return undefined;

  // Search depth-first for matching route
  const findInChildren = (
    children: RouteWithMeta[],
    targetPath: string
  ): UserRole[] | undefined => {
    for (const child of children) {
      if (child.path === targetPath) {
        return child.allowedRoles;
      }
      if (child.children) {
        const result = findInChildren(child.children as RouteWithMeta[], targetPath);
        if (result) return result;
      }
    }
    return undefined;
  };

  return findInChildren(appRoute.children, path);
}
