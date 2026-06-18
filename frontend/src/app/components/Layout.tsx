// src/components/Layout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { OnboardingTour } from '../components/OnboardingTour';
import { useOnboarding } from '../hooks/useOnboarding';
import { getTourSteps } from '../config/tourSteps';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../components/ui/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language } = useLanguage();
  const { user } = useAuth();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const isAr = language === 'ar';

  const tourSteps = getTourSteps(isAr, user?.role);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side={isAr ? 'right' : 'left'} className="p-0 w-64">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Main navigation menu for mobile devices</SheetDescription>
            </SheetHeader>
            <Sidebar isCollapsed={false} onToggle={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            'transition-all duration-300',
            isAr
              ? sidebarCollapsed ? 'lg:pr-16' : 'lg:pr-64'
              : sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
          )}
        >
          <TopBar onMenuClick={() => setMobileMenuOpen(true)} />

          <main className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>

        {/* Onboarding Tour */}
        <OnboardingTour
          steps={tourSteps}
          isOpen={showOnboarding}
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      </div>
    </ProtectedRoute>
  );
}