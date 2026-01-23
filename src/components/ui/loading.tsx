import React from 'react';
import { Loader2 } from 'lucide-react';
import { colors, spacing, borderRadius } from '../../styles/designSystem';

/**
 * Loading States Components
 * 
 * Reusable loading indicators using design system tokens.
 * Use these instead of custom spinners throughout the app.
 */

// ============================================================================
// SPINNER (General Purpose)
// ============================================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function Spinner({ size = 'md', color = colors.brand.primary[500], className = '' }: SpinnerProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <Loader2 
      className={`animate-spin ${className}`}
      size={sizeMap[size]} 
      style={{ color }}
    />
  );
}

// ============================================================================
// SKELETON (For Content Placeholders)
// ============================================================================

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  circle?: boolean;
}

export function Skeleton({ 
  width = '100%', 
  height = '1rem', 
  className = '',
  circle = false 
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width,
        height,
        backgroundColor: colors.neutral[200],
        borderRadius: circle ? borderRadius.full : borderRadius.md,
      }}
    />
  );
}

// ============================================================================
// CARD SKELETON (For Dashboard Cards)
// ============================================================================

export function CardSkeleton() {
  return (
    <div style={{
      padding: spacing.lg,
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.neutral[200]}`,
    }}>
      {/* Header */}
      <div style={{ marginBottom: spacing.md }}>
        <Skeleton width="60%" height="1.5rem" />
      </div>
      
      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="90%" height="1rem" />
        <Skeleton width="80%" height="1rem" />
      </div>
      
      {/* Footer */}
      <div style={{ marginTop: spacing.lg, display: 'flex', gap: spacing.sm }}>
        <Skeleton width="5rem" height="2rem" />
        <Skeleton width="5rem" height="2rem" />
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD SKELETON (For Full Dashboard Loading)
// ============================================================================

export function DashboardSkeleton() {
  return (
    <div style={{ padding: spacing.xl, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Card */}
      <div style={{ marginBottom: spacing.xl }}>
        <Skeleton width="100%" height="200px" />
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: spacing.md,
        marginBottom: spacing.xl,
      }}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Activity Feed */}
      <Skeleton width="100%" height="300px" />
    </div>
  );
}

// ============================================================================
// BUTTON LOADING STATE (Inline Spinner)
// ============================================================================

interface ButtonLoadingProps {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}

export function ButtonLoading({ 
  children, 
  loading = false, 
  loadingText = 'Loading...',
  disabled = false,
  onClick,
  variant = 'default',
  className = ''
}: ButtonLoadingProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.sm,
        padding: `${spacing.sm} ${spacing.md}`,
        backgroundColor: variant === 'default' ? colors.brand.primary[500] : 
                        variant === 'secondary' ? colors.neutral[100] : 
                        colors.white,
        color: variant === 'default' ? colors.white : colors.neutral[900],
        border: variant === 'outline' ? `1px solid ${colors.neutral[300]}` : 'none',
        borderRadius: borderRadius.md,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.6 : 1,
      }}
    >
      {loading && <Spinner size="sm" color={variant === 'default' ? colors.white : colors.brand.primary[500]} />}
      {loading ? loadingText : children}
    </button>
  );
}

// ============================================================================
// PAGE LOADING (Full Screen)
// ============================================================================

export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: spacing.md,
      backgroundColor: colors.neutral[50],
    }}>
      <Spinner size="lg" />
      <p style={{
        color: colors.neutral[600],
        fontSize: '1rem',
      }}>
        {message}
      </p>
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// 1. Simple Spinner
<Spinner size="md" />

// 2. Content Placeholder
<Skeleton width="200px" height="20px" />

// 3. Card Loading
<CardSkeleton />

// 4. Dashboard Loading
<DashboardSkeleton />

// 5. Button with Loading
<ButtonLoading loading={isSubmitting} loadingText="Saving...">
  Save Changes
</ButtonLoading>

// 6. Full Page Loading
<PageLoading message="Loading dashboard..." />
*/
