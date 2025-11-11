# Onboarding Flow Integration (Server)

- DB schema lives under `src/supabase/migrations/2025-11-11_onboarding_flow.sql`.
- Detailed schema docs: `src/supabase/migrations/SCHEMA_DOCS_ONBOARDING_FLOW.md`.

## Server Responsibilities
- Registration endpoint:
  - Validates `name`, `email`, `password` according to complexity rules.
  - Creates `app_users` and initializes `onboarding_status`.
  - Triggers seed `onboarding_user_steps` with `current_step = registration`.
- Email verification endpoint:
  - Generates token via `create_email_verification(user_id)` and sends email.
  - Confirmation handler: marks `email_verifications.used_at` and/or relies on Supabase `email_confirmed_at`.
  - Marks `onboarding_user_steps(verify_email)` as `completed`.
- Profile setup, initial setup:
  - Stores non-sensitive preferences in `onboarding_user_steps.context_data`.
  - Marks steps `completed` when validation passes.
- Legal acceptance:
  - Updates `app_users.terms_accepted`, `terms_version`, `privacy_acknowledged`, `privacy_version`, `legal_accepted_at`.
  - Marks legal steps `completed`.
- Success:
  - Attempts to complete `success_confirmation`; trigger enforces all required prior steps.

## Realtime
- Subscribe to `onboarding_user_steps` for live progress updates.
- Use `onboarding_status.current_step` to drive routing and UI.

## Error Handling
- If sequencing trigger rejects completion:
  - Return HTTP 409 with `{ code: 'SEQUENCE_VIOLATION', message }`.
- If step-specific validation fails:
  - Return HTTP 400 with `{ code: 'STEP_VALIDATION_FAILED', fieldHints }`.

## Testing
- E2E tests should cover:
  - Full registration → success flow.
  - Expired email token and retry.
  - Terms/privacy not accepted → step completion blocked.
  - Cross-browser (Chromium/Firefox/WebKit) and mobile viewport.