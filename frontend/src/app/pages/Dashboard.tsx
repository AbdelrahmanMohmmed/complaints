import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { CompanyAdminDashboard } from './dashboards/CompanyManagerDashboard';

export function Dashboard() {
  const { user } = useAuth();

  // Website Configurators have no dashboard — redirect to integrations
  if (user?.role === 'websiteConfigurator') {
    return <Navigate to="/app/integrations" replace />;
  }

  return (
    <div className="space-y-6">
      <WelcomeBanner />
      {/* Manager and Supervisor both see the dashboard */}
      {(user?.role === 'manager' || user?.role === 'customerServiceSupervisor') && (
        <CompanyAdminDashboard />
      )}
    </div>
  );
}
