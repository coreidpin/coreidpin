# Design System Quick Reference Guide
## How to Use CoreIDPin Design Tokens

**For Developers** | Last Updated: January 23, 2026

---

## 🚀 **Getting Started**

### **Import the Design System**

```typescript
// Import everything you need
import { 
  colors, 
  typography, 
  spacing, 
  borderRadius, 
  shadows 
} from '@/styles/designSystem';

// Or import specific parts
import { colors } from '@/styles/designSystem';
```

---

## 🎨 **Colors**

### **Brand Colors (Primary, Secondary, Accent)**

```typescript
// ❌ BAD: Hardcoded colors
<div style={{ backgroundColor: '#6366F1' }}>

// ✅ GOOD: Use design system
<div style={{ backgroundColor: colors.brand.primary[500] }}>

// Available shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
colors.brand.primary[500]    // Main indigo
colors.brand.secondary[500]  // Success green
colors.brand.accent[500]     // Alert amber
```

### **Semantic Colors (Success, Error, Warning, Info)**

```typescript
// ✅ Use semantic colors for meaning
colors.semantic.success   // #10B981 (green)
colors.semantic.error     // #EF4444 (red)
colors.semantic.warning   // #F59E0B (amber)
colors.semantic.info      // #3B82F6 (blue)
```

### **Neutral Colors (Grays)**

```typescript
// ✅ For text, backgrounds, borders
colors.neutral[50]   // Lightest (backgrounds)
colors.neutral[500]  // Medium (secondary text)
colors.neutral[900]  // Darkest (primary text)

// Common patterns:
// - Primary text: colors.neutral[900]
// - Secondary text: colors.neutral[600]
// - Disabled text: colors.neutral[400]
// - Page background: colors.neutral[50]
// - Card background: colors.white
```

### **Special Colors**

```typescript
// Trust score colors
colors.trustScore.low        // 0-30: Red
colors.trustScore.medium     // 31-60: Amber  
colors.trustScore.good       // 61-80: Blue
colors.trustScore.excellent  // 81-100: Green

// Status colors
colors.status.active       // Green
colors.status.pending      // Amber
colors.status.inactive     // Gray
colors.status.suspended    // Red
colors.status.verified     // Indigo
```

### **Common Mistakes to Avoid**

```typescript
// ❌ DON'T use random hex colors
color: '#3b82f6'  // What is this? (inconsistent)

// ✅ DO use semantic tokens
color: colors.semantic.info  // Clear meaning

// ❌ DON'T mix old and new systems
import { colors as oldColors } from './oldTokens';  // NO!
import { colors } from '@/styles/designSystem';     // YES!

// ✅ DO be consistent
// Pick one system (design system) and use it everywhere
```

---

## ✍️ **Typography**

### **Font Sizes**

```typescript
// ⚠️ IMPORTANT: fontSize returns [size, lineHeight]
// Extract the size with [0]

// ❌ WRONG: Will cause TypeScript error
fontSize: typography.fontSize.base

// ✅ CORRECT: Extract first element
fontSize: typography.fontSize.base[0]  // '1rem'

// Available sizes:
typography.fontSize.xs[0]     // 12px
typography.fontSize.sm[0]     // 14px
typography.fontSize.base[0]   // 16px (default)
typography.fontSize.lg[0]     // 18px
typography.fontSize.xl[0]     // 20px
typography.fontSize['2xl'][0] // 24px (h3)
typography.fontSize['3xl'][0] // 30px (h2)
typography.fontSize['4xl'][0] // 36px (h1)
typography.fontSize['5xl'][0] // 48px (display)
typography.fontSize['6xl'][0] // 60px (hero)
```

### **Font Weights**

```typescript
// ✅ Semantic weight names
fontWeight: typography.fontWeight.normal    // 400
fontWeight: typography.fontWeight.medium    // 500
fontWeight: typography.fontWeight.semibold  // 600 (headings)
fontWeight: typography.fontWeight.bold      // 700 (emphasis)
fontWeight: typography.fontWeight.extrabold // 800 (hero)
```

### **Font Families**

```typescript
// ✅ Use design system fonts
fontFamily: typography.fontFamily.sans.join(', ')  // Inter
fontFamily: typography.fontFamily.mono.join(', ')  // JetBrains Mono
fontFamily: typography.fontFamily.display.join(', ') // Cal Sans (hero text)
```

### **Common Typography Patterns**

```typescript
// Page Heading (H1)
<h1 style={{
  fontSize: typography.fontSize['4xl'][0],
  fontWeight: typography.fontWeight.bold,
  color: colors.neutral[900],
}}>

// Section Heading (H2)
<h2 style={{
  fontSize: typography.fontSize['2xl'][0],
  fontWeight: typography.fontWeight.semibold,
  color: colors.neutral[800],
}}>

// Body Text
<p style={{
  fontSize: typography.fontSize.base[0],
  color: colors.neutral[700],
}}>

// Small Text / Captions
<span style={{
  fontSize: typography.fontSize.sm[0],
  color: colors.neutral[500],
}}>

// Code
<code style={{
  fontFamily: typography.fontFamily.mono.join(', '),
  fontSize: typography.fontSize.sm[0],
  backgroundColor: colors.neutral[100],
}}>
```

---

## 📏 **Spacing**

### **Spacing Scale**

```typescript
// ✅ Use t-shirt sizing
spacing.xs   // 4px  (tight gaps)
spacing.sm   // 8px  (compact spacing)
spacing.md   // 16px (default - use this 90% of the time)
spacing.lg   // 24px (card padding)
spacing.xl   // 32px (section spacing)
spacing['2xl'] // 48px (large sections)
spacing['3xl'] // 64px (hero sections)

// Common uses:
padding: spacing.md       // Card padding
gap: spacing.md           // Flex/grid gaps
margin: spacing.lg        // Section margins
paddingBottom: spacing.xl // Bottom spacing
```

### **Spacing Patterns**

```typescript
// Card with consistent padding
<Card style={{ padding: spacing.lg }}>

// Flex container with gap
<div style={{ 
  display: 'flex', 
  gap: spacing.md  // Replaces margin-right hacks
}}>

// Grid layout
<div style={{
  display: 'grid',
  gap: spacing.lg,
  gridTemplateColumns: 'repeat(3, 1fr)',
}}>
```

---

## 🔲 **Border Radius**

```typescript
// ✅ Consistent rounded corners
borderRadius.sm   // 4px  (badges, small elements)
borderRadius.md   // 6px  (buttons, inputs)
borderRadius.lg   // 8px  (cards)
borderRadius.xl   // 12px (large cards)
borderRadius['2xl'] // 16px (hero cards)
borderRadius.full // 9999px (pills, avatars)

// Common uses:
<button style={{ borderRadius: borderRadius.md }}>
<Card style={{ borderRadius: borderRadius.lg }}>
<Avatar style={{ borderRadius: borderRadius.full }}>
```

---

## 🌑 **Shadows (Elevation)**

```typescript
// ✅ Material Design-style elevation
boxShadow: shadows.none  // No shadow
boxShadow: shadows.sm    // Subtle (hover states)
boxShadow: shadows.md    // Default cards
boxShadow: shadows.lg    // Elevated cards
boxShadow: shadows.xl    // Modals, popovers
boxShadow: shadows['2xl'] // Hero elements

// Special shadows
boxShadow: shadows.brand   // Brand color shadow
boxShadow: shadows.success // Green shadow
boxShadow: shadows.error   // Red shadow

// Common pattern: Hover effect
<Card 
  onMouseEnter={(e) => e.currentTarget.style.boxShadow = shadows.lg}
  onMouseLeave={(e) => e.currentTarget.style.boxShadow = shadows.sm}
>
```

---

## 🎨 **Complete Component Example**

```typescript
import React from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/designSystem';

export function ExampleCard() {
  return (
    <div style={{
      // Layout
      padding: spacing.lg,
      margin: spacing.md,
      
      // Colors
      backgroundColor: colors.white,
      borderColor: colors.neutral[200],
      borderWidth: '1px',
      borderStyle: 'solid',
      
      // Shape
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md,
    }}>
      <h2 style={{
        fontSize: typography.fontSize['2xl'][0],
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[900],
        marginBottom: spacing.md,
      }}>
        Card Title
      </h2>
      
      <p style={{
        fontSize: typography.fontSize.base[0],
        color: colors.neutral[600],
        lineHeight: typography.lineHeight.relaxed,
      }}>
        Card content goes here.
      </p>
      
      <button style={{
        marginTop: spacing.md,
        padding: `${spacing.sm} ${spacing.md}`,
        backgroundColor: colors.brand.primary[500],
        color: colors.white,
        border: 'none',
        borderRadius: borderRadius.md,
        fontSize: typography.fontSize.sm[0],
        fontWeight: typography.fontWeight.semibold,
        cursor: 'pointer',
      }}>
        Action Button
      </button>
    </div>
  );
}
```

---

## ⚡ **Migration Checklist**

When refactoring a component:

```typescript
// Step 1: Add import
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/designSystem';

// Step 2: Find all hardcoded values
// Search for: '#', 'px', 'rem'

// Step 3: Replace colors
// Before: color: '#6366F1'
// After:  color: colors.brand.primary[500]

// Step 4: Replace spacing
// Before: padding: '16px'
// After:  padding: spacing.md

// Step 5: Replace font sizes
// Before: fontSize: '24px'
// After:  fontSize: typography.fontSize['2xl'][0]

// Step 6: Replace border radius
// Before: borderRadius: '8px'
// After:  borderRadius: borderRadius.lg

// Step 7: Replace shadows
// Before: boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
// After:  boxShadow: shadows.md

// Step 8: Test!
```

---

## 🚨 **Common Errors & Solutions**

### **Error 1: TypeScript fontSize error**

```typescript
// ❌ ERROR: Type 'readonly [string, object]' is not assignable to type 'string'
fontSize: typography.fontSize.base

// ✅ FIX: Extract first element
fontSize: typography.fontSize.base[0]
```

### **Error 2: Can't find module**

```typescript
// ❌ ERROR: Cannot find module '@/styles/designSystem'
import { colors } from '@/styles/designSystem';

// ✅ FIX: Use relative path or check tsconfig.json
import { colors } from '../styles/designSystem';
// OR ensure tsconfig.json has: "paths": { "@/*": ["src/*"] }
```

### **Error 3: Color not defined**

```typescript
// ❌ ERROR: Property '1000' does not exist on type...
colors.brand.primary[1000]

// ✅ FIX: Use valid shades (50-900)
colors.brand.primary[900]  // Darkest shade
```

---

## 📊 **Design System Cheat Sheet**

### **Common Patterns**

| Element | Color | Font Size | Spacing | Border Radius |
|---------|-------|-----------|---------|---------------|
| **Page Title** | `neutral[900]` | `4xl` | `mb: lg` | - |
| **Section Heading** | `neutral[800]` | `2xl` | `mb: md` | - |
| **Body Text** | `neutral[700]` | `base` | - | - |
| **Secondary Text** | `neutral[500]` | `sm` | - | - |
| **Button Primary** | `brand.primary[500]` | `sm` | `sm md` | `md` |
| **Card** | `white` bg | `base` | `lg` | `lg` |
| **Badge** | `semantic.*` | `xs` | `xs sm` | `full` |
| **Input** | `neutral[900]` | `base` | `sm md` | `md` |

### **Quick Copy-Paste**

```typescript
// Headings
<h1 style={{ fontSize: typography.fontSize['4xl'][0], fontWeight: typography.fontWeight.bold, color: colors.neutral[900] }}>
<h2 style={{ fontSize: typography.fontSize['2xl'][0], fontWeight: typography.fontWeight.semibold, color: colors.neutral[800] }}>
<h3 style={{ fontSize: typography.fontSize.xl[0], fontWeight: typography.fontWeight.semibold, color: colors.neutral[700] }}>

// Buttons
<button style={{ padding: `${spacing.sm} ${spacing.md}`, backgroundColor: colors.brand.primary[500], color: colors.white, borderRadius: borderRadius.md, fontSize: typography.fontSize.sm[0], fontWeight: typography.fontWeight.semibold }}>

// Cards
<div style={{ padding: spacing.lg, backgroundColor: colors.white, borderRadius: borderRadius.lg, boxShadow: shadows.md }}>

// Flex Container
<div style={{ display: 'flex', gap: spacing.md, alignItems: 'center' }}>

// Grid Container
<div style={{ display: 'grid', gap: spacing.lg, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
```

---

## 🎯 **Best Practices**

1. **Always use design system tokens** - Never hardcode colors, sizes, or spacing
2. **Be consistent** - If you use `spacing.md` for one card, use it for all cards
3. **Use semantic names** - Prefer `colors.semantic.success` over `colors.brand.secondary[500]`
4. **Test responsively** - Use design tokens on mobile, tablet, desktop
5. **Extract fontSize with [0]** - Remember the tuple!
6. **Comment your code** - Help others understand why you chose specific tokens

---

## 📚 **Additional Resources**

- **Design System File:** `src/styles/designSystem.ts`
- **Showcase Page:** `/design-system` (live preview)
- **Design Audit:** `docs/design/DESIGN_AUDIT.md`
- **Migration Progress:** `docs/design/PHASE2_PROGRESS.md`

---

**Questions?** Check the design system file or view `/design-system` page for live examples.

**Last Updated:** January 23, 2026
