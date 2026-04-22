import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { SuperAdminDashboard } from './dashboards/SuperAdminDashboard';
import { CompanyAdminDashboard } from './dashboards/CompanyAdminDashboard';
import { ManagerDashboard } from './dashboards/ManagerDashboard';

export function Dashboard() {
  const { user } = useAuth();

  // Agents have no dashboard — redirect to their personal feedback
  if (user?.role === 'websiteConfigurator') {
    return <Navigate to="/app/my-feedback" replace />;
  }

  return (
    <div className="space-y-6">
      <WelcomeBanner />
      {user?.role === 'superAdmin' && <SuperAdminDashboard />}
      {user?.role === 'companyAdmin' && <CompanyAdminDashboard />}
      {user?.role === 'manager' && <ManagerDashboard />}
    </div>
  );
}
