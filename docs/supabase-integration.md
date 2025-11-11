# Supabase Integration Guide

This project integrates Supabase for auth, data access, and HTTP endpoints. It includes secure client setup, shared server utilities, automated tests, and post-deploy verification.

Project reference in production: `evcqpapvcvmljgqiuzsq` (URL: `https://evcqpapvcvmljgqiuzsq.supabase.co`).

## Secure Connection & Configuration

- Frontend client (`src/utils/supabase/client.ts`) reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Ensure these are set to the production project.

## Production Environment Setup

- Frontend (e.g., Vercel): set environment variables
  - `VITE_SUPABASE_URL=https://evcqpapvcvmljgqiuzsq.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=<your-frontend-anon-key>`
  - Tip: do not commit secrets; set them in host’s dashboard.

- Edge Functions (Supabase): set function secrets
  - `SUPABASE_URL=https://evcqpapvcvmljgqiuzsq.supabase.co`
  - `SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>`
  - Optional: `SUPABASE_ANON_KEY=<your-frontend-anon-key>` (used by some checks)

Example (Supabase CLI):

```
supabase secrets set \
  SUPABASE_URL=https://evcqpapvcvmljgqiuzsq.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> \
  SUPABASE_ANON_KEY=<your-frontend-anon-key>
```

## Local Development

- Copy `.env.example` to `.env` and fill in values.
- Required keys:
  - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Optional: `OPENAI_API_KEY` for real AI analysis.
- Server-side functions use a centralized singleton at `src/supabase/functions/server/lib/supabaseClient.tsx` and require:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (service role; DO NOT expose to client)
- Auth helper `getAuthUser(c)` standardizes user extraction from `Authorization: Bearer <token>`.
- Basic retry (`withRetry`) is provided for transient failures (HTTP 5xx/429).

## Automated Endpoint Testing

- Unit tests: `tests/api.client.test.ts` verify retry behavior and header handling without network.
- Integration tests: `tests/integration.endpoints.test.ts` hit real Supabase Functions endpoints.
  - Toggle by `RUN_INTEGRATION_TESTS=true` env.
  - Validates health, registration validation errors, and auth protection on protected routes.
- Run tests:
  - `npm test` (unit)
  - `RUN_INTEGRATION_TESTS=true npm test` (integration)

## Continuous Integration (CI)

- Workflow: `.github/workflows/ci.yml`
  - Runs unit tests on every push/PR.
  - Optional integration tests when repo variable `RUN_INTEGRATION_TESTS` is set to `true`.

## Post-Deployment Verification & Monitoring

- Script: `scripts/postdeploy-check.mjs`
  - Requires `SUPABASE_URL` and optional `FUNCTION_SLUG`.
  - Checks `/health`, `/validate-registration` (reachable), and `/professionals` (requires auth).
- Workflow: `.github/workflows/postdeploy.yml`
  - Manual trigger with inputs.
  - Scheduled every 6 hours for uptime monitoring.

## API Functionality & Error Handling

- Endpoints return appropriate HTTP codes and JSON bodies.
- Protected routes validate `Authorization` and return `401` on failure.
- Client wraps fetches with retry for `5xx/429` and avoids sending `Authorization` unless a token is present.

## Schema & Access Patterns

- KV store keys:
  - `user:{userId}`, `profile:{userType}:{userId}`, `login_history:{userId|email}:{timestamp}`.
- Migrations:
  - `2025-11-11_auth_onboarding.sql`: ensures `public.login_history` exists before alterations and lockout trigger.
  - `2025-11-11_onboarding_flow.sql`: seed fix removes invalid `RETURNING INTO` syntax.

## Troubleshooting

- 401 Unauthorized: Ensure `Authorization: Bearer <access_token>` is supplied to protected endpoints.
- 500 or 429 responses: Client retry logic handles transient errors; investigate server logs for persistent failures.
- Env not set: Frontend requires `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`; server requires `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`.
- Migration errors: Confirm idempotent creation of dependencies (`login_history` table) and correct Postgres syntax in seed scripts.