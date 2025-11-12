## Overview
Verify the app’s connectivity to Supabase (auth and database) end‑to‑end, covering environment config, client initialization, table presence, RLS, runtime error handling, and a concrete diagnostics API.

## 1) Environment Configuration
- Frontend vars (used by client): c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\.env.example:7–10
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Backend vars (Edge Function): c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\.env.example:16–25
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SERVICE_KEY`)
  - Optional: `SUPABASE_ANON_KEY`, `SUPABASE_KEY`, `OPENAI_API_KEY`
- Validation utility confirms format and presence: c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\supabase\functions\server\lib\envCheck.tsx:1–32
- Action: ensure `.env` has real values matching the Supabase project; in dev the Vite proxy uses `VITE_SUPABASE_URL` (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\vite.config.ts:61–69).

## 2) Supabase Client Initialization
- Frontend client singleton: c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\utils\supabase\client.ts:1–27
  - Uses `createClient(url, anonKey)`, persists session, uses env fallback.
- Backend client singleton (Edge Function): c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\supabase\functions\server\lib\supabaseClient.tsx:6–17
  - Uses `SUPABASE_URL` + `SERVICE_ROLE_KEY`; helper `getAuthUser` extracts the user via `Authorization` (lines 19–25).

## 3) Users Table Presence & Sample Data
- Supabase manages `auth.users`; migrations reference it (e.g., foreign keys):
  - `public.app_users.user_id references auth.users(id)` (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\supabase\migrations\20251111120100_auth_onboarding.sql:19)
- Dashboard check (manual):
  - SQL editor: `select id, email, created_at from auth.users limit 5;`
  - Confirm expected test user exists.
- App test query (planned): see Diagnostics API in section 6 to fetch an auth user and sample `app_users` record.

## 4) RLS Policies
- RLS enabled and policies defined:
  - `public.app_users` RLS and policies (select/update own; insert service): c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\supabase\migrations\20251111120100_auth_onboarding.sql:126–135
  - `public.profiles` and `public.login_history` RLS: c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\supabase\migrations\20251111120200_login_history_profiles.sql:47–81, 123–146
- Action: Diagnostics will use service role on the backend, so it bypasses RLS; frontend queries must include a valid user access token when reading own rows.

## 5) Error Handling Enhancements
- Frontend API client already retries transient errors and wraps JSON parsing: c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\utils\api.ts:70–90, 103–110, 459–465, 472–481.
- Backend: add try/catch with structured logs around Supabase queries (pattern used throughout `index.tsx` and `routes/matching.tsx`).
- Action: Diagnostics API will return structured success/failure and include error detail fields.

## 6) Diagnostics API (Implementation Plan)
- Add Edge Function routes under the existing prefix `make-server-5cd3a043`:
  - `GET /make-server-5cd3a043/diagnostics/health` → returns `{ ok: true, url, projectRef }` and timestamps.
  - `GET /make-server-5cd3a043/diagnostics/users/:id` → server‑side (service role) fetch from `auth.users` (via `supabase.auth.admin.getUserById(id)`)
  - `GET /make-server-5cd3a043/diagnostics/app-users/:id` → select sample from `public.app_users where user_id = :id`
- Mount in `index-new.tsx` with `app.route("/make-server-5cd3a043/diagnostics", diagnosticsRouter)` (similar to existing mounts at c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\supabase\functions\server\index-new.tsx:45–49).
- Response shape:
  - `status`: `success` | `failure`
  - `data`: when successful (user fields or app_users row)
  - `error`: `{ message, code, details }` when failed
- Headers: ensure `Authorization` and `apikey` are included for frontend calls; backend routes use service role and do not require client auth.

## 7) Test Procedure
- Environment sanity:
  - Load `.env` with correct `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Connectivity:
  - In browser, request `GET /functions/v1/server/make-server-5cd3a043/health` and Diagnostics health.
- Known user fetch:
  - Call `GET /functions/v1/server/make-server-5cd3a043/diagnostics/users/<known_user_id>`
  - Expect `status=success` with basic user fields (id, email).
- Sample app data fetch:
  - Call `GET /functions/v1/server/make-server-5cd3a043/diagnostics/app-users/<same_id>`
  - Validate row presence or clear failure with RLS notes.
- Logging:
  - Observe Edge Function logs for any errors; frontend console for structured errors.

## 8) Documentation
- Add `docs/connection-verification.md` summarizing:
  - Env variables used and where
  - Clients initialization references
  - RLS summary
  - Diagnostics endpoints, example requests/responses
  - Results of your verification run

## Notes
- Current frontend Base URL in dev is `/functions/v1/server` then path segments; diagnostics path uses the same prefix, consistent with existing routes.
- If you prefer to remove the `make-server-5cd3a043` prefix, we can adjust routes and frontend `BASE_URL` accordingly to simplify URLs.