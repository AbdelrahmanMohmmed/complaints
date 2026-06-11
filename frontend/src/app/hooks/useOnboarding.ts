// src/hooks/useOnboarding.ts
import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'ara2kom_onboarding_completed';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user has already completed onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Small delay to let the app render first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setIsReady(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    setIsReady(true);
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    setIsReady(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    isReady,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}