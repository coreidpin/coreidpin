/**
 * Haptic Feedback Utility
 * Provides haptic feedback for iOS and Android devices
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const haptics = {
  /**
   * Trigger haptic feedback
   * @param type - Type of haptic feedback
   */
  trigger: (type: HapticType = 'light') => {
    // Check if running on mobile device
    if (!('vibrate' in navigator)) {
      return;
    }

    // Vibration patterns for different haptic types
    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [30, 100, 30, 100, 30],
    };

    try {
      // Use the Vibration API
      const pattern = patterns[type];
      navigator.vibrate(pattern);
    } catch (error) {
      // Silently fail if vibration is not supported
      console.debug('Haptic feedback not supported');
    }
  },

  /**
   * Trigger light haptic feedback
   */
  light: () => haptics.trigger('light'),

  /**
   * Trigger medium haptic feedback
   */
  medium: () => haptics.trigger('medium'),

  /**
   * Trigger heavy haptic feedback
   */
  heavy: () => haptics.trigger('heavy'),

  /**
   * Trigger success haptic feedback
   */
  success: () => haptics.trigger('success'),

  /**
   * Trigger warning haptic feedback
   */
  warning: () => haptics.trigger('warning'),

  /**
   * Trigger error haptic feedback
   */
  error: () => haptics.trigger('error'),

  /**
   * Check if haptic feedback is supported
   */
  isSupported: (): boolean => {
    return 'vibrate' in navigator;
  },
};
