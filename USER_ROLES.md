# User Roles and Permissions

This document outlines the roles and permissions for users in the FCDS CMS system. The system supports four user roles: Super Admin, Company Admin, Manager, and Agent. Each role has specific capabilities and access to different parts of the application.

## Role Overview

### Super Admin
**Description**: The highest level of administrative access with system-wide oversight and management capabilities.

**What they can do**:
- Manage domains across the entire system
- Create, update, and delete companies
- View system-wide analytics and logs
- Manage users across all companies (including assigning roles)
- Access all feedback/complaints system-wide
- Configure system settings

**What they can see**:
- System dashboard with global KPIs (total companies, active companies, total users, total complaints, average sentiment)
- Domain management interface
- Company management interface
- System analytics and performance metrics
- System logs and audit trails
- All feedback lists and details
- User management across all companies
- Reports and analytics for the entire system

**Routes accessible**:
- `/app/dashboard` (Super Admin Dashboard)
- `/app/domains`
- `/app/companies`
- `/app/system-analytics`
- `/app/logs`
- `/app/feedback`
- `/app/feedback/:id`
- `/app/users`
- `/app/settings`

### Company Admin
**Description**: Administrative access limited to their specific company, responsible for company-level configuration and user management.

**What they can do**:
- Configure integration settings for their company
- Manage feedback categories for their company
- Manage users within their company (managers and agents)
- View and manage feedback for their company
- Access company-level reports and analytics
- Configure company settings

**What they can see**:
- Company dashboard with company-specific KPIs (feedback stats, sentiment analysis, resolution times)
- Integration settings interface
- Category management interface
- User management for their company
- Feedback lists and details for their company
- Reports and team performance analytics
- Company settings

**Routes accessible**:
- `/app/dashboard` (Company Admin Dashboard)
- `/app/integrations`
- `/app/categories`
- `/app/users`
- `/app/feedback`
- `/app/feedback/:id`
- `/app/reports`
- `/app/team-performance`
- `/app/settings`

### Manager
**Description**: Team leader responsible for overseeing agents and managing feedback assignments within their team.

**What they can do**:
- View and manage feedback assigned to their team
- Assign feedback to specific agents
- Monitor team performance and agent workloads
- Access team reports and analytics
- Update feedback status and add notes
- View feedback details and history

**What they can see**:
- Manager dashboard with team metrics (feedback status distribution, agent performance, pending assignments)
- Feedback lists and details
- Team performance reports
- Agent assignment and workload information
- Feedback status and priority tracking

**Routes accessible**:
- `/app/dashboard` (Manager Dashboard)
- `/app/feedback`
- `/app/feedback/:id`
- `/app/reports`
- `/app/team-performance`
- `/app/settings`

### Agent
**Description**: Front-line support staff responsible for handling assigned feedback/complaints.

**What they can do**:
- View feedback assigned to them
- Update feedback status (open → in progress → resolved/closed)
- Add notes and updates to feedback
- View feedback details and customer information
- Manage their profile and preferences
- Access their personal performance metrics

**What they can see**:
- Personal feedback dashboard showing assigned complaints
- Detailed view of each assigned feedback item
- Customer contact information and complaint details
- Feedback status, priority, and sentiment
- Personal profile with performance statistics
- Settings for notifications and preferences

**Routes accessible**:
- `/app/my-feedback` (redirected from dashboard)
- `/app/profile`
- `/app/settings`

## Role Hierarchy and Access Control

```
Super Admin
├── Company Admin
│   ├── Manager
│   │   └── Agent
```

- **Super Admin**: Full system access, can manage everything
- **Company Admin**: Company-scoped access, can manage their company's users and settings
- **Manager**: Team-scoped access, can manage feedback assignments within their team
- **Agent**: Individual access, can only manage their assigned feedback

## Security Notes

- All routes are protected by role-based access control (RBAC)
- Backend validation is required to enforce permissions (frontend checks are client-side hints only)
- Users can only access data within their permission scope
- JWT tokens contain role information for authorization
- Company ID is required for all roles except Super Admin</content>
<parameter name="filePath">e:\FCDS_CMS\Frontend\New folder\Responsive SaaS UI Design\USER_ROLES.md