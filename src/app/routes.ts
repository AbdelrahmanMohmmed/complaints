import { createBrowserRouter, RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyEmailSent } from './pages/VerifyEmailSent';
import { VerifyEmail } from './pages/VerifyEmail';
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
import { SystemLogs } from './pages/SystemLogs';
import { SystemAnalytics } from './pages/SystemAnalytics';
import { TeamPerformance } from './pages/TeamPerformance';
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
  { path: '/login', name: 'Login', Component: LoginPage },
  { path: '/signup', name: 'Signup', Component: SignupPage },
  { path: '/verify-email/sent', name: 'Verify Email Sent', Component: VerifyEmailSent },
  { path: '/verify-email', name: 'Verify Email', Component: VerifyEmail },

  // Protected app routes
  // TODO (Backend - FastAPI):
  // - All routes under /app require valid access_token in Authorization header
  // - Backend should validate token signature and expiry
  // - Decode role from JWT; enforce against allowedRoles
  // - Return 401 if token invalid/expired
  // - Return 403 if role not in allowedRoles
  {
    path: '/app',
    name: 'App Layout',
    Component: Layout,
    children: [
      {
        index: true,
        name: 'Dashboard',
        Component: Dashboard,
        /**
         * Dashboard accessible by all authenticated roles
         * Each role sees different dashboard variant (handled by page component)
         */
        allowedRoles: ['superAdmin', 'companyAdmin', 'manager', 'agent'],
      },

      /**
       * ========== FEEDBACK / COMPLAINTS ==========
       * Accessible by: superAdmin, companyAdmin, manager
       * agent: only sees assigned feedback via /my-feedback
       */
      {
        path: 'feedback',
        name: 'Feedback List',
        Component: FeedbackList,
        allowedRoles: ['superAdmin', 'companyAdmin', 'manager'],
      },
      {
        path: 'feedback/:id',
        name: 'Feedback Details',
        Component: FeedbackDetails,
        allowedRoles: ['superAdmin', 'companyAdmin', 'manager'],
      },

      /**
       * ========== AGENT-SPECIFIC ROUTES ==========
       */
      {
        path: 'my-feedback',
        name: 'My Feedback',
        Component: MyFeedback,
        allowedRoles: ['agent'],
      },
      {
        path: 'profile',
        name: 'Agent Profile',
        Component: AgentProfile,
        allowedRoles: ['agent'],
      },

      /**
       * ========== REPORTS & ANALYTICS ==========
       * Dashboard & reports: manager, companyAdmin, superAdmin
       */
      {
        path: 'reports',
        name: 'Reports',
        Component: Reports,
        allowedRoles: ['superAdmin', 'companyAdmin', 'manager'],
      },
      {
        path: 'team-performance',
        name: 'Team Performance',
        Component: TeamPerformance,
        allowedRoles: ['superAdmin', 'companyAdmin', 'manager'],
      },

      /**
       * ========== SUPER ADMIN ONLY ==========
       * System-wide management: domains, companies, system analytics, logs
       */
      {
        path: 'domains',
        name: 'Domain Management',
        Component: DomainManagement,
        allowedRoles: ['superAdmin'],
      },
      {
        path: 'companies',
        name: 'Company Management',
        Component: CompanyManagement,
        allowedRoles: ['superAdmin'],
      },
      {
        path: 'system-analytics',
        name: 'System Analytics',
        Component: SystemAnalytics,
        allowedRoles: ['superAdmin'],
      },
      {
        path: 'logs',
        name: 'System Logs',
        Component: SystemLogs,
        allowedRoles: ['superAdmin'],
      },

      /**
       * ========== COMPANY ADMIN ONLY ==========
       * Company-specific settings: integrations, categories, user management
       */
      {
        path: 'integrations',
        name: 'Integration Settings',
        Component: IntegrationSettings,
        allowedRoles: ['companyAdmin'],
      },
      {
        path: 'categories',
        name: 'Category Management',
        Component: CategoryManagement,
        allowedRoles: ['companyAdmin'],
      },
      {
        path: 'users',
        name: 'User Management',
        Component: UserManagement,
        allowedRoles: ['superAdmin', 'companyAdmin'],
      },

      /**
       * ========== SHARED ROUTES ==========
       * Settings accessible by all roles
       */
      {
        path: 'settings',
        name: 'Settings',
        Component: Settings,
        allowedRoles: ['superAdmin', 'companyAdmin', 'manager', 'agent'],
      },
    ],
  },

  // Catch-all 404
  { path: '*', name: 'Not Found', Component: NotFound },
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
