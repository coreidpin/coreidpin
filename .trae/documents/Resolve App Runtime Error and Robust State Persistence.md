## Diagnosis
- Inspect console stack to identify the first thrown error message and file:line; capture any "+ The above error occurred in <App>" details.
- Verify all `React.lazy` imports map to existing exports (default vs named): AdminDashboard, LandingPage, SolutionsPage, LoginPage, PublicPINPage, OnboardingFlow.
- Confirm no remaining top-level `await` in non-async contexts and that dynamic imports are wrapped in async functions only.
- Validate path/state restoration logic by simulating refresh at `/dashboard`, `/login`, `/pin/:id`, and `/`.

## Error Boundary & Logging
1. Add `src/components/ErrorBoundary.tsx` with `componentDidCatch` and `getDerivedStateFromError` providing a fallback UI, reload button, and "report" action that posts to `/functions/v1/server/diagnostics/errors`.
2. Wrap root render in `ErrorBoundary` in `src/main.tsx`.
3. Add global handlers:
   - `window.onerror` and `window.onunhandledrejection` → toast + diagnostics post.
4. Ensure diagnostics posts include auth headers (`Authorization`, `apikey`: anon or access token).

## Lazy Import Hardening
- Replace `React.lazy(() => import(...).then(m => ({ default: m.Named }))` with a guard:
  - If `m.Named` is undefined, fallback to a minimal placeholder component to avoid runtime throw.
- Standardize lazy imports for pages and dashboards; ensure Suspense fallbacks are present for every lazy component usage.

## State Persistence Refinement
- Persist `appState`, `currentView`, `currentTab`, `showPINOnboarding`, and `scroll` per-path under `localStorage`.
- On mount:
  - If path is `/` or `/landing`, restore last path from `localStorage('app:lastPath')` and replace history.
  - If computed state is `landing` but `app:persist.appState` exists, use persisted state.
- On session invalidation for protected routes, set `appState='login'` but keep path unchanged.
- Do not force onboarding; show toast only.

## Monitoring Fixes
- Update `src/utils/monitoring.ts` to post to current origin, include `Authorization`/`apikey` using access token or anon key, and fallback to `sendBeacon`.
- Ensure no monitoring call fails hard; swallow network errors.

## Tests
- Unit: restore helpers (pathToState/stateToPath) and persistence logic.
- E2E (Playwright):
  - Logged in: refresh `/dashboard` → remains on dashboard.
  - Expired session: refresh `/dashboard` → login view.
  - Public PIN: refresh `/pin/:id` → remains on PIN.
  - Error boundary: intentionally throw in a test component → shows fallback and logs.

## Rollout
- Implement ErrorBoundary and global handlers.
- Harden lazy imports and Suspense fallbacks.
- Refine mount/session logic to always prefer last path/state for logged-in users.
- Update monitoring auth.
- Add tests and run preview build to validate.

## Outcome
- No more refresh redirects to registration for logged-in users.
- Runtime errors caught and surfaced with a friendly fallback; diagnostics recorded.
- Monitoring calls authenticated and reliable.
- Verified persistence on all major paths and auth states.