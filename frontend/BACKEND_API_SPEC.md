# Backend Integration Quick Reference for FastAPI Developer

> Quick checklist of what the backend needs to implement to work with this frontend

---

## 🎯 Priority 1: Authentication (MUST DO FIRST)

### Endpoint 1: Login
```
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

Request Body:
  username=user@email.com&password=password123

Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}

Error (401):
{
  "detail": "Invalid credentials"
}
```

### Endpoint 2: Get Current User
```
GET /api/v1/auth/me
Authorization: Bearer {access_token}

Response (200 OK):
{
  "user_id": 1,
  "f_name": "Ahmed",
  "l_name": "Mohammed",
  "email": "ahmed@example.com",
  "role_id": 1,
  "company_id": 1
}

Error (401):
{
  "detail": "Invalid or expired token"
}
```

---

## 🎯 Priority 2: Core Feedback Endpoints

### Endpoint 3: List Feedback
```
GET /api/v1/feedback?page=1&limit=20&status=open&sentiment=positive
Authorization: Bearer {access_token}

Response (200 OK):
{
  "items": [
    {
      "feedback_id": 1,
      "company_id": 1,
      "api_id": null,
      "channel_name": "Email",
      "category_name": "service_quality",
      "customer_name": "John Doe",
      "feedback_context": "Excellent service!",
      "status": "closed",
      "sentiment": "positive",
      "sentiment_id": 2,
      "emotion": "satisfied",
      "emotion_id": 1,
      "problem_type": "service_quality",
      "problem_type_id": 1,
      "priority": "low",
      "created_at": "2026-02-20T10:30:00Z",
      "updated_at": "2026-02-22T14:20:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### Endpoint 4: Get Single Feedback
```
GET /api/v1/feedback/{feedback_id}
Authorization: Bearer {access_token}

Response (200 OK):
{
  "feedback_id": 1,
  "company_id": 1,
  "api_id": null,
  "channel_name": "Email",
  "category_name": "service_quality",
  "customer_name": "John Doe",
  "feedback_context": "Excellent service!",
  "status": "closed",
  "sentiment": "positive",
  "sentiment_id": 2,
  "emotion": "satisfied",
  "emotion_id": 1,
  "problem_type": "service_quality",
  "problem_type_id": 1,
  "priority": "low",
  "created_at": "2026-02-20T10:30:00Z",
  "updated_at": "2026-02-22T14:20:00Z"
}

Error (404):
{
  "detail": "Feedback not found"
}
```

### Endpoint 5: Update Feedback
```
PUT /api/v1/feedback/{feedback_id}
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "status": "resolved",
  "priority": "high"
}

Response (200 OK):
{
  "feedback_id": 1,
  "status": "resolved",
  "priority": "high",
  ... (other fields)
}
```

### Endpoint 6: Delete Feedback
```
DELETE /api/v1/feedback/{feedback_id}
Authorization: Bearer {access_token}

Response (204 No Content):
(empty)

Error (404):
{
  "detail": "Feedback not found"
}
```

---

## 🎯 Priority 3: User Management Endpoints

### Endpoint 7: List Users
```
GET /api/v1/users?company_id=1&page=1&limit=20
Authorization: Bearer {access_token}

Response (200 OK):
{
  "items": [
    {
      "user_id": 1,
      "f_name": "Ahmed",
      "l_name": "Mohammed",
      "email": "ahmed@example.com",
      "role_id": 1,
      "company_id": 1,
      "is_active": true,
      "created_at": "2026-01-15T08:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

### Endpoint 8: Create User
```
POST /api/v1/users
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "f_name": "New",
  "l_name": "User",
  "email": "newuser@example.com",
  "password": "securepassword123",
  "role_id": 2,
  "company_id": 1
}

Response (201 Created):
{
  "user_id": 50,
  "f_name": "New",
  "l_name": "User",
  "email": "newuser@example.com",
  "role_id": 2,
  "company_id": 1,
  "is_active": true
}
```

### Endpoint 9: Update User
```
PUT /api/v1/users/{user_id}
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "f_name": "Updated",
  "role_id": 1,
  "is_active": false
}

Response (200 OK):
{
  "user_id": 50,
  "f_name": "Updated",
  "l_name": "User",
  "email": "newuser@example.com",
  "role_id": 1,
  "company_id": 1,
  "is_active": false
}
```

### Endpoint 10: Delete User
```
DELETE /api/v1/users/{user_id}
Authorization: Bearer {access_token}

Response (204 No Content):
(empty)
```

---

## 🎯 Priority 4: Company/Domain Endpoints

### Endpoint 11: List Companies
```
GET /api/v1/companies?page=1&limit=20
Authorization: Bearer {access_token}

Response (200 OK):
{
  "items": [
    {
      "company_id": 1,
      "name": "Restaurant XYZ",
      "domain": "restaurant",
      "is_active": true,
      "total_feedback": 1250,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20
}
```

### Endpoint 12: List Domains
```
GET /api/v1/domains
Authorization: Bearer {access_token}

Response (200 OK):
{
  "items": [
    {
      "domain_id": 1,
      "name": "Restaurants",
      "name_ar": "المطاعم",
      "description": "Restaurant feedback management",
      "description_ar": "إدارة آراء المطاعم",
      "total_feedback": 5000,
      "companies": 15,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

## 🎯 Priority 5: Reports & Analytics

### Endpoint 13: Get Dashboard Metrics
```
GET /api/v1/reports/dashboard?company_id=1&start_date=2026-02-01&end_date=2026-02-28
Authorization: Bearer {access_token}

Response (200 OK):
{
  "total_feedback": 450,
  "positive_feedback": 280,
  "negative_feedback": 89,
  "neutral_feedback": 81,
  "avg_sentiment_score": 0.65,
  "feedback_by_channel": {
    "Email": 200,
    "Twitter": 150,
    "Facebook": 100
  },
  "feedback_by_category": {
    "service_quality": 150,
    "food_quality": 200,
    "cleanliness": 100
  },
  "top_emotions": {
    "satisfied": 150,
    "frustrated": 80,
    "happy": 70
  },
  "resolution_rate": 0.85
}
```

---

## ⚙️ Authentication Details

### Role IDs
```
1 = Company Manager (can manage all)
2 = Customer Service Supervisor/CSS (can manage feedback, view reports)
3 = Website Configurator (can configure categories, integrations)
```

### Token Format
- JWT token with Bearer scheme
- Recommended expiration: 24 hours
- Should be HTTP-only cookie (optional) or localStorage (currently used by frontend)

### Required Headers
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

---

## 🚨 CORS Configuration (MUST DO)

Add to FastAPI before any routes:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",           # Local dev
        "http://localhost:3000",           # Alternative dev
        "https://staging.ara2kom.ai",      # Staging
        "https://ara2kom.ai",              # Production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    max_age=3600,
)
```

---

## 📊 Database Model Reference

From Frontend Expectations:

### Users Table
- user_id (primary key)
- f_name, l_name
- email (unique)
- role_id (1, 2, or 3)
- company_id (foreign key)
- password (hashed, never sent to frontend)
- is_active (boolean)
- created_at, updated_at

### Feedback Table
- feedback_id (primary key)
- company_id (foreign key)
- api_id (nullable, for 3rd party integrations)
- channel_name (Email, Twitter, Facebook, SMS, etc.)
- category_name (slug)
- customer_name
- feedback_context (main text)
- status (open, inProgress, resolved, closed)
- sentiment (positive, negative, neutral)
- sentiment_id (0, 1, 2)
- emotion (satisfied, frustrated, disgusted, etc.)
- emotion_id
- problem_type
- problem_type_id
- priority (low, medium, high)
- created_at, updated_at

### Companies Table
- company_id (primary key)
- name
- domain (restaurant, retail, sanitary_tools, hospitality, etc.)
- is_active (boolean)
- total_feedback (count)
- created_at

---

## ✅ Integration Testing Checklist

```bash
# Test 1: Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=test@example.com&password=password123"

# Test 2: Get current user (use token from Test 1)
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/v1/auth/me

# Test 3: List feedback
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/v1/feedback

# Test 4: Get single feedback
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/v1/feedback/1

# Test 5: Update feedback
curl -X PUT -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status":"resolved"}' \
  http://localhost:8000/api/v1/feedback/1
```

---

## 🚀 Start Here

1. Implement authentication endpoints first (auth/login, auth/me)
2. Test with Postman or curl
3. Implement feedback endpoints
4. Test each page as you implement endpoints
5. Use browser DevTools Network tab to debug
6. Check CORS is working (frontend should connect without errors)

---

## 📞 Common Questions

**Q: Response format - camelCase or snake_case?**
A: Use snake_case (user_id, not userId). Frontend will work with it.

**Q: Pagination - how many per page?**
A: Default 20 per page, can be customized via ?limit parameter

**Q: Date format?**
A: ISO 8601 (2026-02-20T10:30:00Z)

**Q: Error responses?**
A: Always return JSON with "detail" field: `{"detail": "error message"}`

**Q: What about validation errors?**
A: Return 422 with FastAPI validation details or custom 400 with clear message

---

**Status**: Ready for Backend Implementation ✅
**Last Updated**: May 28, 2026
