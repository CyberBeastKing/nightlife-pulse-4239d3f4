import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'hawkly_onboarding_complete';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  fullLocationEnabled: boolean;
  completeOnboarding: (fullLocation: boolean) => void;
  resetOnboarding: () => void;
}

export function useOnboarding(): OnboardingState {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ONBOARDING_KEY) !== null;
  });
  
  const [fullLocationEnabled, setFullLocationEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(ONBOARDING_KEY);
    return stored ? JSON.parse(stored).fullLocation : true;
  });

  const completeOnboarding = (fullLocation: boolean) => {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify({
      fullLocation,
      completedAt: new Date().toISOString(),
    }));
    setHasCompletedOnboarding(true);
    setFullLocationEnabled(fullLocation);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(false);
    setFullLocationEnabled(true);
  };

  return {
    hasCompletedOnboarding,
    fullLocationEnabled,
    completeOnboarding,
    resetOnboarding,
  };
}
