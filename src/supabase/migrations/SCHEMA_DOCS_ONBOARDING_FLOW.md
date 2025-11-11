# Onboarding Flow — Templates, Steps, Sequencing, and Email Verification

## Overview
- `public.onboarding_flow_templates` — flow definitions per `user_type` (professional, employer, university) and name (`default`).
- `public.onboarding_template_steps` — ordered steps per template.
- `public.onboarding_user_steps` — per-user progress with status, timestamps, context.
- `public.email_verifications` — tracks email verification tokens and lifecycle.
- Integrates with `public.onboarding_status` (summary and current step) and `public.app_users` (legal acceptance fields).

## Steps and Sequencing
- Steps: `registration`, `verify_email`, `profile_setup` (optional), `initial_setup`, `terms_acceptance`, `privacy_acknowledgment`, `success_confirmation`.
- Sequencing: cannot complete a step until all required prior steps are completed.
  - Enforced by trigger `public.enforce_onboarding_sequence`.
- Current step sync: `public.sync_onboarding_current_step` advances `onboarding_status.current_step` as steps finish.

## Step-Specific Validation
- `registration` — requires `app_users` record exists (name, email persisted; password validated at registration function).
- `verify_email` — requires either `auth.users.email_confirmed_at` OR a `public.email_verifications` row with `used_at` set and not expired.
- `profile_setup` — optional; can be configured to require minimum profile completion.
- `initial_setup` — requires at least one feature selected in `context_data.features_enabled`.
- `terms_acceptance` — requires `app_users.terms_accepted = true` and `terms_version` recorded.
- `privacy_acknowledgment` — requires `app_users.privacy_acknowledged = true` and `privacy_version` recorded.
- `success_confirmation` — requires all required steps complete.

## Data Model Details
- `onboarding_flow_templates`
  - Fields: `id`, `user_type` (`professional`, `employer`, `university`), `name`, `created_at`.
  - RLS: readable by all; new/updates only by `service_role`.
- `onboarding_template_steps`
  - Fields: `id`, `template_id`, `step_key` (enum), `title`, `description`, `step_order`, `required`, `required_fields` (jsonb), `validation_rules` (jsonb).
  - Unique: `(template_id, step_order)`, `(template_id, step_key)`.
  - Index: `(template_id, step_order)`.
  - RLS: readable by all; writes by `service_role`.
- `onboarding_user_steps`
  - Fields: `id`, `user_id`, `template_id`, `step_key`, `status` (enum), `started_at`, `completed_at`, `error_message`, `context_data` (jsonb), `created_at`, `updated_at`.
  - Unique: `(user_id, step_key)`.
  - Index: `user_id`, `(status)`, `(template_id)`.
  - RLS: users can select/update their own; inserts by `service_role`.
- `email_verifications`
  - Fields: `id`, `user_id`, `token` (unique), `sent_at`, `expires_at`, `used_at`, `method`, computed `status`.
  - Function: `create_email_verification(user_id, ttl)` returns token for link construction.
  - RLS: select own; writes by `service_role`.
  - Index: `user_id`, `(status)`, `expires_at`.

## Validation & Data Sanitization
- Registration form:
  - Required: `name`, `email`, `password`.
  - Email regex: `^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$` (apply case-insensitive at UI/app).
  - Password complexity: enforced in registration function (length ≥ 12; upper/lower/digit/special; no common patterns; no email or name in password).
- Sanitization:
  - Lowercase emails before insert; trim whitespace.
  - Do not store plaintext passwords in `context_data`; only non-sensitive flags.
  - Validate JSON with app schema; DB triggers check key presence where necessary.

## Realtime
- Publication `supabase_realtime` includes: `onboarding_user_steps`, `onboarding_template_steps`, `email_verifications` (added if publication exists).
- Clients can subscribe to step progress events to guide UI.

## UI Guidance, Mobile, Accessibility
- Use `title` and `description` from `onboarding_template_steps` for clear copy.
- Accessibility:
  - `label` + `htmlFor`; `aria-invalid` on errors; focus management on dialog transitions.
  - Color contrast ≥ 4.5:1; ensure keyboard navigation works; screen reader announcements for errors.
- Mobile:
  - Single-column forms at narrow widths; large touch targets; responsive spacing.

## Testing Plan
- End-to-end (Playwright):
  - Path: `registration → verify_email → profile_setup (optional) → initial_setup → terms → privacy → success`.
  - Assertions: required field validation, inline error messages, sequence enforcement, success state.
- Email confirmation:
  - Use test mailbox (or intercept `email_verifications.token`), visit link, assert verification sets `auth.users.email_confirmed_at` or marks token used.
- Error scenarios:
  - Invalid email; weak password; expired confirmation; attempt to complete out of order.
- Performance:
  - k6/Locust test simulating concurrent sign-ups; measure p95/p99 latencies on `/register`, DB contention on `app_users` and `onboarding_user_steps`.
- Cross-browser:
  - Run E2E across Chromium, Firefox, WebKit; include mobile viewport emulation.

## Example Token Link
- Construct: `https://app.example.com/verify?token=<TOKEN>` where `<TOKEN>` comes from `create_email_verification()`; server endpoint consumes and marks `used_at`.