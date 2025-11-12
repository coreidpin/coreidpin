Authentication Diagnostics and Fixes

Summary
- Login failures with valid credentials were traced to two potential issues:
  - Using a service-role Supabase client for end-user sign-in operations.
  - Missing CSRF header during early client requests before App initialization.

Server Changes
- Added a dedicated public (anon) Supabase client for end-user auth flows.
- Updated `server/routes/auth.tsx` `/login` to use the public client.
- Hardened error messages to avoid leaking internals:
  - `401` → `Invalid email or password` (generic)
  - `401` with confirmation indicators → `Email not verified. Please check your inbox.`
  - `500` → `Login failed` (generic)
- Improved logging with error name/status to aid debugging while keeping responses generic.

Client Changes
- Auto-initialize a CSRF token within `src/utils/api.ts` header generation if missing.
- Health checks include anon Authorization and `apikey` to support projects with “Verify JWT” enabled for Edge Functions.

Environment Requirements
- Supabase Edge Functions environment variables must be set:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SERVICE_KEY`)
  - `SUPABASE_ANON_KEY` (or `SUPABASE_KEY`)
- Optional: `SUPABASE_JWT_SECRET` only if using custom JWT.
- The app expects a CSRF token in localStorage; it is now auto-initialized in the API client.

Testing Steps
- E2E demo login continues to pass via the Navbar → Login form, asserting welcome toast and dashboard redirect.
- For real accounts, test via the UI or against the Edge Function directly:
  - `GET ${SUPABASE_URL}/functions/v1/server/health` with headers `Authorization: Bearer <ANON_KEY>`, `apikey: <ANON_KEY>`.
  - `POST ${SUPABASE_URL}/functions/v1/server/login` with body `{ email, password }` and headers above plus `X-CSRF-Token`.

Security Notes
- Avoid returning raw Supabase error messages in auth responses.
- Continue to require CSRF headers for state-changing requests.
- Rate limiting and login audit trail remain enabled.