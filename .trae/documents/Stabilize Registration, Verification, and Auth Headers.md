## Summary of Errors
- 401 Missing authorization header: Public calls to Edge Functions are failing JWT verification because the client removed the Authorization/apikey headers for unauthenticated routes.
- 500 Failed to store verification code: The send-verification-email function is inserting into public.email_verifications with Supabase JS but is likely missing SUPABASE_SERVICE_ROLE_KEY (or incorrect), causing PostgREST 401 → captured as dbError and surfaced as 500.

## Root Causes
1. Client calls to public verification routes (`/server/send-verification`, `/server/resend-verification`, and legacy `/functions/v1/send-verification-email`) must include `Authorization: Bearer <anon-key>` + `apikey: <anon-key>` when Verify JWT is enabled.
2. Edge Function `send-verification-email` depends on `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. If not set in environment, DB insert will fail with 401 and the function returns 500.
3. Table schema alignment: `public.email_verifications` exists and matches expected columns; however, using `gen_random_uuid()` requires the `pgcrypto` extension. If not enabled on the target DB, inserts without `id` may fail.

## Implementation Plan
### A. Client API fixes (headers and flows)
- Restore Authorization/apikey headers for public endpoints:
  - `api.sendVerificationLink(email)` → use `getHeaders(undefined, true)`.
  - `api.resendVerificationLink(email)` → use `getHeaders(undefined, true)`.
- Keep CSRF header inclusion for protected mutating routes.
- Confirm `EmailVerificationGate` uses `sendVerificationLink` for link mode and `sendVerificationEmail`/`verifyEmailCode` for PIN mode.

### B. Edge Function configuration and safeguards
- Set required environment variables in the Edge Function environment (Supabase project settings → Functions → Environment):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `FROM_EMAIL` (optional; defaults provided)
- Add defensive checks in `send-verification-email`:
  - Validate presence of `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; if missing, return 500 with clear error and skip DB call.
  - Log `dbError` details to aid debugging (code/message/hint).
  - Optionally wrap insert with retry-on-429.

### C. Database prerequisites
- Ensure extensions on the target DB:
  - `CREATE EXTENSION IF NOT EXISTS pgcrypto;` for `gen_random_uuid()` default.
  - `CREATE EXTENSION IF NOT EXISTS citext;` already present.
- Verify that `public.email_verifications` exists with columns: `email (citext)`, `code (text)`, `expires_at (timestamptz)`, `verified (boolean)`, `created_at (timestamptz default now())`.

### D. Middleware and JWT verification
- Keep unauth paths exempted in app middleware (already done), but Supabase’s Verify JWT still applies to all function invocations.
- Rely on anon Authorization/apikey headers for public endpoints; do not disable Verify JWT globally.

### E. End-to-End Tests and Logs
- Add Playwright tests to cover:
  - Registration form validations (required fields, email format, password strength) with logs (timestamps, requests, UI states).
  - Verification link scenarios: valid, expired, tampered, and already-used tokens.
  - Login/dashboard persistence: demo login to validate dashboard rendering and session persistence across refresh.
- Persist logs to `tests/logs/*.json` for post-run analysis.

## Endpoint Specifications
- POST `/server/send-verification`
  - Params: `{ email: string }`
  - Headers: `Authorization: Bearer <anon-key>`, `apikey: <anon-key>`, `X-CSRF-Token`
  - Responses: `200 { success: true }`; Errors: `400 (missing email)`, `403 (CSRF)`, `500 (internal)`
  - Rate limiting: managed in code/kv if added
- POST `/server/resend-verification`
  - Same as above
- GET `/server/auth/verify-link?token=...`
  - Validates HMAC token; sets KV `email_verified:*`; returns `200 { success: true }`, `400 (invalid/expired)`, `410 (already used)`
  - Public; no JWT required if Verify JWT is disabled; otherwise client must include anon if protected
- POST `/functions/v1/send-verification-email` (legacy PIN flow)
  - Params: `{ email: string, name?: string }`
  - Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; uses service role to write to `email_verifications`
  - Responses: `200 { success: true, emailId }`, `429 (rate limited)`, `500 (db or email failure)`

## Rollback/Validation
- After changes, manually validate:
  - Registration step sends link and PIN; UI shows success and cooldown.
  - Link verification updates KV and allows dashboard access.
  - Demo login renders dashboard and persists on refresh.
  - Playwright tests pass and logs are created.

## Timeline
- Day 1: Header fixes, env validation, add pgcrypto check, re-run local tests.
- Day 2: Harden error handling and finalize tests/logging.

Confirm to proceed and I will apply the code updates, configure the environment variables, and run the E2E tests with logs. 