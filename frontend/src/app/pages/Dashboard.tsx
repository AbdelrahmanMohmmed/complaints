import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { CompanyAdminDashboard } from './dashboards/CompanyAdminDashboard';

export function Dashboard() {
  const { user } = useAuth();

  // Agents have no dashboard — redirect to their personal feedback
  if (user?.role === 'websiteConfigurator') {
    return <Navigate to="/app/my-feedback" replace />;
  }

  return (
    <div className="space-y-6">
      <WelcomeBanner />
      {user?.role === 'companyAdmin' && <CompanyAdminDashboard />}
      {user?.role === 'manager' && <CompanyAdminDashboard />}
    </div>
  );
}
