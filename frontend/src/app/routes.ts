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
import { UserManagement } from './pages/UserManagement';
import { IntegrationSettings } from './pages/IntegrationSettings';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { NotFound } from './pages/NotFound';
import { UserRole } from './contexts/AuthContext';


type RouteWithMeta = RouteObject & {
  
   allowedRoles?: UserRole[];

  name?: string;
};

const routes = [
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
        name: 'Connected Channels',
        Component: IntegrationSettings,
        allowedRoles: ['manager', 'websiteConfigurator'],
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
