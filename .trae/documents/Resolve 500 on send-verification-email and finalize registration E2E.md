## What’s Breaking

* The request to `functions/v1/send-verification-email` returns 500 with message “Failed to store verification code”. This is thrown when the Edge Function’s insert into `public.email_verifications` fails.

## Likely Root Causes

* Missing/incorrect Edge Function environment:

  * `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` not set or wrong → DB calls run unauthenticated.

* Missing DB prerequisites on the remote database:

  * Table `public.email_verifications` does not exist (migrations not pushed)

  * Extension `pgcrypto` not enabled → `gen_random_uuid()` default fails

* Less likely: RLS/policies blocking insert. Service role bypasses RLS, so this only occurs if a non-service key is used.

## Fix Plan

### 1) Client headers for public endpoints

* Confirm client includes `Authorization: Bearer <anon-key>` and `apikey: <anon-key>` for public, JWT-verified endpoints.

* Ensure CSRF header is present on mutating routes (already implemented).

### 2) Edge Function configuration

* Set/verify env vars in Supabase Dashboard → Functions → Environment:

  * `SUPABASE_URL`

  * `SUPABASE_SERVICE_ROLE_KEY`

  * `RESEND_API_KEY`

  * `FROM_EMAIL` (optional)

* Re-deploy functions so env changes take effect.

### 3) Database prerequisites

* Verify remote DB has:

  * `CREATE EXTENSION IF NOT EXISTS pgcrypto;`

  * `CREATE EXTENSION IF NOT EXISTS citext;`

  * Table `public.email_verifications` with columns: `id UUID DEFAULT gen_random_uuid()`, `email CITEXT`, `code TEXT`, `expires_at TIMESTAMPTZ`, `verified BOOLEAN DEFAULT FALSE`, `created_at TIMESTAMPTZ DEFAULT now()`.

* If migrations haven’t been pushed, run a repair/pull/push to align.

### 4) Error visibility & resilience

* Keep improved server-side logging for DB insert errors (code/message).

* Optionally add a lightweight `information_schema` check in the function to return a specific error if the table is absent.

### 5) Validation & Logs

* After configuration, run end-to-end registration tests and capture logs:

  * Step 0 validations (required fields, email format, password strength)

  * Verification link scenarios (valid, expired, tampered, reused)

  * Login and dashboard persistence across refresh

* Persist logs with timestamps, requests/responses, and UI states under `tests/logs/*.json`.

## Expected Outcomes

* `send-verification-email` succeeds (200) and stores the 6-digit PIN in `public.email_verifications`.

* Link verification works; reused/tampered/expired links return appropriate errors.

* Registration → verification → login → dashboard completes and persists across refresh.

## Next Action

* I will configure the environment, confirm the DB schema/extensions, and re-run the E2E registration flow. Once done, I’ll share the logs and any further fixes if errors appear again.

