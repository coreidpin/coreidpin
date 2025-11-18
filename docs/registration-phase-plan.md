# Registration → Dashboard Journey Review and Phase Plan

## Executive Summary
- Frontend registration now posts to backend `/register` and returns tokens.
- CSRF is disabled for `/register` to streamline onboarding; CSRF is still required for other mutating endpoints.
- After successful registration, users are redirected to `/dashboard` and see an email verification modal; dashboard remains fully usable while unverified.
- Email link verification sets `email_verified=true` server-side; the modal is removed on next load.
- After email verification, a phone OTP flow verifies the phone and activates PIN by setting it to the verified phone.
- Remaining work focuses on TypeScript fixes, environment configuration (SMS), and tests/observability.

## Journey Overview
1. User navigates to Get Started (`/get-started`).
2. User fills registration form and submits.
3. Backend creates the auth user and sends verification link/token.
4. Frontend shows a verification prompt/modal; dashboard remains fully accessible while unverified.
5. Email verification via link updates `email_verified=true`; the prompt disappears on next load and the user continues in the dashboard.

## Current Implementation (Full Scale)
- Backend routes implement the full flow with validation, rate limiting, KV audit trail, and Resend email delivery:
  - Registration: `supabase/functions/server/routes/auth.tsx:43-299`
  - Send verification (Resend): `supabase/functions/server/routes/auth.tsx:601-643`
  - Confirm verification (token-based): `supabase/functions/server/routes/auth.tsx:652-694`
  - Login with rate limiting and audit: `supabase/functions/server/routes/auth.tsx:356-521`
  - Dev test coverage for register → verify → login: `supabase/functions/tests/auth_flow_test.ts:4-42`
- API client exposes typed methods aligned to the backend:
  - `register(...)`: `src/utils/api.ts:127-151`
  - `setSessionCookie(...)`: `src/utils/api.ts:144-160`
  - `validateRegistration(...)`: `src/utils/api.ts:104-125`
  - `sendVerificationEmail(...)`: `src/utils/api.ts:559-581`
  - `verifyEmailCode(...)`: `src/utils/api.ts:584-606`
  - `verifyLinkToken(...)`: `src/utils/api.ts:170-180`
  - `sendPhoneOTP(...)`, `verifyPhoneOTP(...)`: `src/utils/api.ts:636-663`
- Email verification UI assets exist:
  - Link/callback handler: `src/components/EmailVerificationCallback.tsx:1-146`
  - In-dashboard modal: `src/components/EmailVerificationModal.tsx:1-76`
- Dashboard pages are implemented and load; Professional dashboard integrates verification surface but not gating: `src/components/ProfessionalDashboard.tsx:38` and `src/components/ProfessionalDashboard.tsx:549`.
- Dashboard now prompts for phone verification after email verification: `src/components/ProfessionalDashboard.tsx:560-585` using `PhoneVerification` (`src/components/PhoneVerification.tsx:39-49, 100-137`).
- Docs and test reports already detail desired flow and gaps: `docs/test-reports/registration-workflow-analysis.md`, `docs/test-reports/registration-workflow-summary.md`, `docs/phase2-email-verification-summary.md`.

## Implementation Status Update
- Frontend now uses backend `/register` and redirects to `/dashboard` on success: `src/components/SimpleRegistration.tsx:150-188`.
- `/get-started` renders the registration UI: `src/components/Router.tsx:164-171`.
- Email verification link flow is active; prompts are removed on next load: `src/components/EmailVerificationCallback.tsx:11-88`.
- Phone OTP verification is implemented and activates PIN: `supabase/functions/server/routes/pin.tsx:147-243, 245-316`.
- Database flags added: `users.phone_verified`, `users.pin_active`, `users.pin_hash`, `users.pin_issued_at`, and `profiles.email_verified` in `supabase/migrations/20251118_add_phone_pin_flags.sql:1-15`.
- Remaining gaps: TypeScript errors in UI components, Twilio environment configuration, E2E tests, and observability dashboards.

## End-to-End Flow (Implemented)
- Registration UI posts to backend `/register` (CSRF disabled for this endpoint only).
- Backend returns success + sends email verification link (24-hour expiry).
- Frontend redirects to `/dashboard` and shows an email verification modal; dashboard remains usable while unverified.
- Link click confirms token and sets `profiles.email_verified=true`; prompt is removed on next load.
- After email verification, a phone OTP flow verifies the phone and activates PIN (sets `users.pin=phone`, `pin_hash`, `pin_active=true`).

## Phase Plan and Priorities

### Phase 1 — Implemented Changes (High)
- Switch to `api.register(...)` and redirect to `/dashboard` on success.
- Show email verification modal while keeping dashboard accessible for unverified users.
- Integrate link callback verification to remove prompt; add phone OTP prompt after email verification.
- Persist session and CSRF via `auth/session-cookie` to satisfy protected endpoints.
- Pending: fix TypeScript UI typing issues in `sheet.tsx`, `VerificationBanner.tsx`, `sidebar.tsx`, and `main.tsx`.

Acceptance Criteria:
- Registration posts to `/server/register` and returns tokens.
- Dashboard shows email verification modal without blocking usage.
- Link verification sets `email_verified=true`; prompt disappears on next load.
- After email verification, phone OTP prompt appears; success activates PIN and sets `pin_active=true`.
- `npm run dev` runs; typecheck fixes pending in UI components.

### Phase 2 — Verification UX and Session Reliability (Medium)
- Resend link cooldown and error messaging using `/auth/email/verify/send`.
- Unify verification flows and status across PIN and registration.
- Token refresh and 401 handling for protected API calls.
- Remove client-side secrets; use environment variables for providers (Twilio).
- Monitoring hooks for funnel metrics and timings.

Acceptance Criteria:
- Resend verification works with visible cooldown and informative states.
- Token refresh handles expiry without kicking users abruptly.
- No secrets reside in client-side code; env-driven config is used.
- Basic metrics collected for success rates and timings.

### Phase 3 — Tests and Observability (Medium)
- Unit tests for validation functions and API client methods (e.g., email format, password strength, resend cooldown logic).
- Integration tests for registration → verification → login against local functions (`supabase/functions/tests/auth_flow_test.ts:4-42`).
- E2E tests to verify full journey and dashboard gating (Playwright).
- Add logs and dashboards for registration attempts, verification success/failed, resend counts.

Acceptance Criteria:
- CI runs unit, integration, and E2E tests; coverage threshold met.
- Observability charts show funnel metrics and failure points.

### Phase 4 — Enhancements (Low)
- Two-Factor Authentication (2FA) optional after email verification.
- Social sign-in providers (Google/GitHub) integrated with verification step.
- Code-splitting and lazy load registration/verification components.
- Accessibility improvements: ARIA, keyboard nav, error annunciation.

Acceptance Criteria:
- 2FA available as an opt-in.
- OAuth flows route through verification where required.
- Performance metrics improved for first load and interaction.
- Accessibility checks pass (axe, Lighthouse).

## Immediate Action Items
- Fix TypeScript errors in `sheet.tsx`, `sidebar.tsx`, `VerificationBanner.tsx`, and `main.tsx`.
- Configure SMS provider environment variables (Twilio) for production delivery.
- Add integration/E2E tests for registration → email verify → phone OTP → PIN activation.
- Add observability dashboards and alerts for verification success/failure and rate-limits.

## Risks and Notes
- If the frontend bypasses `/register`, backend audit, rate limiting, and KV synchronization are lost.
- Verification surface must be consistent; avoid divergent flows between PIN onboarding and registration.
- Environment management is critical; client-side secrets should be avoided entirely.

---

This plan provides a concrete roadmap to complete the registration-to-dashboard journey with strong verification and observability. The outlined phases can be executed independently, with Phase 1 unlocking the end-to-end path and subsequent phases raising reliability, UX, and quality.
