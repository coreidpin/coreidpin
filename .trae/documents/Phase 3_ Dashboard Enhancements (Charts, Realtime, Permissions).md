## Objectives
- Replace static PIN metrics with live charts and analytics.
- Add realtime updates for analytics and matches/messages.
- Enforce permission-based access for dashboard features per userType.

## Current Baseline
- Professional dashboard renders static cards and numbers (`src/components/ProfessionalDashboard.tsx:757-776`).
- Employer dashboard shows static cards in multiple tabs (`src/components/EmployerDashboard.tsx:157-214`, `216-250`).
- Chart primitives are available via Recharts wrapper (`src/components/ui/chart.tsx`).
- Analytics endpoint exists in API client: `api.getPINAnalytics(pinNumber, accessToken)` (`src/utils/api.ts:509-521`).
- Supabase client configured (`src/utils/supabase/client.ts:14-25`).
- Matches UI exists without realtime messaging (`src/components/MatchesView.tsx`).

## Charts & Analytics
- Data source
  - Fetch analytics from `GET /server/pin/:pinNumber/analytics` via `api.getPINAnalytics`.
  - If `pinData?.pinNumber` is present after `api.getUserPIN`, call analytics fetch on mount.
  - Reference: `src/components/ProfessionalDashboard.tsx:129-153` (PIN load) and integrate analytics after `setPinData`.
- Chart components
  - Use `ChartContainer` + Recharts `AreaChart/BarChart/PieChart` from `src/components/ui/chart.tsx`.
  - PIN Performance section: replace static numbers with charts:
    - Views & Shares over time: AreaChart with two series.
    - Trust Score trend: LineChart (or Radial progress with synthetic).
    - Endorsements/projects: BarChart.
  - Hook in a unified `analyticsState` with `{ totalViews, totalShares, recentEvents[] }` and derived series.
- UI integration points
  - `ProfessionalDashboard` PIN Performance section `src/components/ProfessionalDashboard.tsx:757-776` → replace content with `ChartContainer` usage.
  - Add a small legend and tooltip via `ChartTooltipContent` and `ChartLegendContent` (`src/components/ui/chart.tsx:105-103`).
- Error handling
  - If analytics fetch fails, show a skeleton or fallback badges; log non-fatal errors.

## Realtime Updates
- Supabase Realtime
  - Subscribe to `pin_analytics` changes for the user’s PIN number; update analytics state on `INSERT` events.
  - Implementation sketch (to be added):
    - Create channel: `supabase.channel('pin-analytics:<pinNumber>')`
    - `on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pin_analytics', filter: 'pin_number=eq.<pinNumber>' }, handler)`
    - Reference client: `src/utils/supabase/client.ts:14-25`.
  - Unsubscribe on unmount.
- Matches/messages realtime (Phase 3 scope)
  - Subscribe to `matches` and `messages` KV-backed proxy (if bridged) or Postgres tables if available.
  - For now, simulate realtime by polling `GET /server/matches` and `GET /server/match/:matchId/messages` on intervals; add hooks in `MatchesView` consumer components (`ProfessionalDashboard.tsx:894-908`, `EmployerDashboard.tsx:331-343`).
  - When backend tables are ready, switch to Supabase Realtime `postgres_changes` on `public.matches` and `public.match_messages`.

## Permissions
- Route gating already present in `src/App.tsx:735-751`.
- Component-level checks
  - Professional-only features: PIN creation, analytics, endorsements.
  - Employer-only features: JD parsing, matches actions (offers), payroll.
  - Implement helper: read `userType` from `localStorage` or `supabase.auth.getUser()`; guard sections or replace actions with disabled states.
  - References: `src/components/ProfessionalDashboard.tsx:589-690` (Tabs), `src/components/EmployerDashboard.tsx:216-250` (Tabs).
- Server-side verification
  - Ensure protected fetches include `Authorization` and the server enforces `userId` match.

## Testing
- Unit
  - Chart rendering with sample analytics; ensure tooltip/legend labels correspond to config keys.
  - Permissions render tests: professional vs employer roles show/hide correct actions.
- Integration
  - Analytics fetch: `api.getPINAnalytics` yields shape `{ success: true, analytics: { totalViews, totalShares, recentEvents[] } }`.
  - Realtime subscription: mock Supabase client `on('postgres_changes', ...)` and confirm state updates.
- E2E (later)
  - Dashboard loads, charts visible when PIN present; permissions block actions when role mismatched.

## Telemetry
- Track events: chart viewed, analytics loaded, realtime update received, match opened, message sent.
- Redact PII (emails/phone), include `pinNumber` hashed when logging client-side events.

## Deliverables
- Live charts in Professional dashboard PIN Performance section using Recharts wrapper.
- Analytics fetch and display with graceful fallbacks.
- Realtime subscription wiring for `pin_analytics` (insert events) and polling for matches/messages until backend tables ready.
- Permission guards per role for critical actions.
- Unit and integration tests for charts, analytics, permissions, and realtime handlers.

## Implementation Notes
- Add `analyticsState` and `useEffect` for initial fetch in `ProfessionalDashboard.tsx` after PIN load (`129-153` and update `757-776`).
- Use `ChartContainer` config with color tokens for series: `views`, `shares`, `endorsements` (palette from existing theme classes).
- Create helper to transform `recentEvents[]` into daily buckets for charts.
- Ensure cleanup of realtime channels in `useEffect` return function.

## Milestones
- M1: Analytics fetch + charts rendering (Professional dashboard).
- M2: Realtime subscription for PIN analytics; test updates.
- M3: Permissions guard across dashboards; unit tests.
- M4: Polling-based matches/messages updates; prepare to migrate to realtime tables.
- M5: Tests and telemetry instrumentation.
