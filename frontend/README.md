# Complaints Frontend - Integration Guide

A React 18 + TypeScript web application for complaint management and analysis. This guide explains the structure, current state, known issues, and integration points for the backend team.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Features](#features)
5. [Setup & Running](#setup--running)
6. [Architecture](#architecture)
7. [Known Issues & Solutions](#known-issues--solutions)
8. [Mock Backend System](#mock-backend-system)
9. [Backend Integration Checklist](#backend-integration-checklist)
10. [API Endpoints Required](#api-endpoints-required)
11. [Environment Variables](#environment-variables)

---

## Project Overview

**Ara2kom AI** is a multi-role complaint management system that enables:
- **Managers**: Full dashboard access, feedback management, user management, analytics
- **Customer Service Supervisors**: Feedback viewing/filtering, analytics, limited settings
- **Website Configurators**: Platform setup, API integrations, category management
- **Customers**: Submit feedback and track their complaints

The frontend is **production-ready for demo** with mock data but requires backend integration for real data.

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI framework |
| TypeScript | Latest | Type safety |
| Vite | Latest | Build tool (fast dev server) |
| React Router | v7 | Client-side routing with RBAC |
| Tailwind CSS | Latest | Styling framework |
| ShadCN UI | Latest | Component library (Radix UI) |
| Recharts | Latest | Data visualization |
| date-fns | 3.6.0 | Date manipulation |
| React Context | Built-in | State management (Auth, Language, Theme) |

---

## Folder Structure

```
frontend/
├── index.html                 # Entry point
├── package.json              # Dependencies & scripts
├── vite.config.ts           # Vite build config
├── tsconfig.json            # TypeScript config
├── postcss.config.mjs        # Tailwind CSS config
├── .env.example             # Environment variables template
├── .env.production          # Production env vars
│
├── src/
│   ├── main.tsx             # React root (includes mock backend setup)
│   ├── vite-env.d.ts        # Vite type declarations
│   ├── styles/
│   │   └── index.css        # Global Tailwind imports
│   │
│   ├── app/
│   │   ├── App.tsx          # Root component (providers wrapper)
│   │   ├── routes.ts        # Route definitions with RBAC metadata
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Layout.tsx   # Main app layout with sidebar nav
│   │   │   ├── Sidebar.tsx  # Role-based navigation menu
│   │   │   ├── ui/          # ShadCN UI components (generated)
│   │   │   └── ...other components
│   │   │
│   │   ├── pages/           # Route-level pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FeedbackList.tsx     # Main feedback management
│   │   │   ├── FeedbackDetails.tsx
│   │   │   ├── IntegrationSettings.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── ...other pages
│   │   │
│   │   ├── contexts/        # React Context providers
│   │   │   ├── AuthContext.tsx       # User auth & session
│   │   │   ├── LanguageContext.tsx   # i18n (English/Arabic)
│   │   │   └── ThemeContext.tsx      # Dark/Light mode
│   │   │
│   │   ├── utils/           # Utility functions
│   │   │   ├── colorUtils.ts    # Sentiment/Emotion/Priority color mapping
│   │   │   └── ...helpers
│   │   │
│   │   ├── data/            # Mock data (REMOVE BEFORE PRODUCTION)
│   │   │   └── mockData.ts   # Seed data for demo mode
│   │   │
│   │   └── schema/          # React Hook Form schemas
│   │
│   ├── services/            # API service layer
│   │   ├── api.ts               # Core fetch wrapper with auth
│   │   ├── authService.ts       # Login, logout, session management
│   │   ├── mockBackend.ts       # Intercepts fetch (REMOVE BEFORE PRODUCTION)
│   │   └── ...other services
│   │
│   └── types/               # TypeScript type definitions
│       ├── api.ts           # API request/response types
│       └── ...other types
│
└── dist/                    # Build output (generated)
```

---

## Features

### ✅ Implemented Features

- **Authentication**: Login/signup with JWT tokens, session persistence
- **Role-Based Access Control**: 4 user roles with route guards
- **Feedback Management**: 
  - List, filter, search, edit feedback
  - Classify by sentiment, emotion, priority, problem type
  - Add comments and internal notes
  - Bulk edit categories
- **Analytics Dashboard**: Charts for sentiment, emotion, priority distribution
- **User Management**: Create, edit, delete users (managers only)
- **API Integrations**: Connect to external channels (managers only)
- **Category Configuration**: Manage feedback categories (website configurators)
- **Multi-Language**: English/Arabic UI (Arabic page direction auto-detected)
- **Dark Mode**: Theme toggle (light/dark)
- **Responsive Design**: Works on desktop, tablet, mobile

### ⚠️ Current State: Mock Backend

The frontend uses a **mock backend system** that intercepts all API calls and returns mock data. This allows full demo without a real backend.

**Key Mock Files:**
- `src/services/mockBackend.ts` - Intercepts fetch requests
- `src/app/data/mockData.ts` - Seed data (users, feedback, integrations)
- Mock setup called in `src/main.tsx`

---

## Setup & Running

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Development (With Mock Backend)

```bash
# Install dependencies
npm install

# Start dev server (with mock data)
npm run dev
# Runs on http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Demo Credentials (Mock Backend)

```
Manager:
  Email: manager@example.com
  Password: password123

Supervisor:
  Email: supervisor@example.com
  Password: password123

Website Configurator:
  Email: config@example.com
  Password: password123
```

---

## Architecture

### Data Flow

```
User Input
    ↓
React Components
    ↓
Services (authService, feedbackService, etc.)
    ↓
API Layer (src/services/api.ts)
    ↓
Mock Backend (intercepts) OR Real Backend (http://localhost:8000/api/v1)
    ↓
Response → Context (Auth/Language/Theme) → Re-render
```

### Context Providers (State Management)

**AuthContext** (`src/app/contexts/AuthContext.tsx`)
- Manages: User info, login/logout, JWT tokens
- Usage: `const { user, login, logout } = useAuth()`

**LanguageContext** (`src/app/contexts/LanguageContext.tsx`)
- Manages: Current language (en/ar), translation function
- Usage: `const { t, language, setLanguage } = useLanguage()`

**ThemeContext** (`src/app/contexts/ThemeContext.tsx`)
- Manages: Theme (light/dark), toggle function
- Usage: `const { theme, toggleTheme } = useTheme()`

### Role-Based Route Guards

Routes are protected by `allowedRoles` metadata in `src/app/routes.ts`. The `Layout` component checks user role before rendering child pages.

```typescript
// Example route definition:
{
  path: 'users',
  Component: UserManagement,
  allowedRoles: ['manager']  // Only managers can access
}
```

---

## Known Issues & Solutions

### 1. **Mock Backend System Must Be Removed**

**Issue**: Frontend currently intercepts ALL API requests and returns mock data. This prevents real backend integration.

**Location**: 
- `src/main.tsx` line with `setupMockBackend()`
- `src/services/mockBackend.ts` entire file
- `src/app/data/mockData.ts` entire file

**Solution**:
```bash
# Option 1: Delete files manually
rm src/services/mockBackend.ts
rm src/app/data/mockData.ts

# Option 2: Remove from main.tsx
# Delete this line:
#   import { setupMockBackend } from "./services/mockBackend";
#   setupMockBackend();
```

After removal, real backend will receive all requests.

---

### 2. **JWT Token Storage is Not Secure**

**Issue**: Access tokens stored in localStorage (XSS vulnerability).

**Current Code** (`src/services/api.ts`):
```typescript
localStorage.setItem('ara2kom-access-token', token);
```

**Solution** (Backend Recommendation):
- Use HttpOnly cookies for tokens instead of localStorage
- Or: Implement token rotation with refresh tokens
- Minimum: Backend should set `Secure` and `SameSite` flags on cookies

**What Frontend Needs from Backend**:
```
POST /api/v1/auth/login
Response Headers: Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict
```

---

### 3. **Mixed Localization Strategy**

**Issue**: Some UI strings are hardcoded in English (e.g., "service_quality"), while others use translation keys.

**Examples**:
- Category names from database display in English (should translate)
- Sentiment/Emotion/Priority labels hardcoded (OK - these are system values)

**Current Implementation** (`src/app/pages/FeedbackList.tsx`):
```typescript
const getCategoryDisplayLabel = (category: string) => {
  const normalized = normalizeCategoryKey(category);
  const categoryKey = `feedback.category_${normalized}`;
  const label = t(categoryKey);
  return label === categoryKey ? category : label;  // Fallback to original
};
```

**Solution**: Backend should return category names in both languages:
```json
{
  "id": 1,
  "name_en": "Service Quality",
  "name_ar": "جودة الخدمة",
  "slug": "service_quality"
}
```

Then frontend uses the appropriate language field:
```typescript
const displayName = language === 'ar' ? category.name_ar : category.name_en;
```

---

### 4. **Session Persistence on App Reload**

**Issue**: On page reload, user state may temporarily show as "logged out" until session restores from localStorage.

**Location**: `src/app/contexts/AuthContext.tsx`, useEffect hook

**Current**: Calls `authService.initializeAuth()` which checks localStorage

**Solution**: Backend should provide a `GET /api/v1/auth/me` endpoint:
```typescript
useEffect(() => {
  const initializeSession = async () => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${getAccessToken()}` }
      });
      const user = await response.json();
      setUser(user);
    } catch {
      clearSession();  // Token expired
    } finally {
      setIsLoading(false);
    }
  };
  
  initializeSession();
}, []);
```

**Endpoint Required**:
```
GET /api/v1/auth/me
Returns: { id, email, firstName, lastName, role, companyId }
Auth: Bearer token required
```

---

### 5. **No Proper Error Handling for Network Failures**

**Issue**: Network errors show raw error messages to users.

**Location**: All service methods in `src/services/`

**Current**: 
```typescript
catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return { success: false, error: message };
}
```

**Solution**: Implement user-friendly error messages:
```typescript
catch (error) {
  let userMessage = 'Something went wrong. Please try again.';
  
  if (error instanceof NetworkError) {
    userMessage = 'Unable to connect to server. Check your connection.';
  } else if (error instanceof ApiError) {
    userMessage = error.detail;  // From backend
  }
  
  // Show toast/snackbar to user
  showNotification(userMessage, 'error');
}
```

---

### 6. **API Response Types May Not Match**

**Issue**: Frontend API types in `src/types/api.ts` are based on backend schema assumptions. Real backend responses might differ.

**Location**: `src/types/api.ts`

**Current Type Examples**:
```typescript
export interface Feedback {
  id: number;
  text: string;
  sentiment_id?: number;
  emotion_id?: number;
  priority_id?: number;
  created_at: string;
  // ... more fields
}
```

**Solution Before Integration**:
1. Backend team exports OpenAPI/Swagger spec
2. Use `openapi-generator` or manually verify all types match
3. Update `src/types/api.ts` accordingly
4. Run tests to catch type mismatches

---

### 7. **Missing Input Validation & Sanitization**

**Issue**: User inputs are not validated before sending to backend.

**Location**: All form pages (UserManagement, CategoryManagement, etc.)

**Current**: Forms submit raw user input

**Solution**: Add validation layer:
```typescript
// Use react-hook-form with Zod schemas
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Invalid email'),
  firstName: z.string().min(2),
  role: z.enum(['manager', 'supervisor', 'configurator'])
});

type UserForm = z.infer<typeof userSchema>;

export function UserForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userSchema)
  });
  
  // Now errors automatically show validation feedback
}
```

---

### 8. **Console Logs & Debug Code**

**Issue**: Debug statements left in production code.

**Example Locations**:
- `src/app/pages/FeedbackList.tsx` - Multiple console.log statements
- Various service files

**Solution**: 
1. Remove all `console.log()`, `console.warn()`, `console.error()` calls
2. Replace with proper logging service:
```typescript
// services/logService.ts
export const logger = {
  info: (msg: string) => { /* production: do nothing */ },
  error: (msg: string, error?: Error) => { /* send to error tracking */ },
  warn: (msg: string) => { /* send to monitoring */ }
};
```

---

### 9. **RBAC Enforcement is Frontend-Only**

**Issue**: Role checks only happen in frontend. Backend doesn't validate permissions.

**Example**: `src/app/routes.ts` has `allowedRoles: ['manager']` but backend doesn't check this.

**Solution** (Critical for Production):
1. **Backend must validate roles** on every endpoint:
```python
# FastAPI example
from fastapi import Depends, HTTPException
from src.middleware.auth import get_current_user

@app.get("/api/v1/users")
async def list_users(current_user = Depends(get_current_user)):
    if current_user.role != 'manager':
        raise HTTPException(status_code=403, detail="Access denied")
    # ... return users
```

2. Frontend route guards are UX only, not security.

---

### 10. **Color Scheme & UI Inconsistencies**

**Issue**: Sentiment/Emotion/Priority color mapping inconsistent with backend.

**Current Mappings** (`src/app/utils/colorUtils.ts`):
```typescript
export const SENTIMENT_COLORS = {
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-gray-100 text-gray-800',
  negative: 'bg-red-100 text-red-800'
};
```

**Note**: These are visual only. Backend sends sentiment_id (number), frontend converts to color.

**Ensure Backend Aligns**:
```
Backend Sentiment ID → Frontend Label:
1 → positive (green)
2 → neutral (gray)
3 → negative (red)
```

---

## Mock Backend System

### How It Works

The mock backend intercepts all `fetch()` calls before they reach the real backend. Located in `src/services/mockBackend.ts`.

### Active Mock Routes

```javascript
POST /api/v1/auth/login           // Returns mock user + token
GET  /api/v1/auth/me              // Returns current mock user
GET  /api/v1/feedback             // Returns mock feedback list
POST /api/v1/feedback             // Creates mock feedback
PUT  /api/v1/feedback/:id         // Updates mock feedback
GET  /api/v1/feedback/:id         // Returns single feedback
DELETE /api/v1/feedback/:id       // Deletes mock feedback
GET  /api/v1/users                // Returns mock users
POST /api/v1/users                // Creates mock user
PUT  /api/v1/users/:id            // Updates mock user
DELETE /api/v1/users/:id          // Deletes mock user
GET  /api/v1/integrations         // Returns mock integrations
POST /api/v1/integrations         // Creates mock integration
GET  /api/v1/reports              // Returns mock analytics data
```

### Removing Mock Backend

**To switch to real backend:**

1. **Delete mock backend file**:
   ```bash
   rm src/services/mockBackend.ts
   rm src/app/data/mockData.ts
   ```

2. **Remove mock initialization in main.tsx**:
   ```tsx
   // REMOVE THESE LINES:
   // import { setupMockBackend } from "./services/mockBackend";
   // setupMockBackend();
   ```

3. **Update API base URL** in `.env`:
   ```
   VITE_API_BASE_URL=http://your-backend:8000/api/v1
   ```

4. All requests will now go to the real backend.

### Demo Data Structure

`src/app/data/mockData.ts` contains seed data used by mock backend:
- 5 mock users (different roles)
- 20 mock feedback entries
- 3 mock integrations
- Sample analytics data

---

## Backend Integration Checklist

### Phase 1: Remove Mock Backend ✓

- [ ] Delete `src/services/mockBackend.ts`
- [ ] Delete `src/app/data/mockData.ts`
- [ ] Remove `setupMockBackend()` call from `src/main.tsx`
- [ ] Verify build passes: `npm run build`

### Phase 2: Verify API Types

- [ ] Backend provides OpenAPI spec or documented endpoint schemas
- [ ] Update `src/types/api.ts` to match actual backend responses
- [ ] Run TypeScript check: `npx tsc --noEmit`

### Phase 3: Test Endpoints

- [ ] Backend team starts real backend server
- [ ] Frontend updates `.env.production` with backend URL
- [ ] Run frontend with `npm run dev`
- [ ] Test login with real credentials
- [ ] Verify each page loads feedback from backend

### Phase 4: Security Hardening

- [ ] [ ] Backend implements JWT in HttpOnly cookies (not localStorage)
- [ ] [ ] Backend validates role/permissions on all endpoints
- [ ] [ ] Backend implements rate limiting
- [ ] [ ] Backend implements CORS with whitelist
- [ ] [ ] Frontend removes all `console.log` statements

### Phase 5: Production Build

- [ ] [ ] All environment variables set correctly
- [ ] [ ] Frontend builds without errors: `npm run build`
- [ ] [ ] Test dist/ build locally: `npm run preview`
- [ ] [ ] Deploy dist/ folder to static hosting (Nginx, CloudFront, Vercel, etc.)

---

## API Endpoints Required

The backend **must** implement these endpoints for the frontend to function:

### Authentication

```
POST /api/v1/auth/login
Request: { email, password }
Response: { access_token, refresh_token, user: { id, email, role, ... } }
Status: 200 OK | 400 Bad Request | 401 Unauthorized

GET /api/v1/auth/me
Auth: Bearer <token>
Response: { id, email, firstName, lastName, role, companyId }
Status: 200 OK | 401 Unauthorized

POST /api/v1/auth/logout
Auth: Bearer <token>
Response: { message: "Logged out" }
Status: 200 OK
```

### Feedback

```
GET /api/v1/feedback
Query: ?page=1&limit=20&search=text&sentiment=1&emotion=2
Auth: Bearer <token>
Response: { items: [...], total, page, limit }

GET /api/v1/feedback/:id
Auth: Bearer <token>
Response: { id, text, sentiment_id, emotion_id, ... }

PUT /api/v1/feedback/:id
Auth: Bearer <token>
Request: { sentiment_id, emotion_id, priority_id, category_ids, ... }
Response: { id, ... updated feedback ... }

POST /api/v1/feedback/:id/comments
Auth: Bearer <token>
Request: { text, is_internal }
Response: { id, text, created_at, ... }
```

### Users

```
GET /api/v1/users
Auth: Bearer <token> (manager only)
Response: { items: [...], total }

POST /api/v1/users
Auth: Bearer <token> (manager only)
Request: { email, firstName, lastName, role }
Response: { id, ... }

PUT /api/v1/users/:id
Auth: Bearer <token> (manager only)
Request: { email, firstName, lastName, role }
Response: { id, ... updated ... }

DELETE /api/v1/users/:id
Auth: Bearer <token> (manager only)
Response: { message: "Deleted" }
```

### Integrations

```
GET /api/v1/integrations
Auth: Bearer <token>
Response: { items: [...] }

POST /api/v1/integrations
Auth: Bearer <token>
Request: { type, credentials, ... }
Response: { id, ... }

DELETE /api/v1/integrations/:id
Auth: Bearer <token>
Response: { message: "Deleted" }
```

### Reports/Analytics

```
GET /api/v1/reports/analytics
Auth: Bearer <token>
Query: ?start_date=2024-01-01&end_date=2024-12-31
Response: {
  sentiment_distribution: { positive: 45, neutral: 30, negative: 25 },
  emotion_distribution: { ... },
  priority_distribution: { ... },
  category_distribution: { ... }
}
```

For complete API specifications, backend team should provide OpenAPI/Swagger documentation.

---

## Environment Variables

### `.env.development` (for local dev with real backend)

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### `.env.production` (for deployed frontend)

```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

### `.env.example` (template)

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Other config as needed
VITE_APP_NAME=Ara2kom AI
```

---

## Common Integration Issues & Fixes

### Issue: CORS Errors

**Error**: `Access to XMLHttpRequest at 'http://backend:8000/...' from origin 'http://localhost:5173' has been blocked`

**Fix**: Backend must allow frontend origin in CORS headers:
```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: 401 Unauthorized on Logout

**Current**: Frontend clears localStorage and redirects

**Fix**: Backend should also invalidate token (optional, nice-to-have):
```python
@app.post("/api/v1/auth/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    # Optional: Add token to blacklist
    # token_blacklist.add(token)
    return {"message": "Logged out"}
```

### Issue: Feedback Updates Not Reflecting

**Check**:
1. Backend returns updated feedback object
2. Frontend updates correct state after `PUT /feedback/:id`
3. No caching issues (use `Cache-Control: no-cache` if needed)

---

## Frontend Build Output

After `npm run build`, the `dist/` folder contains:
- Static HTML/CSS/JS (ready to deploy)
- No server required (SPA)
- Can be served by any static host (Nginx, S3, CloudFront, Vercel, etc.)

```bash
dist/
├── index.html          # Single entry point
├── assets/
│   ├── index-*.js      # Main app bundle
│   ├── vendor-*.js     # Dependencies
│   └── style-*.css     # Compiled Tailwind
```

Deploy `dist/` folder. Configure web server to serve `index.html` for all routes (SPA routing).

---

## Support & Questions

**Frontend Developer?**
- Check `src/types/api.ts` for type definitions
- Check `src/services/api.ts` for HTTP handling
- Check `src/app/contexts/` for state management patterns

**Backend Developer?**
- Expected API types are in `src/types/api.ts`
- Mock data structure in `src/app/data/mockData.ts` shows expected response format
- See [API Endpoints Required](#api-endpoints-required) section

---

## Next Steps for Backend Integration

1. **Backend Setup**: Implement FastAPI/Django/Node backend with endpoints from [API Endpoints Required](#api-endpoints-required)
2. **Remove Mock**: Follow [Mock Backend System](#mock-backend-system) removal steps
3. **Type Alignment**: Verify `src/types/api.ts` matches backend responses
4. **Test**: `npm run dev` with backend running
5. **Deploy**: `npm run build` → deploy `dist/` to static host
6. **Security**: Implement JWT in HttpOnly cookies, RBAC validation on backend

---

**Last Updated**: May 2024
**Frontend Version**: React 18 + TypeScript
**Status**: Ready for Backend Integration
