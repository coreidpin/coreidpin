/**
 * Core Design Tokens for CoreID Mobile Dashboard
 * Apple/Google/Nvidia-level polish
 */

// Brand Colors
export const colors = {
  // Primary
  coreBlue: '#3A66FF',
  coreBlueDark: '#2952E6',
  coreBlueLight: '#5B7FFF',
  
  // Secondary
  softGreen: '#38D98C',
  softGreenDark: '#2BC77A',
  softGreenLight: '#4DE19A',
  
  // Neutrals
  slateGray: '#64748B',
  slateGrayDark: '#475569',
  slateGrayLight: '#94A3B8',
  offWhite: '#F8FAFC',
  
  // Accents
  betaGold: '#F59E0B',
  betaGoldLight: '#FCD34D',
  
  // Semantic
  white: '#FFFFFF',
  black: '#0F172A',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',
} as const;

// Typography Scale (1.25 ratio)
export const typography = {
  // Font Families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// Spacing Scale (16px base unit)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  full: '9999px',
} as const;

// Animation Durations
export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    medium: '300ms',
    slow: '500ms',
    slower: '800ms',
  },
  
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Z-Index Layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

// Screen Breakpoints
export const breakpoints = {
  sm: '375px',   // iPhone SE
  md: '390px',   // iPhone 12/13
  lg: '428px',   // iPhone Pro Max
  xl: '768px',   // Tablet
} as const;
