/**
 * CoreIDPin Design System
 * ---------------------
 * Centralized design tokens for colors, typography, spacing, shadows, and animations.
 * 
 * Usage:
 * import { colors, typography, spacing } from '@/styles/designSystem';
 * 
 * @version 1.0.0
 * @date 2026-01-23
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Brand Colors
  brand: {
    primary: {
      50: '#EEF2FF',   // Lightest indigo
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',   // Primary brand color
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',   // Darkest indigo
    },
    secondary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',   // Success/Verified green
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    accent: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',   // Alert/Action amber
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',     // Green
    warning: '#F59E0B',     // Amber
    error: '#EF4444',       // Red
    info: '#3B82F6',        // Blue
  },

  // Neutral/Gray Scale (Tailwind Slate)
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Special Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Trust Score Colors (Gradient)
  trustScore: {
    low: '#EF4444',        // 0-30: Red
    medium: '#F59E0B',     // 31-60: Amber
    good: '#3B82F6',       // 61-80: Blue
    excellent: '#10B981',  // 81-100: Green
  },

  // Status Colors
  status: {
    active: '#10B981',     // Green
    pending: '#F59E0B',    // Amber
    inactive: '#94A3B8',   // Gray
    suspended: '#EF4444',  // Red
    verified: '#6366F1',   // Indigo
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
    display: ['Cal Sans', 'Inter', 'sans-serif'], // For marketing/hero text
  },

  fontSize: {
    // Use t-shirt sizing
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px (body text)
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px (h3)
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px (h2)
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px (h1)
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px (display)
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px (hero)
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  // Use t-shirt sizing mapped to Tailwind scale
  xs: '0.25rem',   // 4px  (gap-1, p-1)
  sm: '0.5rem',    // 8px  (gap-2, p-2)
  md: '1rem',      // 16px (gap-4, p-4) - Base unit
  lg: '1.5rem',    // 24px (gap-6, p-6)
  xl: '2rem',      // 32px (gap-8, p-8)
  '2xl': '3rem',   // 48px (gap-12, p-12)
  '3xl': '4rem',   // 64px (gap-16, p-16)
  '4xl': '6rem',   // 96px (gap-24, p-24)
  '5xl': '8rem',   // 128px (gap-32, p-32)
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px  - Small elements (badges, tags)
  md: '0.375rem',  // 6px  - Default (buttons, inputs)
  lg: '0.5rem',    // 8px  - Cards
  xl: '0.75rem',   // 12px - Large cards
  '2xl': '1rem',   // 16px - Hero cards
  '3xl': '1.5rem', // 24px - Premium components
  full: '9999px',  // Pill buttons, avatars
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  // Elevation scale (Material Design inspired)
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Colored shadows
  brand: '0 10px 40px -12px rgba(99, 102, 241, 0.4)',
  success: '0 10px 40px -12px rgba(16, 185, 129, 0.4)',
  error: '0 10px 40px -12px rgba(239, 68, 68, 0.4)',
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  // Brand gradients
  primary: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  secondary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  accent: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  
  // Dark gradients
  darkSlate: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
  darkIndigo: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)',
  
  // Light gradients
  lightBlue: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
  lightGreen: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
  
  // Mesh gradients (complex, modern)
  mesh: 'radial-gradient(at 40% 20%, #6366F1 0px, transparent 50%), radial-gradient(at 80% 0%, #8B5CF6 0px, transparent 50%), radial-gradient(at 0% 50%, #10B981 0px, transparent 50%)',
  
  // Trust score gradient (0-100)
  trustScore: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 30%, #3B82F6 60%, #10B981 100%)',
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const animations = {
  durations: {
    instant: 0,          // 0ms - No animation
    fast: 150,          // 150ms - Micro-interactions
    normal: 300,        // 300ms - Standard transitions
    slow: 500,          // 500ms - Complex animations
    slower: 1000,       // 1s - Page transitions
  },

  easings: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // Spring effect
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',             // Material Design
  },

  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    slideInUp: {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' },
    },
    slideInDown: {
      from: { transform: 'translateY(-100%)' },
      to: { transform: 'translateY(0)' },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
  },
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  // Mobile first approach
  sm: '640px',    // Small devices (phones)
  md: '768px',    // Medium devices (tablets)
  lg: '1024px',   // Large devices (laptops)
  xl: '1280px',   // Extra large (desktops)
  '2xl': '1536px', // Ultra wide
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

export const componentVariants = {
  button: {
    sizes: {
      sm: {
        height: '2rem',        // 32px
        padding: '0.5rem 1rem', // 8px 16px
        fontSize: typography.fontSize.sm,
      },
      md: {
        height: '2.5rem',      // 40px
        padding: '0.625rem 1.5rem', // 10px 24px
        fontSize: typography.fontSize.base,
      },
      lg: {
        height: '3rem',        // 48px
        padding: '0.75rem 2rem', // 12px 32px
        fontSize: typography.fontSize.lg,
      },
    },
    variants: {
      primary: {
        bg: colors.brand.primary[500],
        color: colors.white,
        hoverBg: colors.brand.primary[600],
      },
      secondary: {
        bg: colors.brand.secondary[500],
        color: colors.white,
        hoverBg: colors.brand.secondary[600],
      },
      outline: {
        bg: colors.transparent,
        color: colors.brand.primary[500],
        border: `1px solid ${colors.brand.primary[500]}`,
        hoverBg: colors.brand.primary[50],
      },
      ghost: {
        bg: colors.transparent,
        color: colors.neutral[700],
        hoverBg: colors.neutral[100],
      },
      danger: {
        bg: colors.semantic.error,
        color: colors.white,
        hoverBg: '#DC2626',
      },
    },
  },

  card: {
    variants: {
      default: {
        bg: colors.white,
        border: `1px solid ${colors.neutral[200]}`,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        shadow: shadows.sm,
      },
      elevated: {
        bg: colors.white,
        border: 'none',
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        shadow: shadows.lg,
      },
      premium: {
        bg: gradients.primary,
        border: 'none',
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        shadow: shadows.brand,
      },
    },
  },

  input: {
    sizes: {
      sm: {
        height: '2rem',
        padding: '0.5rem 0.75rem',
        fontSize: typography.fontSize.sm,
      },
      md: {
        height: '2.5rem',
        padding: '0.625rem 1rem',
        fontSize: typography.fontSize.base,
      },
      lg: {
        height: '3rem',
        padding: '0.75rem 1.25rem',
        fontSize: typography.fontSize.lg,
      },
    },
    states: {
      default: {
        bg: colors.white,
        border: `1px solid ${colors.neutral[300]}`,
        color: colors.neutral[900],
      },
      focus: {
        border: `2px solid ${colors.brand.primary[500]}`,
        outline: `0 0 0 3px ${colors.brand.primary[100]}`,
      },
      error: {
        border: `2px solid ${colors.semantic.error}`,
        outline: `0 0 0 3px rgba(239, 68, 68, 0.1)`,
      },
      disabled: {
        bg: colors.neutral[50],
        border: `1px solid ${colors.neutral[200]}`,
        color: colors.neutral[400],
        cursor: 'not-allowed',
      },
    },
  },
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const accessibility = {
  // Minimum touch target size (iOS/Android)
  minTouchTarget: '44px',
  
  // Focus indicator
  focusRing: {
    width: '2px',
    style: 'solid',
    color: colors.brand.primary[500],
    offset: '2px',
  },

  // Color contrast ratios (WCAG 2.1 AA)
  minContrastNormal: 4.5,   // Normal text
  minContrastLarge: 3,      // Large text (18pt+ or 14pt+ bold)
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color with transparency
 * @example colorWithAlpha(colors.brand.primary[500], 0.5) => 'rgba(99, 102, 241, 0.5)'
 */
export function colorWithAlpha(color: string, alpha: number): string {
  // Convert hex to RGBA
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get responsive value based on breakpoint
 * @example responsive({ base: '16px', md: '24px', lg: '32px' })
 */
export function responsive(values: Record<string, string>) {
  return Object.entries(values)
    .map(([bp, value]) => {
      if (bp === 'base') return value;
      return `@media (min-width: ${breakpoints[bp as keyof typeof breakpoints]}) { ${value} }`;
    })
    .join(' ');
}

/**
 * Combine class names conditionally
 * @example cn('base-class', condition && 'conditional-class')
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
  animations,
  breakpoints,
  zIndex,
  componentVariants,
  accessibility,
  colorWithAlpha,
  responsive,
  cn,
} as const;

export default designSystem;
