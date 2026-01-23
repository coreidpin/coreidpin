import React from 'react';
import { colors, typography, spacing, borderRadius, shadows, gradients } from '../styles/designSystem';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';

/**
 * Design System Showcase Page
 * 
 * This page demonstrates all design system tokens in action.
 * Visit /design-system to see this page.
 * 
 * Usage: Add to Router.tsx:
 * <Route path="/design-system" element={<DesignSystemShowcase />} />
 */
export function DesignSystemShowcase() {
  return (
    <div style={{ 
      padding: spacing['2xl'],
      backgroundColor: colors.neutral[50],
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: spacing['2xl'] }}>
          <h1 style={{
            fontSize: typography.fontSize['4xl'][0],
            fontWeight: typography.fontWeight.bold,
            color: colors.neutral[900],
            marginBottom: spacing.md,
          }}>
            🎨 CoreIDPin Design System
          </h1>
          <p style={{
            fontSize: typography.fontSize.lg[0],
            color: colors.neutral[600],
          }}>
            Live demonstration of all design tokens and components
          </p>
        </div>

        {/* Colors Section */}
        <section style={{ marginBottom: spacing['2xl'] }}>
          <h2 style={{
            fontSize: typography.fontSize['2xl'][0],
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            marginBottom: spacing.lg,
          }}>
            Colors
          </h2>

          {/* Brand Colors */}
          <h3 style={{
            fontSize: typography.fontSize.lg[0],
            fontWeight: typography.fontWeight.medium,
            color: colors.neutral[700],
            marginBottom: spacing.md,
          }}>
            Brand Colors
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: spacing.md,
            marginBottom: spacing.xl,
          }}>
            {Object.entries(colors.brand.primary).map(([shade, color]) => (
              <div key={shade} style={{ textAlign: 'center' }}>
                <div style={{
                  height: '80px',
                  backgroundColor: color,
                  borderRadius: borderRadius.md,
                  marginBottom: spacing.sm,
                  boxShadow: shadows.sm,
                }}></div>
                <div style={{ fontSize: typography.fontSize.xs[0], color: colors.neutral[600] }}>
                  Primary {shade}
                </div>
                <div style={{ fontSize: typography.fontSize.xs[0], color: colors.neutral[400], fontFamily: typography.fontFamily.mono.join(', ') }}>
                  {color}
                </div>
              </div>
            ))}
          </div>

          {/* Semantic Colors */}
          <h3 style={{
            fontSize: typography.fontSize.lg[0],
            fontWeight: typography.fontWeight.medium,
            color: colors.neutral[700],
            marginBottom: spacing.md,
          }}>
            Semantic Colors
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: spacing.md,
            marginBottom: spacing.xl,
          }}>
            {Object.entries(colors.semantic).map(([name, color]) => (
              <div key={name} style={{ textAlign: 'center' }}>
                <div style={{
                  height: '80px',
                  backgroundColor: color,
                  borderRadius: borderRadius.md,
                  marginBottom: spacing.sm,
                  boxShadow: shadows.sm,
                }}></div>
                <div style={{ fontSize: typography.fontSize.sm[0], color: colors.neutral[900], textTransform: 'capitalize' }}>
                  {name}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section style={{ marginBottom: spacing['2xl'] }}>
          <h2 style={{
            fontSize: typography.fontSize['2xl'][0],
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            marginBottom: spacing.lg,
          }}>
            Typography
          </h2>

          <div style={{ 
            backgroundColor: colors.white,
            padding: spacing.xl,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.md,
          }}>
            {['6xl', '5xl', '4xl', '3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xs'].map((size) => (
              <div key={size} style={{ marginBottom: spacing.md }}>
                <span style={{
                  fontSize: typography.fontSize[size as keyof typeof typography.fontSize][0],
                  color: colors.neutral[900],
                }}>
                  {size.toUpperCase()} - The quick brown fox jumps over the lazy dog
                </span>
                <code style={{
                  marginLeft: spacing.md,
                  fontSize: typography.fontSize.xs[0],
                  color: colors.neutral[500],
                  fontFamily: typography.fontFamily.mono.join(', '),
                }}>
                  {typography.fontSize[size as keyof typeof typography.fontSize][0]}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* Spacing Section */}
        <section style={{ marginBottom: spacing['2xl'] }}>
          <h2 style={{
            fontSize: typography.fontSize['2xl'][0],
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            marginBottom: spacing.lg,
          }}>
            Spacing Scale
          </h2>

          <div style={{ 
            backgroundColor: colors.white,
            padding: spacing.xl,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.md,
          }}>
            {Object.entries(spacing).map(([size, value]) => (
              <div key={size} style={{ 
                marginBottom: spacing.md,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
              }}>
                <code style={{
                  fontSize: typography.fontSize.sm[0],
                  fontFamily: typography.fontFamily.mono.join(', '),
                  color: colors.neutral[600],
                  width: '80px',
                }}>
                  {size}
                </code>
                <div style={{
                  height: '20px',
                  width: value,
                  backgroundColor: colors.brand.primary[500],
                  borderRadius: borderRadius.sm,
                }}></div>
                <span style={{ 
                  fontSize: typography.fontSize.sm[0],
                  color: colors.neutral[500],
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Shadows Section */}
        <section style={{ marginBottom: spacing['2xl'] }}>
          <h2 style={{
            fontSize: typography.fontSize['2xl'][0],
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            marginBottom: spacing.lg,
          }}>
            Shadows (Elevation)
          </h2>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: spacing.xl,
          }}>
            {Object.entries(shadows).filter(([key]) => !key.includes('inner') && !key.includes('brand')).map(([name, shadow]) => (
              <div key={name} style={{ textAlign: 'center' }}>
                <div style={{
                  height: '100px',
                  backgroundColor: colors.white,
                  borderRadius: borderRadius.lg,
                  boxShadow: shadow,
                  marginBottom: spacing.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: typography.fontSize.lg[0],
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.neutral[700],
                }}>
                  {name}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius Section */}
        <section style={{ marginBottom: spacing['2xl'] }}>
          <h2 style={{
            fontSize: typography.fontSize['2xl'][0],
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            marginBottom: spacing.lg,
          }}>
            Border Radius
          </h2>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: spacing.lg,
          }}>
            {Object.entries(borderRadius).map(([name, radius]) => (
              <div key={name} style={{ textAlign: 'center' }}>
                <div style={{
                  height: '80px',
                  width: '80px',
                  margin: '0 auto',
                  backgroundColor: colors.brand.primary[500],
                  borderRadius: radius,
                  marginBottom: spacing.sm,
                }}></div>
                <div style={{ fontSize: typography.fontSize.sm[0], color: colors.neutral[700], fontWeight: typography.fontWeight.medium }}>
                  {name}
                </div>
                <code style={{ fontSize: typography.fontSize.xs[0], color: colors.neutral[500], fontFamily: typography.fontFamily.mono.join(', ') }}>
                  {radius}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* Gradients Section */}
        <section style={{ marginBottom: spacing['2xl'] }}>
          <h2 style={{
            fontSize: typography.fontSize['2xl'][0],
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            marginBottom: spacing.lg,
          }}>
            Gradients
          </h2>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.lg,
          }}>
            {Object.entries(gradients).map(([name, gradient]) => (
              <div key={name}>
                <div style={{
                  height: '120px',
                  background: gradient,
                  borderRadius: borderRadius.xl,
                  marginBottom: spacing.sm,
                  boxShadow: shadows.lg,
                }}></div>
                <div style={{ 
                  fontSize: typography.fontSize.sm[0], 
                  color: colors.neutral[700],
                  fontWeight: typography.fontWeight.medium,
                  textTransform: 'capitalize',
                }}>
                  {name}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Components Section */}
        <section style={{ marginBottom: spacing['2xl'] }}>
          <h2 style={{
            fontSize: typography.fontSize['2xl'][0],
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            marginBottom: spacing.lg,
          }}>
            Components (Using Design System)
          </h2>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing.lg,
          }}>
            {/* Buttons */}
            <Card>
              <CardHeader>
                <h3 style={{ 
                  fontSize: typography.fontSize.lg[0],
                  fontWeight: typography.fontWeight.semibold,
                }}>
                  Buttons
                </h3>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <Button variant="default">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive">Danger Button</Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <h3 style={{ 
                  fontSize: typography.fontSize.lg[0],
                  fontWeight: typography.fontWeight.semibold,
                }}>
                  Badges
                </h3>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md }}>
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </CardContent>
            </Card>

            {/* Cards */}
            <Card>
              <CardHeader>
                <h3 style={{ 
                  fontSize: typography.fontSize.lg[0],
                  fontWeight: typography.fontWeight.semibold,
                }}>
                  Card Example
                </h3>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: typography.fontSize.sm[0], color: colors.neutral[600] }}>
                  This is a card component using the design system.  
                  All spacing, colors, and typography are from centralized tokens.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div style={{ 
          marginTop: spacing['3xl'],
          padding: spacing.xl,
          backgroundColor: colors.white,
          borderRadius: borderRadius.lg,
          boxShadow: shadows.md,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: typography.fontSize.base[0], color: colors.neutral[600] }}>
            ✅ Design System is <strong>live and functional</strong>!
          </p>
          <p style={{ fontSize: typography.fontSize.sm[0], color: colors.neutral[500], marginTop: spacing.sm }}>
            All components on this page use tokens from <code style={{ 
              fontFamily: typography.fontFamily.mono.join(', '),
              backgroundColor: colors.neutral[100],
              padding: '2px 6px',
              borderRadius: borderRadius.sm,
            }}>src/styles/designSystem.ts</code>
          </p>
        </div>

      </div>
    </div>
  );
}
