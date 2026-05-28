# Frontend Setup & Backend Integration Guide

> **Important**: This document provides step-by-step instructions for cleaning up the project and preparing it for backend integration with the FastAPI server.

---

## 📋 Table of Contents
1. [Files to Delete](#files-to-delete)
2. [Configuration Setup](#configuration-setup)
3. [Backend Integration Checklist](#backend-integration-checklist)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Common Integration Issues & Solutions](#common-integration-issues--solutions)
6. [Development Workflow](#development-workflow)

---

## 🗑️ Files to Delete

### Priority 1: MUST DELETE (Mock Data & Development Helpers)

#### 1. **Mock Backend Interceptor**
```bash
rm src/services/mockBackend.ts
```
**Why**: Intercepts all API calls and returns mock data. Once the real backend is running, this will prevent actual API communication.

**Impact**: Any page using mock data will stop working until real API is available.

---

#### 2. **Mock Data File**
```bash
rm src/app/data/mockData.ts
```
**Why**: Contains hardcoded mock users, feedback, companies, etc. used only for frontend testing.

**What to replace it with**: Real API responses from FastAPI backend.

---

#### 3. **Remove Mock Setup Call in main.tsx**
**File**: `src/main.tsx`

**Current (lines 4-6)**:
```tsx
import { setupMockBackend } from "./services/mockBackend";

// Initialize mock backend for development/testing with mock data
setupMockBackend();
```

**Change to**:
```tsx
// Mock backend removed - using real FastAPI backend
```

**Result**:
```tsx
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

---

### Priority 2: SHOULD CLEAN UP (Optional but Recommended)

#### 4. **Remove Example Environment File**
```bash
rm .env.example
```
**Why**: Replaced by environment-specific `.env.local`, `.env.staging`, `.env.production`

**Or**: Rename for documentation:
```bash
mv .env.example ENVIRONMENT_VARIABLES.example
```

---

#### 5. **Clean Up RBAC_UPDATE.md (if outdated)**
**File**: `RBAC_UPDATE.md`
- Review if this contains outdated role/permission information
- If yes, delete or update based on final backend implementation

---

## ⚙️ Configuration Setup

### Step 1: Configure Environment Variables

**For Local Development** - Create `src/.env.local`:
```env
# Frontend runs on: http://localhost:5173
# FastAPI backend should run on: http://localhost:8000

VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**For Staging** - Create `src/.env.staging`:
```env
VITE_API_BASE_URL=https://api-staging.ara2kom.ai/api/v1
```

**For Production** - Create `src/.env.production`:
```env
VITE_API_BASE_URL=https://api.ara2kom.ai/api/v1
```

---

### Step 2: Verify API Service Configuration

**File**: `src/services/api.ts`

✅ **Already configured correctly with**:
- `BASE_URL` from environment variable: `VITE_API_BASE_URL`
- Bearer token authentication
- JSON content-type headers
- Error handling for API responses
- CORS header support (ngrok-skip-browser-warning)

**No changes needed** - Just ensure environment variables are set.

---

### Step 3: Backend CORS Configuration (FastAPI Team)

Your FastAPI backend must configure CORS to allow frontend requests:

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Local development
        "https://staging.ara2kom.ai",  # Staging
        "https://ara2kom.ai",          # Production
    ],
    allow_credentials=True,            # For HTTP-only cookies
    allow_methods=["*"],               # Allow all HTTP methods
    allow_headers=["*"],               # Allow all headers
)
```

---

## ✅ Backend Integration Checklist

### For Frontend Developer

- [ ] Delete `src/services/mockBackend.ts`
- [ ] Delete `src/app/data/mockData.ts`
- [ ] Remove `setupMockBackend()` from `src/main.tsx`
- [ ] Create `.env.local` with `VITE_API_BASE_URL=http://localhost:8000/api/v1`
- [ ] Test API connectivity with a simple endpoint (e.g., `/auth/login`)
- [ ] Verify authentication flow (login/logout)
- [ ] Test role-based access (manager, CSS, website configurator)
- [ ] Verify all pages load correctly with real data

### For Backend Developer (FastAPI Team)

- [ ] Configure CORS middleware in FastAPI app
- [ ] Implement authentication endpoints
  - `POST /auth/login` - Username/password authentication
  - `POST /auth/logout` - Logout and invalidate token
  - `GET /auth/me` - Get current user info
- [ ] Implement feedback endpoints
  - `GET /feedback` - List all feedback (with pagination)
  - `GET /feedback/{id}` - Get feedback detail
  - `POST /feedback` - Create feedback
  - `PUT /feedback/{id}` - Update feedback
  - `DELETE /feedback/{id}` - Delete feedback
- [ ] Implement user management endpoints
  - `GET /users` - List users
  - `POST /users` - Create user
  - `GET /users/{id}` - Get user detail
  - `PUT /users/{id}` - Update user
  - `DELETE /users/{id}` - Delete user
- [ ] Implement company/domain endpoints
- [ ] Return data in expected format (see below)

---

## 📡 API Endpoints Reference

### Authentication
```typescript
// Login
POST /auth/login
Request: {
  username: string;        // Email
  password: string;
}
Response: {
  access_token: string;    // JWT token
  token_type: string;      // "bearer"
}

// Get Current User
GET /auth/me
Headers: Authorization: Bearer {token}
Response: {
  user_id: number;
  f_name: string;
  l_name: string;
  email: string;
  role_id: number;         // 1=manager, 2=CSS, 3=configurator
  company_id: number;
}
```

### Feedback
```typescript
// List Feedback
GET /feedback?page=1&limit=20
Headers: Authorization: Bearer {token}
Response: {
  items: Feedback[];
  total: number;
  page: number;
  limit: number;
}

// Feedback Model
interface Feedback {
  feedback_id: number;
  company_id: number;
  api_id: number | null;
  channel_name: string;      // "Email", "Twitter", "Facebook", etc.
  category_name: string;     // Category slug
  customer_name: string;
  feedback_context: string;  // Main feedback text
  status: "open" | "inProgress" | "resolved" | "closed";
  sentiment: "positive" | "negative" | "neutral";
  sentiment_id: number;      // 0=negative, 1=neutral, 2=positive
  emotion: string;           // "disgusted", "satisfied", "frustrated", etc.
  emotion_id: number;
  problem_type: string;
  problem_type_id: number;
  priority: "low" | "medium" | "high";
  created_at: string;        // ISO 8601 datetime
  updated_at: string;
}
```

### Users
```typescript
// List Users
GET /users?company_id=1&page=1&limit=20
Headers: Authorization: Bearer {token}
Response: {
  items: User[];
  total: number;
}

// User Model
interface User {
  user_id: number;
  f_name: string;
  l_name: string;
  email: string;
  role_id: number;
  company_id: number;
  is_active: boolean;
  created_at: string;
}
```

---

## 🔧 Common Integration Issues & Solutions

### Issue 1: CORS Error
```
Access to XMLHttpRequest at 'http://localhost:8000/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution**: 
Backend must configure CORS middleware (see Step 3 above)

---

### Issue 2: "Invalid Token" Error
```
401 Unauthorized: Invalid or expired token
```

**Solution**:
- Ensure token is sent in Authorization header: `Authorization: Bearer {token}`
- Verify token format and expiration on backend
- Check if token is being stored correctly in localStorage as `ara2kom-access-token`

---

### Issue 3: Unexpected Response Format
Pages display empty data or "undefined" errors

**Solution**:
1. Check API response structure matches expected format above
2. Verify field names match exactly (snake_case for backend)
3. Use browser DevTools Network tab to inspect actual response
4. Check console for error messages

**Frontend expects snake_case from API**:
```
✅ Correct: user_id, f_name, l_name
❌ Wrong: userId, firstName, lastName
```

---

### Issue 4: Authentication Loop
User keeps getting redirected to login page

**Possible causes**:
1. Token not being saved to localStorage correctly
2. `GET /auth/me` endpoint returning wrong format or 401
3. Token expiration not being handled properly
4. Check `src/services/authService.ts` for token storage logic

---

## 🚀 Development Workflow

### Starting Local Development

```bash
# Terminal 1: Start FastAPI Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Frontend Dev Server
cd frontend
npm install
npm run dev

# Frontend will be at: http://localhost:5173
# Backend will be at: http://localhost:8000
# API endpoints: http://localhost:8000/api/v1/*
```

---

### Testing API Calls

**Using curl** (in Terminal):
```bash
# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager@ara2kom.ai", "password":"password123"}'

# Expected response:
# {"access_token": "eyJ0eXAi...", "token_type": "bearer"}
```

**Using browser DevTools** (Network tab):
1. Open http://localhost:5173 in browser
2. Open DevTools → Network tab
3. Perform actions (login, load feedback, etc.)
4. Click requests to see:
   - Headers (Authorization token)
   - Request payload
   - Response data

---

### Debugging API Issues

**Enable API Logging** in `src/services/api.ts`:

```typescript
// Add this at the start of the request function:
console.log(`[API] ${method} ${url}`, { params, body: options.body });

// Add this before returning:
console.log(`[API Response] ${status}`, data);
```

---

## 📁 Final Project Structure After Cleanup

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/      # UI Components (Layout, Sidebar, TopBar, etc.)
│   │   ├── contexts/        # Auth, Theme, Language contexts
│   │   ├── pages/           # All page components
│   │   ├── App.tsx
│   │   └── routes.ts
│   │
│   ├── services/
│   │   ├── api.ts           # ✅ API request handler (no changes)
│   │   ├── authService.ts   # ✅ Authentication logic
│   │   ├── contactService.ts
│   │   └── ...other services
│   │
│   ├── styles/              # CSS files
│   ├── types/               # TypeScript types
│   └── main.tsx             # ✅ Cleaned (no mock backend)
│
├── .env.local               # ✅ Local environment variables
├── .env.staging             # ✅ Staging variables
├── .env.production          # ✅ Production variables
│
├── vite.config.ts           # ✅ Vite config (no changes)
├── tsconfig.json            # ✅ TypeScript config
├── package.json             # ✅ Dependencies
└── README.md                # Project documentation
```

---

## ✨ Quick Reference: What Changed

| File | Before | After |
|------|--------|-------|
| `src/services/mockBackend.ts` | Existed (interceptor) | ❌ DELETED |
| `src/app/data/mockData.ts` | Contained mock data | ❌ DELETED |
| `src/main.tsx` | Called `setupMockBackend()` | ✅ Removed call |
| `src/services/api.ts` | Already correct | ✅ No changes |
| `.env.local` | Didn't exist | ✅ Created |
| API responses | Mock data | ✅ Real data from FastAPI |

---

## 🆘 Need Help?

**Frontend Integration Issues**:
- Check browser Console for error messages
- Check Network tab to see API requests/responses
- Verify `.env.local` is configured correctly
- Ensure backend is running on port 8000

**Backend Integration Issues**:
- Ensure CORS is configured in FastAPI
- Verify endpoint paths match expected format
- Check response format matches TypeScript interfaces
- Use Postman/curl to test backend endpoints independently

**Questions**:
- See `API Endpoints Reference` section above
- Check `src/services/authService.ts` for current implementation
- Review `src/app/pages/` to see how pages consume API

---

## 📝 Deployment Checklist

Before deploying to staging/production:

- [ ] Remove all `console.log()` statements or set to `process.env.DEBUG`
- [ ] Set correct `VITE_API_BASE_URL` for each environment
- [ ] Test login flow end-to-end
- [ ] Test all role-based access (manager, CSS, configurator)
- [ ] Test feedback pagination and filtering
- [ ] Test error handling (network errors, 401, 500)
- [ ] Run `npm run build` successfully
- [ ] Test built version locally: `npm run preview`

---

**Last Updated**: May 28, 2026
**Status**: Ready for Backend Integration ✅
