## Goals
- Verify end-to-end connectivity between the app and Supabase (Auth + Database).
- Add diagnostics endpoints to validate configuration and query sample data.
- Provide clear error handling and documentation.

## Pre‑Checks (Environment)
- Confirm `.env` values match your Supabase project:
  - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\.env.example:7–10)
  - Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY` (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\.env.example:16–25)
- Use `validateServerEnv` to detect configuration issues early (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\supabase\functions\server\lib\envCheck.tsx:1–32)
- Ensure Vite proxy points to `VITE_SUPABASE_URL` (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\vite.config.ts:61–69).

## Client Initialization Checks
- Frontend client singleton (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\utils\supabase\client.ts:1–27):
  - Verify `createClient(url, anonKey)` uses env or fallback and persists session.
- Backend client singleton (Edge Functions) (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\supabase\functions\server\lib\supabaseClient.tsx:6–17):
  - Uses `SUPABASE_URL` + service role key; `getAuthUser` extracts `Authorization` (lines 19–25).

## Tables & RLS
- Confirm `auth.users` presence via Dashboard:
  - Run: `select id, email, created_at from auth.users limit 5;`
- Verify app tables referencing `auth.users` (e.g., `public.app_users.user_id` FK) exist (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\supabase\migrations\20251111120100_auth_onboarding.sql:19).
- Review RLS policies on `app_users`, `profiles`, `login_history` (paths provided in your overview) to ensure expected access patterns.

## Diagnostics API (Edge Function)
- Implement under prefix `/make-server-5cd3a043` in the `server` function:
  - `GET /make-server-5cd3a043/diagnostics/health`
    - Returns `{ status: 'success', ok: true, url, timestamp }`.
  - `GET /make-server-5cd3a043/diagnostics/users/:id`
    - Uses service role to fetch from `auth.users` (e.g., `supabase.auth.admin.getUserById(id)`).
  - `GET /make-server-5cd3a043/diagnostics/app-users/:id`
    - Selects from `public.app_users where user_id = :id`.
- Mount diagnostics in `index-new.tsx` similarly to existing routes (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\supabase\functions\server\index-new.tsx:45–49).
- Response shape:
  - `status`: `success | failure`
  - `data`: records on success
  - `error`: `{ message, code, details }` on failure
- Headers for frontend calls: include `Authorization` and `apikey` (client headers located at c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\utils\api.ts:41–55).

## Error Handling
- Frontend API client already retries transient errors and wraps JSON errors (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\utils\api.ts:70–90).
- Use try/catch with structured logs in diagnostics; align with patterns used in `index.tsx` and `routes/matching.tsx`.

## Test Procedure
- Environment sanity: ensure `.env` values for both frontend and backend are correct.
- Connectivity:
  - Call `GET /functions/v1/server/make-server-5cd3a043/health` and diagnostics health in the browser.
- Known user fetch:
  - Call `GET /functions/v1/server/make-server-5cd3a043/diagnostics/users/<known_user_id>`; expect `status=success` with `id/email`.
- App data fetch:
  - Call `GET /functions/v1/server/make-server-5cd3a043/diagnostics/app-users/<same_id>`; confirm row or receive clear failure including RLS guidance.
- Observe logs for errors in Edge Function and browser console.

## Documentation
- Add `docs/connection-verification.md`:
  - Env variables and file references
  - Client initialization points
  - RLS summary and intended access
  - Diagnostics endpoints with example requests/responses
  - Results of verification run and any follow-ups

## Notes & Alternatives
- Current dev Base URL is `/functions/v1/server`; diagnostics use same prefix for consistency.
- If desired, remove the prefix `/make-server-5cd3a043` from the backend and update `BASE_URL` in the frontend to simplify URLs; I can do this as a follow-up after diagnostics are in place.

## Deliverables
- Diagnostics routes implemented and mounted.
- Verification performed with real environment values.
- Concise documentation of process and results.