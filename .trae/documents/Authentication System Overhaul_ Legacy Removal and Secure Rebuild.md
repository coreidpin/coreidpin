## Context & Observation

* Your screenshots show the login page background still white, meaning the dark theme isn’t applied for the view you’re opening.

* You asked for: dark background, white text on login and registration, and DO NOT affect Navbar or Footer.

* Login can render in two ways in this app:

  1. Standalone route `/login` using `LoginPage`
  2. Landing overlay `LoginDialog` modal

* We must ensure BOTH are dark while keeping Navbar/Footer exactly as they are.

## Plan

### 1) Routing audit and targeted styling

* Confirm which path is displayed in your screenshots and ensure `appState === 'login'` renders `LoginPage` (standalone route).

* Keep `Navbar` and `Footer` unchanged by scoping dark background to the login content container only.

* Use design tokens (brand variables) rather than raw hex where possible.

### 2) Standalone LoginPage container

* Wrap only the main content in a container: `className="bg-[var(--bg-dark)] text-[var(--text-light)] min-h-[calc(100vh_-_navbar_-_footer)]"`.

* Keep inputs/icons consistent with registration: transparent inputs, white text and placeholders, border white/20, focus ring brand blue.

* Ensure no global class leaks to Navbar/Footer.

### 3) LoginDialog modal (mobile/landing)

* Keep `DialogContent` dark (`bg-[var(--card-dark)] text-[var(--text-light)] border-white/10`).

* Ensure divider, labels, and icons use white/70–80 with hover to white.

* This guarantees the modal is dark without modifying Navbar.

### 4) Design tokens alignment

* Use existing brand variables:

  * `--bg-dark` for page background (maps to desktop dark)

  * `--card-dark` for card panels

  * `--text-light` for primary text

  * `--ring-brand` for focus ring

* If any token is missing, add minimal CSS variables to `index.css` and apply only in the login containers.

### 5) QA steps

* Test mobile (320–480px) and desktop widths.

* Verify:

  * Page background is dark, text is white.

  * Navbar and Footer remain visually and behaviorally unchanged.

  * Inputs default/hover/focus consistent; placeholders legible.

* Confirm no other pages changed.

### 6) Deliverables

* Updated login (route) and login dialog (modal) with dark background and white text, scoped to containers.

* No changes to Navbar/Footer.

* Short list of color variables used for documentation.

## After Approval

* Implement scoped container classes in `LoginPage` and `LoginDialog` using brand tokens.

* Verify visually in dev build and share screenshots confirming dark background + white text with original Navbar/Footer intact.

