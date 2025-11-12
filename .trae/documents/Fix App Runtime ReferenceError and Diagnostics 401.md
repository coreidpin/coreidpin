## Diagnosis

* Console shows `Uncaught ReferenceError: showPINOnboarding is not defined` at `src/App.tsx:342`; this variable only exists inside `ProfessionalDashboard` and was referenced from `App`, causing a render-time throw.

* Diagnostics POST to `/functions/v1/server/diagnostics/errors` returns 401 when no `accessToken` or `VITE_SUPABASE_ANON_KEY` is available; error logging should not attempt authenticated calls without credentials.

## Implementation Steps

1. Remove undefined state usage in `App.tsx`:

   * Delete all references to `showPINOnboarding` in `App.tsx` (state persistence effects and initializers). Keep persistence limited to `appState`, `currentView`, and scroll position.

   * Ensure all `localStorage` reads are guarded with try/catch and type checks.
2. Keep `showPINOnboarding` local to `ProfessionalDashboard`:

   * Optionally persist it to `sessionStorage` within `ProfessionalDashboard` only (not required for root-level refresh behavior).
3. Refine diagnostics posting:

   * In `src/utils/monitoring.ts:recordClientError`, if neither `accessToken` nor `VITE_SUPABASE_ANON_KEY` exists, skip the POST entirely (no network calls). Otherwise include `Authorization` and `apikey`.

   * Update global handlers in `src/main.tsx` to import `recordClientError` via dynamic ESM import (`import('./utils/monitoring')`) and no-op if import fails.
4. Validate lazy imports remain safe:

   * Keep guarded `React.lazy` patterns (fallback to `default` or noop component) to prevent runtime throws when named exports are absent.
5. Reconfirm refresh logic:

   * On mount, if path is `/` or `/landing` and `localStorage('app:lastPath')` exists, replace history with last path and set `appState` accordingly.

   * For valid sessions, never force onboarding; preserve desired route.

   * For invalid sessions on protected routes, set `appState='login'` without changing path.

## Testing

* Refresh at `/dashboard` while logged-in → remains on dashboard; no ReferenceError.

* Refresh at `/` with prior last path `/dashboard` → restores to dashboard.

* Invalid session on `/dashboard` → shows login; path unchanged.

* Error diagnostics: when no credentials, no network calls; with anon key present, POST succeeds.

## Outcome

* Eliminates the `showPINOnboarding` ReferenceError in `App`.

* Stops dev 401 errors from diagnostics when credentials are missing.

* Preserves route/view/state across refreshes for logged-in users, with clean error handling and logging.

