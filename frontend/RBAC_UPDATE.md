# RBAC Update - New Roles & Permissions

## Summary

The frontend RBAC (Role-Based Access Control) system has been updated to use 3 new roles replacing the previous 4-role system.

### Old Roles (Removed)
- ❌ `superAdmin` - System administrator
- ❌ `companyAdmin` - Company administrator  
- ⚠️ `manager` - Changed to supervisor
- ✅ `websiteConfigurator` - Kept (but renamed context)

### New Roles (Active)

#### 1. **Manager** (`manager`)
**Level**: Highest (within company)

**Responsibilities**:
- ✅ Full company management access
- ✅ Can create/edit/delete users
- ✅ Can manage API configurations
- ✅ Can manage integrations
- ✅ Can manage categories/feedback types
- ✅ Access dashboard
- ✅ Access reports
- ✅ Access all feedbacks
- ✅ Access settings

**Sidebar Navigation**:
- Dashboard
- All Feedback
- Users
- Categories
- Reports
- Settings

**Route Access**: `/app`, `/app/feedback`, `/app/users`, `/app/categories`, `/app/reports`, `/app/settings`

---

#### 2. **Customer Service Supervisor** (`customerServiceSupervisor`)
**Level**: Medium (monitoring/supervision only)

**Responsibilities**:
- ✅ View dashboard
- ✅ View reports
- ✅ View feedbacks
- ❌ Cannot add/edit/delete users
- ❌ Cannot manage API configurations
- ❌ Cannot manage integrations
- ❌ Cannot access company settings

**Sidebar Navigation**:
- Dashboard
- Feedback
- Reports

**Route Access**: `/app`, `/app/feedback`, `/app/reports`

**Dashboard Behavior**: Redirected to supervisory dashboard view

---

#### 3. **Website Configurator** (`websiteConfigurator`)
**Level**: Lowest (technical configuration only)

**Responsibilities**:
- ✅ Can manage API configurations
- ✅ Can manage integrations
- ❌ Cannot access dashboard
- ❌ Cannot access reports
- ❌ Cannot access feedbacks
- ❌ Cannot manage users
- ❌ Cannot access company administration

**Sidebar Navigation**:
- Integrations

**Route Access**: `/app/integrations` only

**Dashboard Behavior**: Auto-redirects to `/app/integrations` on dashboard access

---

## Test Accounts

### Manager Account
```
Email:    manager@ara2kom.ai
Password: 123456
Role:     manager
Company:  company-1
```

### Customer Service Supervisor Account
```
Email:    supervisor@ara2kom.ai
Password: 123456
Role:     customerServiceSupervisor
Company:  company-1
```

### Website Configurator Account
```
Email:    configurator@ara2kom.ai
Password: 123456
Role:     websiteConfigurator
Company:  company-1
```

---

## Files Updated

### 1. **types/api.ts**
- ✅ Updated `UserRole` type to: `'manager' | 'customerServiceSupervisor' | 'websiteConfigurator'`
- ✅ Added `ROLE_PERMISSIONS` constant with permissions matrix
- ✅ Added `ROLE_DISPLAY` constant with color schemes and labels
- ✅ Updated signup request to use new role types

### 2. **app/contexts/AuthContext.tsx**
- ✅ Updated to import `UserRole` from `types/api.ts`
- ✅ Removed hardcoded role type definition

### 3. **app/routes.ts**
- ✅ Updated route `allowedRoles` for all protected routes
- ✅ Dashboard: `['manager', 'customerServiceSupervisor']`
- ✅ Feedback routes: `['manager', 'customerServiceSupervisor']`
- ✅ Reports: `['manager', 'customerServiceSupervisor']`
- ✅ Users management: `['manager']` only
- ✅ Categories: `['manager']` only
- ✅ Integrations: `['websiteConfigurator']` only
- ✅ Removed superAdmin and companyAdmin routes

### 4. **app/pages/Dashboard.tsx**
- ✅ Updated redirect: websiteConfigurator → `/app/integrations`
- ✅ Manager and customerServiceSupervisor show dashboard
- ✅ Removed superAdmin and companyAdmin logic

### 5. **app/components/Sidebar.tsx**
- ✅ Updated `navigationByRole` with new role-specific navigation
- ✅ Updated color scheme mappings
- ✅ Removed superAdmin and companyAdmin navigation
- ✅ Added manager full navigation
- ✅ Added customerServiceSupervisor monitoring navigation
- ✅ Updated websiteConfigurator to show only integrations

### 6. **app/components/TopBar.tsx**
- ✅ Updated role color gradient mappings
- ✅ Removed superAdmin and companyAdmin colors
- ✅ Added new role colors

### 7. **app/components/WelcomeBanner.tsx**
- ✅ Updated `roleConfig` with new roles
- ✅ Removed superAdmin configuration
- ✅ Removed companyAdmin configuration
- ✅ Updated manager welcome message
- ✅ Updated customerServiceSupervisor welcome message
- ✅ Updated websiteConfigurator welcome message
- ✅ Updated icons and gradients

### 8. **app/contexts/LanguageContext.tsx**
- ✅ Updated role translation keys
- ✅ Removed superAdmin translations
- ✅ Removed companyAdmin translations
- ✅ Removed superadmin.* prefixed translations
- ✅ Removed agent.* prefixed translations
- ✅ Added translations for new roles

### 9. **app/data/mockData.ts**
- ✅ Updated `User` interface to use new role type
- ✅ Added mock users for each role:
  - `manager@ara2kom.ai` (Manager)
  - `supervisor@ara2kom.ai` (Customer Service Supervisor)
  - `configurator@ara2kom.ai` (Website Configurator)
- ✅ Updated existing mock users with new roles
- ✅ Added password field to mock users

---

## Permission Matrix

| Permission | Manager | Supervisor | Configurator |
|-----------|---------|-----------|--------------|
| View Dashboard | ✅ | ✅ | ❌ |
| View Feedback | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Manage Categories | ✅ | ❌ | ❌ |
| Manage Integrations | ✅ | ❌ | ✅ |
| Manage Settings | ✅ | ❌ | ❌ |

---

## Frontend Checks Implemented

### ProtectedRoute.tsx
- ✅ Validates user authentication
- ✅ Validates user role against route `allowedRoles`
- ✅ Shows access denied for unauthorized roles
- ⚠️ **Note**: Backend MUST independently validate on all API endpoints

### Dashboard.tsx
- ✅ Redirects websiteConfigurator to integrations
- ✅ Shows dashboard for manager and supervisor

### Sidebar.tsx
- ✅ Shows role-specific navigation
- ✅ Only displays accessible routes for each role

---

## Important Notes

### Security ⚠️
- **Frontend checks are UI hints only** - Backend MUST validate permissions on every API endpoint
- Never trust role from client; decode from JWT token on backend
- Implement token refresh logic before expiry
- Move access tokens from localStorage to memory

### Backend Requirements
- Implement role validation on all API endpoints
- Verify user role from JWT claims, not from request data
- Return 403 Forbidden for unauthorized role access
- Log unauthorized access attempts for audit trail

### Testing
All three test accounts are configured in `mockData.ts`:
1. Log in with `manager@ara2kom.ai` → See full management interface
2. Log in with `supervisor@ara2kom.ai` → See monitoring interface
3. Log in with `configurator@ara2kom.ai` → See integrations only

---

## Migration Path

### For Existing Data
- If your backend has `superAdmin` or `companyAdmin` roles:
  - Map `superAdmin` → Archive (create new system-wide admin role if needed)
  - Map `companyAdmin` → `manager`
  - Keep `manager` → Can change to `customerServiceSupervisor` if supervisor-only
  - Keep `websiteConfigurator` → No change

---

## Next Steps

1. **Backend Updates**:
   - [ ] Update user model to use new role type
   - [ ] Migrate existing users to new roles
   - [ ] Add role validation to all API endpoints
   - [ ] Implement token refresh mechanism
   - [ ] Update JWT token generation with correct roles

2. **Frontend Enhancements**:
   - [ ] Add API integration for real authentication
   - [ ] Replace mock data with backend calls
   - [ ] Implement error boundary for unauthorized access
   - [ ] Add role-specific error messages

3. **Testing**:
   - [ ] Test all three roles in UI
   - [ ] Test unauthorized route access
   - [ ] Test permission-gated features
   - [ ] Test backend API validation

---

**Last Updated**: May 27, 2026  
**Version**: 1.0  
**Status**: ✅ Frontend Implementation Complete
