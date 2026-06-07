# Project Structure

## Overview
Complete full-stack complaints/feedback management system with React + FastAPI.

---

## Frontend Structure

```
frontend/
├── public/
│   └── [static assets]
├── src/
│   ├── main.tsx                          # React entry point
│   ├── api.js                            # Legacy API file (consider moving to services/)
│   │
│   ├── app/
│   │   ├── App.tsx                       # Root component (providers wrapper)
│   │   ├── routes.ts                     # React Router configuration + RBAC
│   │   │
│   │   ├── components/
│   │   │   ├── Layout.tsx                # Main app shell with sidebar + topbar
│   │   │   ├── LoadingSpinner.tsx        # Loading indicator component
│   │   │   ├── ProtectedRoute.tsx        # Role-based route protection wrapper
│   │   │   ├── RoleSwitcher.tsx          # Demo role switching UI
│   │   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   │   ├── TopBar.tsx                # Top navigation + user profile menu
│   │   │   ├── WelcomeBanner.tsx         # Dashboard welcome section
│   │   │   │
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx # Image component with fallback
│   │   │   │
│   │   │   └── ui/                       # ShadCN/UI component library
│   │   │       ├── accordion.tsx
│   │   │       ├── alert-dialog.tsx
│   │   │       ├── alert.tsx
│   │   │       ├── aspect-ratio.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── breadcrumb.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── carousel.tsx
│   │   │       ├── chart.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── collapsible.tsx
│   │   │       ├── command.tsx
│   │   │       ├── context-menu.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── drawer.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── form.tsx
│   │   │       ├── hover-card.tsx
│   │   │       ├── input-otp.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── menubar.tsx
│   │   │       ├── navigation-menu.tsx
│   │   │       ├── pagination.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── progress.tsx
│   │   │       ├── radio-group.tsx
│   │   │       ├── resizable.tsx
│   │   │       ├── scroll-area.tsx
│   │   │       ├── select.tsx
│   │   │       ├── separator.tsx
│   │   │       ├── sheet.tsx
│   │   │       ├── sidebar.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── slider.tsx
│   │   │       ├── sonner.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── textarea.tsx
│   │   │       ├── toggle-group.tsx
│   │   │       ├── toggle.tsx
│   │   │       ├── tooltip.tsx
│   │   │       ├── use-mobile.ts          # Mobile detector hook
│   │   │       └── utils.ts              # UI utility functions
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx           # Authentication state + login/logout
│   │   │   ├── LanguageContext.tsx       # Language switching (AR/EN)
│   │   │   └── ThemeContext.tsx          # Theme switching (light/dark)
│   │   │
│   │   ├── data/
│   │   │   └── mockData.ts               # Demo/mock data for development
│   │   │
│   │   └── pages/
│   │       ├── Dashboard.tsx             # Main dashboard (role-specific variants)
│   │       ├── LoginPage.tsx             # Sign-in form page
│   │       ├── SignupPage.tsx            # Registration page
│   │       ├── VerifyEmail.tsx           # Email verification page
│   │       ├── VerifyEmailSent.tsx       # Email sent confirmation page
│   │       ├── LandingPage.tsx           # Public landing page
│   │       ├── NotFound.tsx              # 404 error page
│   │       │
│   │       ├── FeedbackList.tsx          # Feedback/complaints list view
│   │       ├── FeedbackDetails.tsx       # Single feedback detail view
│   │       ├── MyFeedback.tsx            # Agent's assigned feedback
│   │       │
│   │       ├── Reports.tsx               # Analytics & reports view
│   │       ├── TeamPerformance.tsx       # Team performance metrics
│   │       ├── SystemAnalytics.tsx       # System-wide analytics
│   │       ├── SystemLogs.tsx            # System logs viewer
│   │       │
│   │       ├── DomainManagement.tsx      # Domain configuration (SuperAdmin)
│   │       ├── CompanyManagement.tsx     # Company management (SuperAdmin)
│   │       ├── UserManagement.tsx        # User management (Admin+)
│   │       ├── CategoryManagement.tsx    # Feedback categories (Admin)
│   │       ├── IntegrationSettings.tsx   # API integrations setup (Admin)
│   │       │
│   │       ├── Settings.tsx              # User settings page
│   │       ├── AgentProfile.tsx          # Agent profile & performance
│   │       │
│   │       └── dashboards/
│   │           ├── SuperAdminDashboard.tsx
│   │           ├── CompanyAdminDashboard.tsx
│   │           └── ManagerDashboard.tsx
│   │
│   ├── services/
│   │   ├── api.ts                        # Centralized HTTP client (Fetch API)
│   │   └── authService.ts                # Authentication service (login, logout, token refresh)
│   │
│   ├── styles/
│   │   ├── fonts.css                     # Font definitions
│   │   ├── index.css                     # Global styles
│   │   ├── tailwind.css                  # Tailwind directives
│   │   └── theme.css                     # Theme variables (light/dark)
│   │
│   ├── types/
│   │   └── api.ts                        # TypeScript interfaces for API responses
│   │
│   └── components/
│       └── Register.jsx                  # Legacy register component (consider moving to pages/)
│
├── .env.example                          # Example environment variables
├── index.html                            # HTML entry point
├── package.json                          # Dependencies + scripts
├── postcss.config.mjs                    # PostCSS configuration (Tailwind)
├── tsconfig.json                         # TypeScript configuration
├── vite.config.ts                        # Vite bundler configuration
└── README.md                             # Frontend documentation
```

---

## Backend Structure

```
backend/
├── app/
│   ├── __init__.py                       # Package initializer
│   ├── main.py                           # FastAPI app instance + middleware + startup
│   ├── config.py                         # Configuration (env variables, settings)
│   ├── database.py                       # SQLAlchemy database setup + session dependency
│   ├── models.py                         # SQLAlchemy ORM models (User, Feedback, Company, etc.)
│   ├── schemas.py                        # Pydantic schemas for request/response validation
│   ├── oauth2.py                         # JWT token creation/validation + auth dependencies
│   ├── utils.py                          # Helper functions (password hashing, validators)
│   │
│   ├── routers/
│   │   ├── auth.py                       # Authentication routes (POST /login, POST /signup, etc.)
│   │   ├── user.py                       # User management routes (GET/POST/PUT users)
│   │   ├── company.py                    # Company management routes
│   │   └── [other routers as needed]     # Feedback, Reports, Analytics routers
│   │
│   └── __pycache__/                      # Python cache (auto-generated)
│
├── schemas/
│   └── [.gitkeep]                        # Placeholder for additional schemas
│
├── services/
│   └── [.gitkeep]                        # Placeholder for business logic services
│
├── tests/
│   └── http_request.http                 # Manual API testing file (REST Client)
│
├── .env                                  # Environment variables (database, secrets, etc.)
├── .gitignore                            # Git ignore rules
├── requirements.txt                      # Python dependencies (fastapi, sqlalchemy, etc.)
└── README.md                             # Backend documentation
```

---

## Key Configuration Files

### Frontend

**[.env.example](frontend/.env.example)** - Environment variables template
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Ara2kom Complaints
VITE_APP_VERSION=1.0.0
```

**[package.json](frontend/package.json)** - Key scripts
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**[vite.config.ts](frontend/vite.config.ts)** - Vite configuration with Tailwind

**[tsconfig.json](frontend/tsconfig.json)** - TypeScript strict mode enabled

### Backend

**[.env](backend/.env)** - Environment variables
```
DATABASE_URL=postgresql://user:password@localhost/complaints_db
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
```

**[requirements.txt](backend/requirements.txt)** - Python dependencies
- fastapi
- sqlalchemy (ORM)
- psycopg2-binary (PostgreSQL)
- python-jose (JWT)
- passlib (password hashing)
- pydantic (validation)
- uvicorn (ASGI server)

---

## Data Flow Architecture

### Authentication Flow
```
LoginPage.tsx
    ↓
authService.login(email, password)
    ↓
api.ts request('/auth/login')
    ↓
FastAPI POST /api/v1/auth/login
    ↓
app/routers/auth.py login() endpoint
    ↓
Verify credentials against app/models.py User
    ↓
Return JWT access_token
    ↓
Store in AuthContext + localStorage
    ↓
Redirect to /app/dashboard
```

### API Request Flow
```
Component calls api.ts request()
    ↓
api.ts injects Authorization: Bearer <token>
    ↓
FastAPI receives request
    ↓
oauth2.py verifies JWT token
    ↓
Extract user_id from token
    ↓
Route handler processes request
    ↓
Return response
```

### Role-Based Access Control (RBAC)
```
Frontend: ProtectedRoute.tsx checks user.role
    ↓ (Client-side hint only)
Backend: Route handler checks token + verifies role
    ↓ (Primary enforcement)
Return 403 Forbidden if role not allowed
```

---

---

## Next Steps
1. ✅ Frontend login page is fully built
2. ⚠️ Replace mock API calls with real endpoints
3. ⚠️ Ensure backend endpoints match frontend expected response format
4. ⚠️ Add CORS configuration to FastAPI
5. ⚠️ Configure environment variables (.env files)
6. Test end-to-end login flow
