## Objectives
- Polish multi-step registration UX with robust validation, accessibility, and resilience.
- Add email OTP verification flow post-signup and optional SMS OTP, with rate limiting and audit logging.
- Harden login to surface verification status, resend OTP, and smooth fallback behavior.

## Current Baseline
- Multi-step registration exists (`src/components/RegistrationFlow.tsx`) with client validation and server validation via `POST /server/validate-registration`.
- Signup uses Supabase `auth.signUp` and stores session; triggers `api.sendVerificationLink` (magic link).
- Login prefers `POST /server/login` (`api.loginSecure`) and falls back to Supabase client with sanitized errors.
- Email OTP functions exist for `send-verification-email` and `verify-email-code` called via `api.sendVerificationEmail` and `api.verifyEmailCode`.

## UX Polish (Registration)
- Step indicators & progress: keep current; add subtle step success states and disabled state on errors.
- Validation enhancements:
  - Email: domain checks and disposable domains blacklist; async uniqueness hint via `validate-registration`.
  - Password: zxcvbn-style strength score and common password checks; add visibility toggle.
  - Phone: auto-format to E.164 with live feedback.
  - Employer: enforce `companyName`, `industry`, `headquarters`, `contactEmail` schema parity.
- Accessibility: aria-invalid/aria-describedby maintained; add focus management on step transitions; announce validation errors.
- Persistence: continue sessionStorage per step; add recovery from `localStorage.pendingRegistrationData`.

## Email OTP Flow
- UI components
  - Use `src/components/ui/input-otp.tsx` inside a modal after successful sign-up.
  - Flow: after `supabase.auth.signUp` and session persistence, open "Verify Email" dialog:
    - Step A: show obfuscated email, resend button → calls `api.sendVerificationEmail(email)`.
    - Step B: 6-digit input → calls `api.verifyEmailCode(email, code)`; success sets verification flag and proceeds.
  - Error feedback: invalid/expired code, resend cooldown; lock after N attempts.
- State integration
  - Gate dashboard with `EmailVerificationGate` if not verified.
  - Store `registrationEmail` in localStorage for OTP resend and prefill.
- Rate limiting
  - Client-side throttling on resend (30–60s cooldown) + server IP rate limiting; audit `verification_link:*` and `email_verifications` updates.

## SMS OTP (Optional)
- Server endpoints (to implement next phase):
  - `POST /server/sms/send` → `{ phone }` → `{ success }` (Twilio Verify)
  - `POST /server/sms/verify` → `{ phone, code }` → `{ success }`
  - Headers: `X-CSRF-Token`, `Authorization: Bearer accessToken`; rate-limited per IP and per phone.
- UI integration
  - Registration step 3 adds "SMS Verification" toggle if `phone` present and E.164 valid.
  - On completion, if SMS selected: open OTP modal path similar to email; fallback to email if SMS delivery fails.
- Security & privacy
  - Do not store full phone in logs; hash for audit; redact in client telemetry.

## Login Flow Refinements
- Pre-check verification status
  - On login success, if user not verified, show `EmailVerificationGate` with OTP entry and resend.
- Unified error handling
  - Explicit messages for rate limit, CSRF missing, service unavailable, and unverified email.
- 2FA placeholder
  - Reserve slot to integrate TOTP next phase; place conditional UI after password validation.

## API Client Additions (planned)
- New methods:
  - `smsSend(phone: string)` → `POST /server/sms/send`
  - `smsVerify(phone: string, code: string)` → `POST /server/sms/verify`
- Existing OTP email methods already present: `sendVerificationEmail`, `verifyEmailCode`.

## Data & Schemas
- Email OTP: `{ email, code }` 6-digit numeric; table `public.email_verifications` stores code, attempts, expiry.
- SMS OTP: `{ phone, code }` 6-digit; track attempts and expiry; store phone hash for audit uniqueness.
- Registration payloads already aligned to `/server/validate-registration`; keep parity.

## Tests
- Unit/UI (Vitest + RTL)
  - RegistrationFlow step validation (email, password strength, phone format) and navigation.
  - OTP modal: input masks, resend cooldown, success/failure paths.
- Integration
  - API client: email OTP send/verify headers and CSRF; new SMS endpoints contracts.
  - Rate limit paths: ensure 429 retries for validation and login, and correct fail after max.
- E2E (Playwright)
  - Signup → email OTP verification → login → dashboard redirect.
  - Optional path with SMS if phone provided.

## Telemetry & Audits
- Client events: signup started, validation errors, OTP sent/verified, login failures; redacted payloads.
- Server audit: `audit:register`, `audit:otp:email`, `audit:otp:sms`, `audit:login` with actor, timestamp, IP.

## Deliverables
- Polished registration UI with improved validation and accessibility.
- Email OTP verification modal flow integrated post-signup and in login gate.
- Planned SMS OTP endpoints and UI hooks (server implementation slated for next phase).
- Tests: unit/integration updated, E2E scenarios defined.

## References
- Registration: `src/components/RegistrationFlow.tsx:172-213,225-348,665-679` (validation and submit)
- Login: `src/components/LoginDialog.tsx:155-312` (signup/login handlers)
- OTP components: `src/components/ui/input-otp.tsx` (available for code entry)
- API client: `src/utils/api.ts:523-568` (email OTP send/verify), `src/utils/api.ts:91-112,114-127,155-174` (validation/register/login)
