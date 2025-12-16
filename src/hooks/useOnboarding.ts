/**
 * useOnboarding Hook - Manage onboarding flow state
 * Shows welcome modal and notification permission for new users
 */

import { useState, useEffect } from 'react';

interface OnboardingState {
  showWelcome: boolean;
  showNotificationPermission: boolean;
  hasCompletedOnboarding: boolean;
}

const ONBOARDING_STORAGE_KEY = 'gidipin_onboarding_complete';
const NOTIFICATION_PERMISSION_KEY = 'gidipin_notification_permission_asked';

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    showWelcome: false,
    showNotificationPermission: false,
    hasCompletedOnboarding: false,
  });

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    const hasAskedNotification = localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === 'true';

    if (!hasCompleted) {
      // New user - show welcome modal
      setState({
        showWelcome: true,
        showNotificationPermission: false,
        hasCompletedOnboarding: false,
      });
    } else if (!hasAskedNotification && Notification.permission === 'default') {
      // Returning user who hasn't been asked for notification permission
      setState({
        showWelcome: false,
        showNotificationPermission: true,
        hasCompletedOnboarding: true,
      });
    } else {
      setState({
        showWelcome: false,
        showNotificationPermission: false,
        hasCompletedOnboarding: true,
      });
    }
  }, []);

  const completeWelcome = () => {
    setState(prev => ({
      ...prev,
      showWelcome: false,
      showNotificationPermission: true, // Show notification modal after welcome
    }));
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  };

  const handleNotificationAllow = async () => {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      
      if (permission === 'granted') {
        // Show a test notification
        new Notification('GidiPIN Notifications Enabled!', {
          body: 'You\'ll now receive updates about your sessions and messages.',
          icon: '/logo.png', // Update with your logo path
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setState(prev => ({
        ...prev,
        showNotificationPermission: false,
        hasCompletedOnboarding: true,
      }));
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
    }
  };

  const handleNotificationDeny = () => {
    setState(prev => ({
      ...prev,
      showNotificationPermission: false,
      hasCompletedOnboarding: true,
    }));
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
  };

  const closeWelcome = () => {
    setState(prev => ({
      ...prev,
      showWelcome: false,
    }));
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  };

  const closeNotification = () => {
    setState(prev => ({
      ...prev,
      showNotificationPermission: false,
    }));
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(NOTIFICATION_PERMISSION_KEY);
    setState({
      showWelcome: true,
      showNotificationPermission: false,
      hasCompletedOnboarding: false,
    });
  };

  return {
    showWelcome: state.showWelcome,
    showNotificationPermission: state.showNotificationPermission,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    completeWelcome,
    handleNotificationAllow,
    handleNotificationDeny,
    closeWelcome,
    closeNotification,
    resetOnboarding, // For testing
  };
}
