## Goals & Scope

* Remove all legacy authentication components (DB, functions, triggers, types, endpoints) without breaking non-auth features.

* Design and implement a modern, secure authentication system with email verification (Resend), robust session management, logging/monitoring, and OWASP-aligned controls.

## Safeguards & Rollback

* Full logical backup of all auth-related objects and data (dump schema + data for targeted objects; full DB snapshot if available).

* Feature flags to disable legacy endpoints first; remove only after verification.

* Two-track migrations: reversible SQL (down scripts) for every change.

* Canary rollout and read-only dry runs in staging before production.

## Phase 0: Discovery & Inventory

* Enumerate legacy auth objects from `information_schema` and `pg_catalog`.

  * Tables: `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ILIKE ANY(ARRAY['%user%','%auth%','%session%','%login%']);`

  * Functions: `SELECT n.nspname, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname ILIKE ANY(ARRAY['%auth%','%login%','%session%']);`

  * Triggers: `SELECT tgname, relname FROM pg_trigger t JOIN pg_class c ON t.tgrelid=c.oid WHERE tgname ILIKE ANY(ARRAY['%auth%','%login%','%session%']);`

  * Types/Enums: `SELECT n.nspname, t.typname, t.typtype FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname ILIKE ANY(ARRAY['%auth%','%user%']);`

* API inventory: identify login/registration/password-reset/session handlers, middleware, utilities; map dependencies to non-auth routes.

## Phase 1: Database Cleanup (No-Tables Action Plan)

* Disable triggers referencing auth logic.

* Drop dependent views/materialized views referencing auth.

* Drop functions/procedures tied to auth.

* Drop constraints and indexes specific to auth tables.

* Drop auth tables.

* Drop custom types/enums tied to auth.

* Verify zero objects remain by re-running Phase 0 queries.

* Record a migration snapshot and export of DDL operations (up/down).

## Phase 2: API Endpoint Removal

* Gate legacy endpoints behind feature flags and return `410 Gone` or `404 Not Found` responses.

* Remove route handlers for login, registration, password reset, session management.

* Remove associated middleware and utilities.

* Update API docs to reflect removals and add deprecation notice.

## Phase 3: Pre-Implementation Verification

* Confirm DB has zero auth objects via `information_schema`/`pg_catalog` checks.

* Verify removed endpoints return `404/410` and no residual code paths remain.

* Capture clean-state schema snapshot and minimal API doc.

## Phase 4: New Auth Design (Secure Schema)

* Users: profile and identity separated from credentials.

* Credentials: `password_hash` (Argon2id), `password_updated_at`, `password_require_reset`.

* Sessions: short-lived access tokens (JWT) + refresh tokens (opaque, hashed at rest), `device_id`, `ip`, `user_agent`, `expires_at`, `revoked_at`.

* Email verification: `verification_tokens` with `user_id`, `token_hash`, `purpose='email_verify'`, `expires_at`, `used_at`.

* Password reset tokens: same structure as verification, purpose `password_reset`.

* Audit trail: immutable log of auth events + outcome.

* Rate limits: aggregated login attempts per `user_id`/IP (no PII beyond what’s necessary).

* Keys/secrets: environment-managed; never stored in code or DB plaintext.

## Phase 5: Authentication Flow Implementation

* Registration: validate inputs, hash with Argon2id, create user, enqueue verification email.

* Login: verify Argon2id, enforce rate limiting and lockouts, issue JWT access (short TTL) + refresh token (hash stored), bind session to device/IP.

* Refresh: rotate refresh tokens; revoke prior token; invalidate on logout.

* CSRF for web forms; SameSite/secure cookies; strict scopes in JWT claims.

* Password reset: send token; verify + rotate; invalidate old sessions.

* Logging/Monitoring: structured logs, audit trail, anomaly detection hooks.

## Phase 6: Email Verification (Resend Integration)

* Endpoint: `POST /auth/email/verify/send` accepts `email`; rate-limited.

* Generate random token; store `token_hash` with TTL (e.g., 24h); send via Resend.

* Verification endpoint: `POST /auth/email/verify/confirm` accepts `token`; match hash, mark email verified, cleanup token, rotate sessions.

* Env vars: `RESEND_API_KEY`; secrets via runtime env only.

* Bounces and delivery failures logged; user-friendly resend limits.

## Phase 7: Non-Breaking Guarantees

* Preserve `user_id` format and any identifiers used by non-auth endpoints.

* Maintain existing claims or map to new ones via compatibility layer.

* Feature flag new auth; staged enablement; fallback to legacy only during canary (until cutover).

* Validate all non-auth endpoints (profiles, content, payments) continue functioning.

## Phase 8: QA & Security

* OWASP ASVS checklist coverage for auth.

* Unit tests: hashing, token issuance/rotation, rate limiting, lockouts, audit logging.

* Integration/E2E: full flows (register, verify, login, refresh, reset, logout).

* Load tests: login/refresh endpoints; monitor DB contention and queues.

* Static/dynamic security analysis (lint, SAST/DAST if available).

## Phase 9: Deployment & Migration

* Tagged migrations with reversible steps.

* Pre-deploy checks: env secrets, DB connectivity, feature flags.

* Canary release, real-time monitoring; rollback path ready.

* Final cutover: disable legacy flags; archive historical data if needed.

## Acceptance Criteria

* Zero legacy auth objects in DB; verified via catalog queries.

* Legacy endpoints return `404/410` consistently.

* New auth passes security audit and OWASP ASVS checks.

* End-to-end flows work with logging/monitoring active.

* Non-auth endpoints unaffected.

* Documentation complete: schema, endpoints, migration, ops runbooks.

## Deliverables

* Migration scripts (up/down) with dry-run instructions.

* API specification for new auth endpoints.

* Schema DDL and ER diagram.

* Security audit report and test results.

* Rollback plan and ops runbook.

