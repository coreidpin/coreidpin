# Brand Style Guide

## Colors
- Primary: `#32F08C` (rgb(50, 240, 140))
- Secondary: `#7BB8FF` (rgb(123, 184, 255))
- Accent: `#BFA5FF` (rgb(191, 165, 255))
- Danger: `#FF4D4F` (rgb(255, 77, 79))
- Background (Dark): `#0B132B` (rgb(11, 19, 43))
- Foreground (Text on Dark): `#FFFFFF` (rgb(255, 255, 255))

## CSS Custom Properties
Defined in `src/index.css`:
```
:root {
  --brand-primary: #32f08c;
  --brand-primary-contrast: #0b132b;
  --brand-secondary: #7bb8ff;
  --brand-accent: #bfa5ff;
  --brand-danger: #ff4d4f;
  --brand-bg: #0b132b;
  --brand-fg: #ffffff;
}
```

## Button Variants
- Default: background `var(--brand-primary)`, text `var(--brand-primary-contrast)`, hover/active reduced opacity
- Outline: border `var(--brand-primary)`, text `var(--brand-primary)`, hover background `var(--brand-primary)` with contrast text
- Secondary: background `var(--brand-secondary)`, contrast text
- Destructive: background `var(--brand-danger)`, white text
- Ghost/Link: text `var(--brand-primary)`; ghost hover fills primary

## Accessibility
- Ensure contrast AA for text against backgrounds:
  - Foreground on Dark BG meets AA
  - Primary buttons use dark contrast text on vivid background

## States
- Default, Hover (opacity 90%), Active (opacity 80%), Disabled (opacity 50%)

## Usage
- Navbar: background `var(--brand-bg)`, text `var(--brand-fg)`
- Auth Buttons: use `Button` variants for consistent states

