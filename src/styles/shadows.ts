/**
 * Shadow Utilities for CoreID
 * Soft, layered elevation system
 */

export const shadows = {
  // Elevation 0 - No shadow
  none: 'none',
  
  // Elevation 1 - Subtle lift (cards at rest)
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  
  // Elevation 2 - Medium lift (cards on hover, dropdowns)
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  
  // Elevation 3 - High lift (modals, popovers)
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  
  // Elevation 4 - Maximum lift (tooltips, overlays)
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Colored shadows for brand elements
  blue: '0 10px 20px -5px rgba(58, 102, 255, 0.3)',
  green: '0 10px 20px -5px rgba(56, 217, 140, 0.3)',
  gold: '0 4px 12px -2px rgba(245, 158, 11, 0.4)',
} as const;

/**
 * Glass-morphism effect
 * Apple-style translucent backgrounds
 */
export const glassMorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: shadows.md,
  },
  
  dark: {
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(10px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: shadows.md,
  },
} as const;

/**
 * Gradient utilities
 */
export const gradients = {
  // Brand gradients
  bluePrimary: 'linear-gradient(135deg, #3A66FF 0%, #5B7FFF 100%)',
  greenSecondary: 'linear-gradient(135deg, #38D98C 0%, #4DE19A 100%)',
  goldAccent: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
  
  // Subtle overlays
  whiteOverlay: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%)',
  blackOverlay: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%)',
  
  // Chart fills
  chartBlue: 'linear-gradient(180deg, rgba(58, 102, 255, 0.2) 0%, rgba(58, 102, 255, 0) 100%)',
} as const;

/**
 * Helper function to create custom shadow
 */
export function createShadow(
  y: number,
  blur: number,
  opacity: number = 0.1,
  color: string = '0, 0, 0'
): string {
  return `0 ${y}px ${blur}px 0 rgba(${color}, ${opacity})`;
}

/**
 * Layered shadow for premium cards
 */
export const premiumCardShadow = [
  shadows.sm,
  '0 8px 16px -4px rgba(0, 0, 0, 0.08)',
].join(', ');
