## Issue Summary
- Browser logs show `net::ERR_FAILED` calling `https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/server/pin/user/<id>`.
- Frontend forms URLs via `BASE_URL` in `src/utils/api.ts` (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\utils\api.ts:6–8, 467–472).
- Vite dev proxy forwards `/functions/v1/*` to `VITE_SUPABASE_URL` (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\vite.config.ts:63–69).
- Current Edge Function mounts routes under `/make-server-5cd3a043` and does not define any `/pin/*` endpoints (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\supabase\functions\server\index-new.tsx:45–49; index.tsx:31–38, 705–799; matching.tsx).

## Likely Root Causes
- Endpoint mismatch: frontend calls `/pin/*` but backend has no `/pin/*` routes; routes use `/make-server-5cd3a043/*` prefix. This will 404 even when connectivity is fixed.
- Connectivity/proxy nuance: dev proxy targets remote Supabase; if function is not deployed or preflight fails, browser shows `ERR_FAILED`.
- Header requirements: Supabase Edge Functions often expect `Authorization` and `apikey`; `getHeaders` only adds `apikey` for public calls (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\utils\api.ts:46–55).

## Plan
1. Validate connectivity fast
   - Test health URL in browser: `https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/server/make-server-5cd3a043/health`.
   - If it fails, deploy/enable the `server` function in your Supabase project.
2. Align paths
   - Update frontend `BASE_URL` to include the server prefix: in dev `'/functions/v1/server/make-server-5cd3a043'`, in prod `${SUPABASE_URL}/functions/v1/server/make-server-5cd3a043` (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\utils\api.ts:6–8).
   - Alternatively, remove the `make-server-5cd3a043` prefix in the backend and mount routes at root of the function.
3. Implement missing PIN routes
   - Add a new router `routes/pin.tsx` with:
     - `GET /make-server-5cd3a043/pin/user/:userId` (auth required)
     - `POST /make-server-5cd3a043/pin/create` (auth required)
     - `GET /make-server-5cd3a043/pin/public/:pinNumber` (public)
     - `GET /make-server-5cd3a043/pin/:pinNumber/analytics` (auth required)
     - `POST /make-server-5cd3a043/pin/:pinNumber/share` (public)
   - Mount it in `index-new.tsx`: `app.route("/make-server-5cd3a043/pin", pin)` (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\supabase\functions\server\index-new.tsx:45–49).
4. Harden headers
   - Always include `apikey` alongside `Authorization` in `getHeaders` to satisfy Supabase gateway checks (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\utils\api.ts:41–55).
5. Verify end-to-end
   - Run Vite dev and retry PIN load in `ProfessionalDashboard` (c:\Users\Akinrodolu Seun\Documents\GitHub\CoreID\src\components\ProfessionalDashboard.tsx:129–147).
   - Confirm JSON response for PIN endpoints and absence of `ERR_FAILED`.

## Notes
- Vite proxy is already set to forward to `VITE_SUPABASE_URL`; ensure `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- If you prefer local Supabase later, install Docker Desktop and use `supabase start`; then point proxy at `http://localhost:54321`.

## Deliverables
- Updated `api.ts` base URL and headers.
- New `routes/pin.tsx` and route mounting.
- Quick connectivity validation and a working PIN fetch from the dashboard.