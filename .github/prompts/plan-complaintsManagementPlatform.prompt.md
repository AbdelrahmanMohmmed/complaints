# Complaints Management Platform - Development Instructions

## PROJECT OVERVIEW

### Purpose
A multi-tenant complaints/feedback management system designed to handle feedback collection, categorization, analysis, and reporting across multiple companies and domains.

### Technology Stack
- **Backend**: FastAPI (Python 3.9+)
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: OAuth2 with JWT tokens
- **Styling**: Tailwind CSS + Radix UI
- **HTTP Client**: Centralized API client with interceptors

### Architecture
```
complaints/
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── main.py              # FastAPI application setup
│       ├── config.py            # Environment configuration
│       ├── database.py          # SQLAlchemy engine & session
│       ├── models.py            # ORM models
│       ├── schemas.py           # Pydantic request/response schemas
│       ├── oauth2.py            # JWT authentication logic
│       ├── utils.py             # Helper functions (password hashing)
│       └── routers/
│           ├── auth.py          # Login/authentication endpoints
│           ├── user.py          # User management endpoints
│           └── company.py       # Company management endpoints
└── frontend/
    ├── index.html               # Entry HTML
    ├── vite.config.ts           # Vite configuration
    ├── src/
    │   ├── main.tsx             # React entry point
    │   ├── app/
    │   │   ├── App.tsx          # Root component
    │   │   ├── routes.ts        # React Router configuration with RBAC
    │   │   ├── pages/           # Page components (one per route)
    │   │   ├── components/      # Reusable UI components
    │   │   ├── contexts/        # React context (Auth, Theme, Language)
    │   │   └── data/            # Mock data
    │   ├── services/
    │   │   ├── api.ts           # Centralized HTTP client
    │   │   └── authService.ts   # Auth-specific service
    │   ├── types/
    │   │   └── api.ts           # TypeScript API type definitions
    │   └── styles/              # Global styles
```

---

## DATABASE SCHEMA

### Core Models & Relationships

#### 1. **Domain**
Represents top-level business domains (e.g., "E-commerce", "SaaS").
```python
class Domain(Base):
    __tablename__ = "domains"
    domain_id: int (PK, auto-increment)
    domain_name: str (unique, required)
    
    # Relationships
    companies: List[Company]
    feedback_categories: List[FeedbackCategory]
```

#### 2. **Company**
Represents a company within a domain. Multi-tenant unit.
```python
class Company(Base):
    __tablename__ = "companies"
    company_id: int (PK, auto-increment)
    company_name: str (100 chars max)
    email: str
    phone: str
    domain_id: int (FK → Domain)
    created_at: DateTime (server-generated)
    
    # Relationships
    domain: Domain
    users: List[User]
    apis: List[Api]
    feedbacks: List[Feedback]
```

#### 3. **Role**
User roles for RBAC (e.g., superAdmin, companyAdmin, manager, agent).
```python
class Role(Base):
    __tablename__ = "roles"
    role_id: int (PK, auto-increment)
    role_name: str (50 chars max)
    
    # Relationships
    users: List[User]
```

#### 4. **User**
System users with role-based access control.
```python
class User(Base):
    __tablename__ = "users"
    user_id: int (PK, auto-increment)
    company_id: int (FK → Company)
    role_id: int (FK → Role)
    f_name: str (50 chars max)
    l_name: str (50 chars max)
    email: str (unique, required)
    password_hash: str
    is_active: bool (default=True)
    created_at: DateTime (server-generated)
    
    # Relationships
    company: Company
    role: Role
```

#### 5. **Api**
API integrations for feedback channels (e.g., Facebook, Email, web form).
```python
class Api(Base):
    __tablename__ = "apis"
    api_id: int (PK, auto-increment)
    company_id: int (FK → Company)
    api_key: str
    channel_name: str (50 chars max, e.g., "facebook", "twitter")
    api_base_url: str
    status: str (default="active")
    created_at: DateTime (server-generated)
    
    # Relationships
    company: Company
    feedbacks: List[Feedback]
```

#### 6. **FeedbackCategory**
Categories for classifying feedback (e.g., "Bug", "Feature Request").
```python
class FeedbackCategory(Base):
    __tablename__ = "feedback_categories"
    category_id: int (PK, auto-increment)
    domain_id: int (FK → Domain)
    category_name: str (100 chars max)
    
    # Relationships
    domain: Domain
    feedbacks: List[Feedback]
```

#### 7. **Feedback**
Individual feedback/complaint entries.
```python
class Feedback(Base):
    __tablename__ = "feedback"
    feedback_id: int (PK, auto-increment)
    company_id: int (FK → Company)
    api_id: int (FK → Api)
    category_id: int (FK → FeedbackCategory, nullable)
    customer_name: str
    feedback_context: Text
    
    # Relationships
    company: Company
    api: Api
    category: FeedbackCategory
```

### Key Relationships
- **Domain ←→ Company**: 1:M (one domain has many companies)
- **Company ←→ User**: 1:M (one company has many users)
- **Company ←→ Api**: 1:M (one company has many integrations)
- **Company ←→ Feedback**: 1:M (one company has many feedbacks)
- **Domain ←→ FeedbackCategory**: 1:M

---

## AUTHENTICATION & AUTHORIZATION

### OAuth2 JWT Token Flow

1. **Login** (`POST /api/v1/login`)
   - Request: `OAuth2PasswordRequestForm` (username=email, password)
   - Response: `{ "access_token": "...", "token_type": "bearer" }`
   - Backend creates JWT with user_id encoded in payload

2. **Protected Requests**
   - Frontend includes: `Authorization: Bearer <access_token>`
   - Backend validates token signature and expiry
   - Token decoded to extract user_id

3. **Token Structure**
   ```python
   # Payload
   {
       "user_id": 123,
       "exp": <unix_timestamp>   # expires after settings.access_token_expire_minutes
   }
   
   # Signed with: settings.secret_key using algorithm (default: HS256)
   ```

### Role-Based Access Control (RBAC)

#### Roles
- **superAdmin**: Full system access, manage domains/companies
- **companyAdmin**: Manage company, users, settings
- **manager**: View reports, analytics
- **agent**: View/respond to feedback

#### Frontend RBAC
Routes define `allowedRoles` property:
```typescript
{
  path: '/app/users',
  Component: UserManagement,
  allowedRoles: ['superAdmin', 'companyAdmin']  // Only these can access
}
```

#### Backend RBAC (TODO)
- Extract role from JWT token
- Validate against endpoint-specific requirements
- Return 403 Forbidden if unauthorized

### Key Files
- [backend/app/oauth2.py](backend/app/oauth2.py): JWT creation & validation
- [backend/app/utils.py](backend/app/utils.py): Password hashing (bcrypt)
- [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx): Frontend auth state

---

## API DESIGN CONVENTIONS

### Base URL & Versioning
- Base: `/api/v1`
- Example: `GET /api/v1/users/me`

### Endpoint Patterns

#### Authentication (`/login`)
```
POST /api/v1/login
Request:  { username: "user@example.com", password: "..." }
Response: { access_token: "...", token_type: "bearer" }
```

#### Users (`/users`)
```
POST   /api/v1/users
       Create new user
       Body: { company_id, role_id, f_name, l_name, email, password }
       
GET    /api/v1/users/me
       Get current user profile
       Auth: Required
       Response: { user_id, f_name, l_name, email, role_id, company_id }
```

#### Companies (`/companies`)
```
POST   /api/v1/companies
       Create company + admin user (signup)
       Body: { company_name, email, phone, domain_id, f_name, l_name, password }
       Response: { company_id, company_name, domain_id, created_at }
```

### Response Format
```json
{
  "data": { /* actual response */ },
  "status": "success" | "error",
  "message": "Human-readable message"
}
```

### Error Handling
- **400 Bad Request**: Invalid input, validation error
- **401 Unauthorized**: Missing/invalid token
- **403 Forbidden**: Authenticated but not authorized for resource
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side error

### HTTP Status Codes Used
- `200 OK`: Successful GET/PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400, 401, 403, 404, 500`: Errors (see above)

---

## FRONTEND ARCHITECTURE

### Component Organization

#### Pages (Route Components)
Located in `src/app/pages/`, one per route:
- **LandingPage**: Public landing page
- **LoginPage**: Email/password login form
- **SignupPage**: Company + admin user registration
- **Dashboard**: Main dashboard (role-dependent view)
- **FeedbackList**: Browse feedback entries
- **UserManagement**: Add/edit/delete users (admin only)
- **DomainManagement**: Manage domains (superAdmin only)
- **CompanyManagement**: Manage companies (superAdmin/companyAdmin)
- **SystemAnalytics**: System-wide analytics (superAdmin)
- And more...

#### Components (`src/app/components/`)
Reusable UI components:
- **Layout.tsx**: App shell with sidebar, topbar, breadcrumbs
- **ProtectedRoute.tsx**: Route guard for authenticated routes
- **RoleSwitcher.tsx**: Role selection UI for multi-role users
- **LoadingSpinner.tsx**: Loading indicator
- **ui/**: Headless Radix UI components (button, dialog, form, etc.)

#### Contexts (`src/app/contexts/`)
React Context for global state:
- **AuthContext.tsx**: Current user, token, login/logout
- **ThemeContext.tsx**: Dark/light theme toggle
- **LanguageContext.tsx**: i18n language selection

### Routing

Routes defined in `src/app/routes.ts` using React Router v6:
```typescript
type RouteWithMeta = RouteObject & {
  allowedRoles?: UserRole[];  // For RBAC
  name?: string;              // For debugging
}

const routes = [
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  {
    path: '/app',
    Component: Layout,
    children: [
      { path: 'dashboard', Component: Dashboard, allowedRoles: [...] },
      { path: 'feedback', Component: FeedbackList, allowedRoles: [...] },
      ...
    ]
  }
]
```

### Data Fetching & API Integration

#### Centralized API Client (`src/services/api.ts`)
```typescript
// Usage
import { api } from '@/services/api';

// GET request
const user = await api.get('/users/me');

// POST request with body
const newUser = await api.post('/users', {
  company_id: 1,
  role_id: 2,
  f_name: 'John',
  l_name: 'Doe',
  email: 'john@example.com',
  password: '...'
});

// Error handling
try {
  const result = await api.get('/users/me');
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Clear auth and redirect to login
  }
}
```

Key features:
- Automatic Authorization header injection
- Token refresh on 401 (TODO)
- Centralized error handling
- Request/response logging

#### Service Modules
- `src/services/api.ts`: HTTP client
- `src/services/authService.ts`: Auth-specific requests (login, logout)

---

## DEVELOPMENT SETUP

### Backend Setup

#### Prerequisites
- Python 3.9+
- PostgreSQL 12+

#### Installation
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Environment Configuration (`.env`)
```env
# Database
DATABASE_HOSTNAME=localhost
DATABASE_PORT=5432
DATABASE_NAME=complaints_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# Security
SECRET_KEY=your-secret-key-here (min 32 chars, use secrets.token_urlsafe(32))
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Running the Backend
```bash
# Start FastAPI server
uvicorn app.main:app --reload --port 8000

# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs (Swagger UI)
```

#### Database Initialization
```python
# In backend/app/main.py
models.Base.metadata.create_all(bind=database.engine)
```
This creates all tables on startup.

### Frontend Setup

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Installation
```bash
cd frontend

# Install dependencies
npm install
```

#### Environment Configuration (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

#### Running the Frontend
```bash
# Development server
npm run dev

# Server runs at http://localhost:5173
# Vite hot reload enabled
```

#### Building for Production
```bash
npm run build

# Output: dist/
# Ready to deploy
```

---

## COMMON DEVELOPMENT TASKS

### Adding a New Endpoint

#### 1. Define Database Model (if needed)
File: `backend/app/models.py`
```python
class NewModel(Base):
    __tablename__ = "new_models"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    # ... other fields
```

#### 2. Create Pydantic Schema
File: `backend/app/schemas.py`
```python
class NewModelCreate(BaseModel):
    name: str

class NewModelOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True
```

#### 3. Create Router
File: `backend/app/routers/new_model.py`
```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from .. import models, schemas, database, oauth2

router = APIRouter(prefix="/new-models", tags=["New Models"])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.NewModelOut)
def create_new_model(
    req: schemas.NewModelCreate,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    new_obj = models.NewModel(**req.dict())
    db.add(new_obj)
    db.commit()
    db.refresh(new_obj)
    return new_obj
```

#### 4. Register Router
File: `backend/app/main.py`
```python
from .routers import new_model
app.include_router(new_model.router, prefix="/api/v1")
```

#### 5. Update Frontend Types
File: `frontend/src/types/api.ts`
```typescript
export interface NewModel {
  id: number;
  name: string;
}
```

#### 6. Create Frontend Service
File: `frontend/src/services/newModelService.ts`
```typescript
import { api } from './api';
import { NewModel } from '@/types/api';

export const newModelService = {
  create: async (name: string): Promise<NewModel> => {
    return api.post('/new-models', { name });
  },
  list: async (): Promise<NewModel[]> => {
    return api.get('/new-models');
  }
};
```

#### 7. Create Frontend Page/Component
File: `frontend/src/app/pages/NewModelPage.tsx`
```typescript
import { useState, useEffect } from 'react';
import { newModelService } from '@/services/newModelService';
import { NewModel } from '@/types/api';

export function NewModelPage() {
  const [items, setItems] = useState<NewModel[]>([]);
  
  useEffect(() => {
    newModelService.list().then(setItems);
  }, []);
  
  return (/* JSX */);
}
```

### Adding Authentication to an Endpoint

Backend (FastAPI):
```python
from . import oauth2

@router.get("/protected")
def get_protected_data(
    current_user_id: int = Depends(oauth2.get_current_user),
    db: Session = Depends(database.get_db)
):
    # current_user_id is automatically injected
    user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    return {"user": user}
```

Frontend (React):
```typescript
// Component automatically includes auth header via api client
const data = await api.get('/protected', {
  headers: { 'Authorization': `Bearer ${token}` }
  // Token is auto-injected by api client
});
```

### Adding RBAC to a Route

Frontend (routes.ts):
```typescript
{
  path: '/admin',
  Component: AdminPage,
  allowedRoles: ['superAdmin', 'companyAdmin']  // Only these roles can access
}
```

Backend (TODO - implement RBAC middleware):
```python
# Add role validation decorator or middleware
def require_roles(*allowed_roles):
    def decorator(func):
        def wrapper(*args, current_user_id: int = Depends(oauth2.get_current_user), **kwargs):
            # TODO: Validate user.role in allowed_roles
            return func(*args, **kwargs)
        return wrapper
    return decorator

@router.get("/admin-only")
@require_roles('superAdmin', 'companyAdmin')
def admin_endpoint():
    pass
```

---

## CODE CONVENTIONS

### Backend (FastAPI + SQLAlchemy)

#### Naming Conventions
- **Models**: PascalCase (e.g., `User`, `Feedback`)
- **Table names**: snake_case, plural (e.g., `users`, `feedback`)
- **Routes**: lowercase with hyphens (e.g., `/api/v1/daily-reports`)
- **Functions**: snake_case (e.g., `get_current_user`, `hash_password`)

#### Import Organization
```python
# Standard library
from datetime import datetime
from typing import Optional

# Third-party
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, EmailStr

# Local
from .. import models, schemas, database, utils, oauth2
```

#### Error Handling
```python
from fastapi import HTTPException, status

# Validation error
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Validation failed: email already exists"
)

# Authentication error
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials"
)

# Authorization error
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Access denied"
)
```

### Frontend (React + TypeScript)

#### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Functions/hooks**: camelCase (e.g., `useAuth()`, `getUserName()`)
- **Variables**: camelCase (e.g., `currentUser`, `isLoading`)
- **CSS classes**: kebab-case (Tailwind)

#### File Organization
```
src/
├── app/
│   ├── pages/          # Route components (one per route)
│   ├── components/     # Reusable components
│   ├── contexts/       # React context
│   ├── data/           # Mock data, constants
│   └── routes.ts       # Route definitions
├── services/           # API client, service functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

#### Component Structure
```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { userService } from '@/services/userService';

interface UserProfile {
  id: number;
  name: string;
}

export function UserList() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.list();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (users.length === 0) return <div>No users found</div>;

  return (
    <div className="space-y-4">
      {users.map(user => (
        <div key={user.id} className="p-4 border rounded">
          {user.name}
        </div>
      ))}
    </div>
  );
}
```

#### Error Handling
```typescript
// API errors
try {
  const data = await api.post('/endpoint', payload);
} catch (error: any) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Invalid input:', error.message);
  } else if (error.code === 'UNAUTHORIZED') {
    // Redirect to login
    window.location.href = '/login';
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

---

## BUILD & DEPLOYMENT

### Backend Deployment

#### Using Gunicorn (Production)
```bash
# Install
pip install gunicorn

# Run
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

#### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Environment Variables (Production)
Set securely via:
- CI/CD secrets (GitHub Actions, GitLab CI, etc.)
- Cloud provider secrets (AWS Secrets Manager, etc.)
- `.env` file (development only, never commit)

### Frontend Deployment

#### Build
```bash
npm run build

# Output: dist/ folder
```

#### Deploy to Static Hosting
- **Vercel**: Connect GitHub repo, auto-deploys on push
- **Netlify**: Connect GitHub repo, auto-deploys on push
- **AWS S3 + CloudFront**: Upload dist/ to S3, use CloudFront CDN
- **GitHub Pages**: Push dist/ to gh-pages branch

#### Environment Variables (Production)
```
VITE_API_BASE_URL=https://api.production.com/api/v1
```

#### CORS Configuration (Backend)
```python
# In backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",           # Dev
    "https://app.production.com",      # Prod
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## TESTING & DEBUGGING

### Backend Testing

#### Unit Tests
```python
# tests/test_auth.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login():
    response = client.post("/api/v1/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

#### Run Tests
```bash
pytest tests/ -v
```

### Frontend Testing

#### Component Tests (Vitest + React Testing Library)
```typescript
// tests/UserList.test.tsx
import { render, screen } from '@testing-library/react';
import { UserList } from '@/app/pages/UserList';

test('renders user list', async () => {
  render(<UserList />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

#### Run Tests
```bash
npm run test
```

### Debugging

#### Backend Debugging
- Logs: `print()` statements or Python logging module
- Swagger UI: `http://localhost:8000/docs` for interactive API testing
- Database: Use `psql` CLI or pgAdmin for direct DB inspection

#### Frontend Debugging
- Browser DevTools (Chrome, Firefox)
- React DevTools extension
- Console logs: `console.log()`, `console.error()`
- Network tab: Inspect API requests/responses
- Application tab: Inspect token storage

---

## SECURITY BEST PRACTICES

### Backend Security
1. **Password Hashing**: Use bcrypt (already implemented in `utils.py`)
2. **JWT Secret**: Use strong, random key (32+ chars)
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Whitelist specific origins, not `*`
5. **Input Validation**: Use Pydantic schemas for all inputs
6. **Rate Limiting**: TODO - implement rate limiting (e.g., SlowAPI)
7. **SQL Injection**: Use SQLAlchemy ORM (safe by default)

### Frontend Security
1. **Token Storage**: Store in memory or sessionStorage (not localStorage)
2. **XSS Prevention**: Sanitize user input, use React's built-in escaping
3. **CSRF Protection**: Include CSRF token in state-changing requests
4. **HTTPS**: Always use HTTPS in production
5. **CSP Headers**: Implement Content Security Policy

---

## TROUBLESHOOTING

### Common Issues

#### "Database connection refused"
**Cause**: PostgreSQL not running
**Fix**: 
```bash
# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
# Or use Docker: docker run -p 5432:5432 postgres
```

#### "ModuleNotFoundError: No module named 'fastapi'"
**Cause**: Dependencies not installed
**Fix**:
```bash
pip install -r requirements.txt
```

#### "CORS error in browser"
**Cause**: Backend CORS not configured or origin mismatch
**Fix**: Check `origins` list in `backend/app/main.py`

#### "401 Unauthorized on API request"
**Cause**: Token missing, expired, or invalid
**Fix**: Verify token in localStorage/context, ensure backend validation works

#### "npm install hangs"
**Cause**: Network issues or large dependency tree
**Fix**:
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

---

## QUICK REFERENCE

### Project Initialization
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=app.main

# Frontend
cd frontend
npm install

# Run both
# Terminal 1: cd backend && uvicorn app.main:app --reload
# Terminal 2: cd frontend && npm run dev
```

### Database URL Format
```
postgresql://username:password@hostname:port/database_name
```

### Common Commands
```bash
# Backend
python -m pytest                    # Run tests
uvicorn app.main:app --reload      # Dev server
alembic upgrade head                # Run migrations (if using Alembic)

# Frontend
npm run dev                         # Dev server
npm run build                       # Production build
npm run test                        # Run tests
```

### Useful Links
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Router Docs](https://reactrouter.com)
- [Pydantic Docs](https://docs.pydantic.dev)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Last Updated**: March 10, 2026
**Version**: 5.0
