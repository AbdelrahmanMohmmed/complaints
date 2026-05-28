# Frontend Architecture - Ara2kom AI

## 📐 Overview

The **Ara2kom AI** frontend is a role-based multi-tenant complaints/feedback management system built with modern React technologies.

### Tech Stack
- **Framework**: React 18 + React Router v7
- **Styling**: Tailwind CSS + Radix UI components
- **Build Tool**: Vite
- **State Management**: React Context (Auth, Language, Theme)
- **API Communication**: Custom `request()` function in `api.ts`
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

---

## 🗂️ Folder Structure

```
src/
├── app/                          # Main application
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Authentication state & methods
│   │   ├── ThemeContext.tsx      # Theme switching (light/dark)
│   │   └── LanguageContext.tsx   # Multi-language support (AR/EN)
│   ├── components/
│   │   ├── Layout.tsx            # Main app layout wrapper
│   │   ├── Sidebar.tsx           # Role-based navigation
│   │   ├── TopBar.tsx            # Top navigation bar
│   │   ├── ProtectedRoute.tsx    # Auth & RBAC enforcement
│   │   ├── LoadingSpinner.tsx    # Loading state
│   │   ├── WelcomeBanner.tsx     # Welcome message
│   │   ├── figma/                # Figma component wrappers
│   │   └── ui/                   # Radix UI component library
│   ├── pages/
│   │   ├── Dashboard.tsx         # Main dashboard (role-specific logic)
│   │   ├── FeedbackList.tsx      # All feedback view
│   │   ├── FeedbackDetails.tsx   # Single feedback detail page
│   │   ├── MyFeedback.tsx        # Agent personal feedback
│   │   ├── AgentProfile.tsx      # Agent profile management
│   │   ├── CategoryManagement.tsx
│   │   ├── CompanyManagement.tsx
│   │   ├── DomainManagement.tsx
│   │   ├── UserManagement.tsx
│   │   ├── IntegrationSettings.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   ├── SystemLogs.tsx (implied - referenced in routes)
│   │   ├── TeamPerformance.tsx
│   │   ├── LandingPage.tsx
│   │   ├── SignInPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── VerifyEmail.tsx
│   │   ├── VerifyEmailSent.tsx
│   │   ├── NotFound.tsx
│   │   └── dashboards/
│   │       └── CompanyManagerDashboard.tsx  # Shared dashboard for manager/companyAdmin
│   ├── routes.ts                 # Route definitions + RBAC config
│   └── App.tsx                   # Provider setup & app root
├── services/
│   ├── api.ts                    # Base HTTP layer + error handling
│   ├── authService.ts            # Auth flows (login, signup, logout, refresh)
│   ├── analyticsService.ts       # Analytics API calls
│   ├── contactService.ts         # Contact/support API calls
│   ├── domainService.ts          # Domain management API calls
│   ├── mockBackend.ts            # Mock API implementation
│   └── mockData.ts               # Mock data for development
├── types/
│   └── api.ts                    # TypeScript interfaces for all API contracts
├── styles/
│   ├── index.css
│   ├── tailwind.css
│   ├── theme.css
│   └── fonts.css
└── main.tsx                      # React DOM entry point
```

---

## 🎭 Role-Based Access Control (RBAC)

Your system has **4 user roles** with hierarchical permissions:

### Role Hierarchy & Permissions

| Role | Level | Access | Purpose |
|------|-------|--------|---------|
| **superAdmin** | 🔴 Highest | System management (domains, companies, system logs, all users) | Platform owner - oversee entire system |
| **companyAdmin** | 🟠 High | Company settings (users, categories, integrations, reports) | Manage single company |
| **manager** | 🟡 Medium | Feedback oversight & team reports | Monitor team performance & feedback |
| **websiteConfigurator** | 🟢 Low | Personal feedback only + profile | Website agent - submit & track own feedback |

### Route Protection Pattern

Routes are defined in `routes.ts` with role-based access:

```typescript
{
  path: 'companies',
  name: 'إدارة الشركات',
  Component: CompanyManagement,
  allowedRoles: ['superAdmin'],  // ← Only superAdmin
}
```

---

## 🔐 Authentication Flow

### 1. Initial Load - Session Restoration
```
App Mount
  ↓
AuthProvider useEffect (tries to restore session)
  ↓
authService.initializeAuth()
  ↓
Reads: ara2kom-access-token, ara2kom-user from localStorage
  ↓
If tokens exist → setUser() and render app
If tokens missing → render /sign-in
```

### 2. Login Flow
```
SignInPage → User enters email/password
  ↓
useAuth().login(email, password)
  ↓
authService.login() → POST /api/v1/auth/login
  ↓
Backend returns: { access_token, refresh_token, user }
  ↓
Stored in: localStorage + context
  ↓
Redirect to: /app (Dashboard)
```

### 3. Protected Route Check
```
User navigates to /app/companies
  ↓
ProtectedRoute component checks:
  - Is user logged in? (context.user exists)
  - Does user's role match allowedRoles?
  ↓
If unauthorized → Show error OR redirect to /sign-in
If authorized → Render component
```

### 4. API Request with Auth
```
Component calls: request('/feedback', { method: 'GET' })
  ↓
request() function:
  - Gets access_token from localStorage
  - Adds to header: Authorization: Bearer {token}
  - Sends request
  ↓
If response 401 (unauthorized):
  - Clear tokens
  - Redirect to /login
If response 200 (success):
  - Return data
```

---

## 🌍 Multi-Language Support

The app supports **Arabic (ar)** and **English (en)**.

### Language Context Usage

```typescript
const { language, toggleLanguage, t } = useLanguage();

// Get translated string
const label = t('nav.dashboard');  // Returns "Dashboard" or "لوحة التحكم"

// Toggle between languages
toggleLanguage();  // Switches between ar ↔ en

// Check current language
const isArabic = language === 'ar';
const isEnglish = language === 'en';
```

### Translation Keys Structure

Translations organized by section:
- `nav.*` - Navigation items
- `common.*` - Common UI labels
- `dashboard.*` - Dashboard-specific
- `feedback.*` - Feedback management
- `auth.*` - Authentication pages

**⚠️ Issue**: Only partial translations defined. Missing keys return raw key string.

---

## 🎨 Theme Support

Themes managed in `ThemeContext.tsx`:

```typescript
const { theme, toggleTheme } = useTheme();

// theme = 'light' | 'dark'
// toggleTheme() switches and persists to localStorage
```

Applied to `<html>` element:
```html
<html class="light">  <!-- or class="dark" -->
```

---

## 📊 Data Flow & API Integration

### Current Data Fetching Patterns

#### Pattern 1: Direct API Calls
```typescript
// In components
const data = await request<T>('/feedback', { method: 'GET' });
```

#### Pattern 2: Service Layer
```typescript
// In authService.ts, analyticsService.ts, etc.
export async function login(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
```

#### Pattern 3: Mock Data (Development)
```typescript
// ❌ FeedbackList.tsx currently uses MOCK
import { mockFeedback, mockUsers } from '../data/mockData';
// TODO: Replace with real API calls
```

---

## ⚠️ 10 Key Issues & Confusing Areas

### 1. 🔐 **CRITICAL: Insecure Token Storage**

**Current Implementation**:
```typescript
// api.ts
localStorage.getItem('ara2kom-access-token')
localStorage.setItem('ara2kom-access-token', token)
```

**Problems**:
- ❌ Tokens stored in localStorage (vulnerable to XSS attacks)
- ❌ Refresh token in response body (should be HTTP-only cookie)
- ❌ No automatic token refresh mechanism

**What Needs To Change**:
```typescript
// ✅ Store access_token in memory
let accessToken: string | null = null;

// ✅ Refresh token should be HTTP-only cookie (backend sets)
// Frontend never touches it directly
```

**Recommendation**: 
- Move access token to memory/closure
- Use HTTP-only secure cookies for refresh token (backend managed)
- Implement automatic refresh before expiry

---

### 2. 🚨 **RBAC Only Client-Side**

**Problem**:
```typescript
// ProtectedRoute.tsx - Frontend check only
if (!allowedRoles.includes(user.role)) {
  return <div>Access denied</div>;  // ← Just shows message, doesn't prevent API access
}
```

**Risk**:
- User can modify `user.role` in DevTools
- Can call API endpoints directly via curl/Postman
- Frontend role check is easily bypassed

**What MUST Happen**:
- ✅ Frontend: Hide UI and show access denied
- ✅ **Backend: Independently verify role on EVERY endpoint**
  - Decode JWT token
  - Extract role from token claims
  - Verify against endpoint requirements
  - Return 403 Forbidden if unauthorized

**Current Gap**: No mention of backend role validation in code.

---

### 3. 📊 **Mock vs Real Data - Inconsistent**

**Problem**:
```typescript
// FeedbackList.tsx
// NOTE: This page currently reads feedback from MOCK sources
// TODO: Replace mockFeedback with real API calls

// CompanyManagerDashboard.tsx - Uses real API
const response = await request<DashboardStats>('/dashboard/stats/...', { ... });
```

**Confusion**:
- No clear pattern for which pages use mock vs real
- No migration guide
- mockBackend.ts and mockData.ts - purpose unclear

**What Needs Standardization**:
1. Mark all mock-using pages with clear TODO comments
2. Create migration checklist
3. Decide: Delete mock files once all APIs integrated

---

### 4. 🔄 **Dashboard Routing Confusion**

**Current Logic**:
```typescript
// Dashboard.tsx
if (user?.role === 'websiteConfigurator') {
  return <Navigate to="/app/my-feedback" replace />;  // ← Why redirect agents?
}

// Uses same dashboard for both roles
{user?.role === 'companyAdmin' && <CompanyAdminDashboard />}
{user?.role === 'manager' && <CompanyAdminDashboard />}
```

**Questions**:
- Why do agents (websiteConfigurator) not get a dashboard?
- Why do manager & companyAdmin use the same component?
- Is there a superAdmin dashboard? (Not visible)
- What's the intended user experience difference?

**Suggested Fix**: Create role-specific dashboard components

```typescript
// Dashboard.tsx
export function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'superAdmin') {
    return <SuperAdminDashboard />;
  }
  if (user?.role === 'companyAdmin') {
    return <CompanyAdminDashboard />;
  }
  if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }
  if (user?.role === 'websiteConfigurator') {
    return <Navigate to="/app/my-feedback" replace />;
  }
}
```

---

### 5. 🔀 **Inconsistent Type Definitions**

**Problem**: Same data defined differently in multiple places

```typescript
// ❌ AuthContext.tsx - User without timestamps
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

// ❌ api.ts types - User with timestamps
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ❌ FeedbackList.tsx - Different naming convention (snake_case)
interface BackendFeedback {
  feedback_id: number;
  company_id: number;
  channel_name?: string | null;
  customer_name: string | null;
}
```

**Issues**:
- No single source of truth
- Naming inconsistency (camelCase vs snake_case)
- No data transformation layer

**Solution**:
```typescript
// types/api.ts - Single source of truth
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

export interface BackendFeedback {
  feedback_id: number;
  company_id: number;
  // ... snake_case from backend
}

// Transformation function
export function transformBackendFeedback(data: BackendFeedback): FrontendFeedback {
  return {
    feedbackId: data.feedback_id,
    companyId: data.company_id,
    // ... convert to camelCase
  };
}
```

---

### 6. 🌍 **Incomplete Language System**

**Problem**:
```typescript
// LanguageContext.tsx
const translations = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.feedback': 'Feedback',
    // Many keys missing!
  },
  ar: { /* same */ }
}
```

**Issues**:
- Only ~50% of UI strings translated
- No fallback mechanism
- Missing keys return raw key string
- No way to generate translation audit

**Current Behavior**:
```typescript
t('missing.key')  // Returns 'missing.key' ❌ (confusing in UI)
```

**Solution**:
```typescript
function t(key: string): string {
  const translation = translations[language]?.[key];
  if (!translation) {
    console.warn(`Missing translation: ${key}`);
    return translations['en'][key] || key;  // ✅ Fallback to English
  }
  return translation;
}
```

---

### 7. 🔗 **API Service Architecture Issues**

**Problem 1: No Token Refresh**
```typescript
// api.ts
if (response.status === 401) {
  localStorage.removeItem('ara2kom-access-token');
  window.location.href = '/login';  // ← Force logout
}
```

**Should be**:
```typescript
if (response.status === 401) {
  // Attempt refresh
  const newToken = await refreshAccessToken();
  if (newToken) {
    // Retry request
    return request(endpoint, options);
  } else {
    // Actually logout
    logout();
    window.location.href = '/login';
  }
}
```

**Problem 2: Hardcoded Error Parsing**
```typescript
// api.ts - Assumes Pydantic 422 structure
if (Array.isArray(errorData.detail)) {
  message = errorData.detail
    .map((e: any) => e.msg || '')
    .join(' • ');
}
```

Only works if backend uses Pydantic. Breaks if backend changes error format.

---

### 8. 📁 **Unclear Service Organization**

**Files Present**:
```
services/
├── api.ts                 ✅ Base HTTP layer
├── authService.ts         ✅ Auth flows
├── analyticsService.ts    ❓ Used where?
├── contactService.ts      ❓ Used where?
├── domainService.ts       ❓ Used where?
├── mockBackend.ts         ❓ Replaces api.ts or wraps it?
└── mockData.ts            ❓ Different from mockBackend.ts?
```

**Questions**:
- Are analyticsService, contactService, domainService implemented or stubs?
- Should unused services be deleted?
- What's the pattern for creating new services?

**Recommendation**:
```
services/
├── base/
│   └── api.ts             # Base HTTP client
├── auth/
│   └── authService.ts     # Auth flows
├── feedback/
│   └── feedbackService.ts # Feedback API calls
├── analytics/
│   └── analyticsService.ts
├── admin/
│   ├── companyService.ts
│   ├── domainService.ts
│   └── userService.ts
└── mocks/
    ├── mockBackend.ts
    └── mockData.ts
```

---

### 9. 🛡️ **Protected Route Path Extraction - Fragile**

**Problem**:
```typescript
// ProtectedRoute.tsx
const pathSegments = location.pathname.split('/').filter(Boolean);
const routePath = pathSegments[1];  // ← Assumes: [0]='app', [1]='routeName'
```

**Breaks For**:
```
/app/users/123
  pathSegments = ['app', 'users', '123']
  routePath = 'users'  ✅ Works

/app/users/123/edit
  pathSegments = ['app', 'users', '123', 'edit']
  routePath = 'users'  ✅ Works

/app/feedback/123/notes/456  (nested-nested)
  pathSegments = ['app', 'feedback', '123', 'notes', '456']
  routePath = 'feedback'  ✅ Works
```

**Unknown**: How does `getAllowedRolesForPath()` map 'users' → allowed roles?

**Recommendation**: Use React Router's `useMatches()` to get route metadata

```typescript
const matches = useMatches();
const currentRoute = matches[matches.length - 1];
const allowedRoles = currentRoute.handle?.allowedRoles;
```

---

### 10. 🎨 **Sidebar/Navigation - Role Logic Complexity**

**Problem**:
```typescript
// Sidebar.tsx
const navigationByRole: Record<string, NavSection[]> = {
  superAdmin: [ /* many items */ ],
  companyAdmin: [ /* fewer items */ ],
  manager: [ /* different items */ ],
  websiteConfigurator: [ /* minimal items */ ],
};
```

**Concerns**:
- Is this the single source of truth?
- Duplicates allowedRoles from routes.ts?
- What if sidebar shows route but ProtectedRoute blocks it?

**Better Approach**:
```typescript
// Derive sidebar from routes.ts, not duplicate
// routes.tsx
export const routes = [
  {
    path: 'companies',
    Component: CompanyManagement,
    allowedRoles: ['superAdmin'],
    metadata: {
      sidebar: { label: 'Companies', icon: Building2 }
    }
  },
  // ...
];

// Sidebar.tsx - Generate from routes
const sidebarItems = routes.filter(
  r => !r.metadata?.hideFromSidebar && r.metadata?.allowedRoles?.includes(user?.role)
).map(r => ({ label: r.metadata.label, href: r.path }));
```

---

## 📋 API Endpoints Expected

Based on code, these endpoints should exist:

### Authentication
```
POST   /api/v1/auth/login
POST   /api/v1/auth/signup
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
GET    /api/v1/auth/current-user
```

### Feedback
```
GET    /api/v1/feedback
GET    /api/v1/feedback/:id
POST   /api/v1/feedback
PUT    /api/v1/feedback/:id
DELETE /api/v1/feedback/:id
GET    /api/v1/feedback/:id/notes
POST   /api/v1/feedback/:id/notes
```

### Dashboard
```
GET    /api/v1/dashboard/stats
GET    /api/v1/dashboard/stats/summary
```

### Users
```
GET    /api/v1/users
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Company/Admin
```
GET    /api/v1/companies
POST   /api/v1/companies
GET    /api/v1/domains
GET    /api/v1/categories
POST   /api/v1/categories
```

---

## 🚀 Development Workflow

### Running the App

```bash
# Install dependencies
npm install

# Development server
npm run dev
# Runs on http://localhost:5173

# Production build
npm run build

# Build output in dist/
```

### Environment Variables

Create `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## ✅ Recommended Next Steps

1. **Security Fixes** (HIGH PRIORITY)
   - [ ] Move access token from localStorage to memory
   - [ ] Implement HTTP-only cookie refresh token
   - [ ] Add automatic token refresh before expiry
   - [ ] Ensure backend validates roles on all endpoints

2. **Data Consistency** (MEDIUM PRIORITY)
   - [ ] Create single source of truth for all types in `types/api.ts`
   - [ ] Add data transformation functions for snake_case → camelCase
   - [ ] Replace all mock data with real API calls
   - [ ] Delete mock files once migration complete

3. **Error Handling** (MEDIUM PRIORITY)
   - [ ] Implement proper error type detection
   - [ ] Add retry logic with exponential backoff
   - [ ] Create custom error boundary component
   - [ ] Log errors for debugging

4. **Code Organization** (LOW PRIORITY)
   - [ ] Reorganize services into logical folders
   - [ ] Delete unused service files
   - [ ] Complete language translations
   - [ ] Add translation key audit tool

5. **Dashboard Consolidation** (LOW PRIORITY)
   - [ ] Create role-specific dashboard components
   - [ ] Document why websiteConfigurator redirects
   - [ ] Consolidate duplicate dashboard logic

---

## 📚 File Reference Guide

| File | Purpose | Key Exports |
|------|---------|------------|
| `App.tsx` | Root component, provider setup | `App` |
| `routes.ts` | Route definitions, RBAC config | `router`, `RouteWithMeta`, `getAllowedRolesForPath()` |
| `contexts/AuthContext.tsx` | Auth state & methods | `AuthProvider`, `useAuth()`, `User` |
| `contexts/ThemeContext.tsx` | Theme toggle | `ThemeProvider`, `useTheme()` |
| `contexts/LanguageContext.tsx` | Multi-language support | `LanguageProvider`, `useLanguage()` |
| `components/ProtectedRoute.tsx` | Auth & RBAC enforcement | `ProtectedRoute` |
| `services/api.ts` | HTTP client, error handling | `request()`, `ApiError` |
| `services/authService.ts` | Auth flows | `login()`, `logout()`, `signup()` |
| `types/api.ts` | API type definitions | All interfaces |

---

## 🔗 Related Documentation

- [Backend API Documentation](../backend/README.md)
- [Project Structure](../PROJECT_STRUCTURE.md)
- [User Roles Guide](../USER_ROLES.md)

---

**Last Updated**: May 27, 2026  
**Frontend Version**: 0.0.1  
**Built With**: React 18 + Vite
