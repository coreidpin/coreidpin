## System Architecture
- Current stack
  - Frontend: Vite + React (pseudo-routing in `src/App.tsx`), Supabase client in `src/utils/supabase/client.ts`
  - API client: `src/utils/api.ts` calling Supabase Edge Function mux at `functions/v1/server` via Vite proxy
  - Server: Supabase Edge Functions under `supabase/functions/server/*` and email OTP functions under `supabase/functions/*`
- Endpoint catalog (route → method → request → response)
  - Health: `/server/health` → GET → none → `{ status: "ok" }`
  - Registration validation: `/server/validate-registration` → POST → `{ entryPoint, userType, data }` → `{ valid, errors[] }`
  - Auth register: `/server/register` → POST → `{ email, password, name, userType, ... }` → `{ success, userId, userType } | { error }`
  - Auth signup (alt): `/server/signup` → POST → `{ email, password, name, userType }` → `{ success, user } | { error }`
  - Auth login (secure): `/server/login` → POST → `{ email, password }` → `{ success, accessToken, refreshToken, expiresIn, user, userData } | { error }`
  - Send verification link: `/server/send-verification` → POST → `{ email }` → `{ success } | { error }`
  - Resend verification: `/server/resend-verification` → POST → `{ email }` → `{ success } | { error }`
  - Email OTP send: `/functions/v1/send-verification-email` → POST → `{ email }` → `{ success } | { error }`
  - Email OTP verify: `/functions/v1/verify-email-code` → POST → `{ email, code }` → `{ success } | { error }`
  - Profile get: `/server/profile/:userId` → GET → none → `{ success, user|profile } | { error }`
  - Profile update: `/server/profile/:userId` → PUT → `{ ...partialProfile }` → `{ success, message, user|profile }`
  - Profile analyze: `/server/profile/analyze` → POST → `{ links..., name?, title? }` → `{ success, analysis, profileData, timestamp }`
  - Profile complete: `/server/profile/complete` → POST → `{ identity, links, skills }` → `{ success, profile, completionPercentage, missingFields }`
  - Profile analysis by user: `/server/profile/analysis/:userId` → GET → none → `{ success, analysis } | 404`
  - Professionals list: `/server/professionals` → GET → none → `{ success, professionals[], count }`
  - Professionals search: `/server/professionals/search` → POST → `{ filters }` → `{ success, professionals[], count }`
  - Matching recommendations: `/server/recommendations` → GET → query params → `{ success, recommendations[], count }`
  - Matching swipe: `/server/swipe` → POST → `{ targetId, direction, targetType }` → `{ success, isMatch, message }`
  - Matching matches: `/server/matches` → GET → none → `{ success, matches[], count }`
  - Matching update status: `/server/match/:matchId/status` → PUT → `{ status }` → `{ success, message }`
  - Matching send message: `/server/match/:matchId/message` → POST → `{ message }` → `{ success, message }`
  - Matching get messages: `/server/match/:matchId/messages` → GET → none → `{ success, messages[], count }`
  - PIN create: `/server/pin/create` → POST → `{ name, title, location, avatar?, links?, experiences?, skills? }` → `{ success, pinNumber, pinId, message }`
  - PIN by user: `/server/pin/user/:userId` → GET → none → `{ success, data } | 404`
  - PIN public: `/server/pin/public/:pinNumber` → GET → none → `{ success, data }`
  - PIN share: `/server/pin/:pinNumber/share` → POST → none → `{ success }`
  - PIN analytics: `/server/pin/:pinNumber/analytics` → GET → none → `{ success, analytics }`
- Schemas & models
  - Supabase tables: `public.profiles`, `public.professional_pins`, `public.pin_experiences`, `public.pin_skills`, `public.pin_linked_accounts`, `public.pin_analytics`, `public.email_verifications`, `auth.users`
  - RPCs: `generate_pin_number`, `increment_pin_views`, `increment_pin_shares`, `register_app_user`
- Missing/incomplete
  - SMS verification endpoints absent; propose Twilio-backed `/server/sms/send` and `/server/sms/verify`
  - No PWA artifacts (service worker, manifest, push)
  - University flows largely stubbed; settings/security UI minimal
- Dependency matrix
  - `src/utils/api.ts` → all `/server/*` endpoints via proxy; adds `Authorization`, `apikey`, `X-CSRF-Token`
  - Registration → `/server/validate-registration` → Supabase `auth.signUp` → `/server/profile/complete` → `/server/send-verification` or OTP functions
  - Login → `/server/login` (rate-limited) → Supabase session set → dashboard data via `/server/profile/*` and `/server/pin/*`
  - Dashboard → reads analysis, recommendations, matches/messages; PIN onboarding triggers `/server/pin/create`; analytics from `/server/pin/*`

## Core User Flow Implementation
- Registration/Sign-up
  - Multi-step form: personal info → account credentials → professional details → review & submit; client validation (email, phone E.164, strong password, required fields per `userType`)
  - Server validation: call `/server/validate-registration` before sign-up; block on errors with inline feedback
  - Sign-up: use Supabase `auth.signUp` and persist session; store wizard state in `sessionStorage`
  - Email verification: trigger `/server/send-verification`; optional OTP via email (`/functions/v1/send-verification-email` and `/functions/v1/verify-email-code`)
  - SMS confirmation (new): add Twilio integration with `/server/sms/send` and `/server/sms/verify`; UI step optional-toggle
  - Error handling: standardized toast + field-level errors; exponential backoff on transient API errors; CSRF header included
  - Profile persistence: call `/server/profile/complete` to upsert `public.profiles`; enqueue analysis via `/server/profile/analyze`
- Login System
  - Primary flow: `/server/login` with CSRF and IP rate limiting; fallback to `supabase.auth.signInWithPassword`
  - Session management: store tokens in `localStorage`; auto-refresh; on app mount verify session; sign-out cleans keys
  - Password recovery: `supabase.auth.resetPasswordForEmail` with listener to present reset dialog; optional OTP code path
  - Security: rate limiting, CAPTCHA after N failures, device fingerprint hash for anomaly detection, audit logging to KV; optional 2FA via TOTP
- Professional Dashboard
  - Responsive UI: layout components for summary cards, charts, recent activity; adapt to `VITE_BETA_DISABLE_TASKBAR`
  - Data visualization: charts for `pin_analytics` (views/shares), trust score, endorsements/projects; tables for experiences/skills
  - Real-time updates: Supabase Realtime subscriptions on `pin_analytics` and messages; optimistic UI for matches/messages
  - Permissions: route guards by `userType` and ownership checks; server verifies `Authorization` user-id match
- PIN Creation
  - Secure setup: start from onboarding; require verified email; collect minimal profile; call `/server/pin/create`
  - Encryption at rest: hash the `pinNumber` with pepper before storing in secondary KV; sensitive fields (linked accounts) encrypted with WebCrypto (AES-GCM) and service-role for decryption when needed
  - Recovery options: regenerate PIN via verified email with server audit; notify via email; rate-limit regeneration
  - Audit logging: write KV entries `audit:pin:create|regen|share|view` with actor, timestamp, IP/device

## Quality Assurance
- Test cases
  - Registration: validation permutations per `userType`, sign-up success/failure, verification link/OTP, profile completion
  - Login: success, rate-limit exceed, CSRF missing, fallback path, password recovery
  - Dashboard: permissions, data fetch/render, realtime subscription behavior
  - PIN: create, public fetch, analytics counters, share tracking, regen guardrails
- Automated testing
  - Unit: Vitest for components and utilities
  - Integration: endpoint contract tests for `src/utils/api.ts` and `/server/*`
  - E2E: Playwright flows for registration → login → dashboard → PIN; visual snapshots
- Performance & load testing
  - K6 scripts for `/server/login`, `/server/pin/public/:pinNumber`, `/server/profile/*`
  - Measure p95 latency, error rates; set budgets
- Continuous monitoring
  - Client-side telemetry (web-vitals) → server ingest; server logs and KV metrics dashboards

## Progressive Web App Conversion
- Service worker: Workbox-generated SW with precache of shell, runtime caching strategies (stale-while-revalidate for API reads; network-first for profile write paths guarded)
- Web app manifest: icons, name, start_url, display standalone, theme/background color
- Install prompt: custom UX on eligible browsers; track acceptance
- Cache management: versioning, cache busting on deploy; purge on auth change
- Mobile optimization: lazy-load routes, code-split heavy dashboards, image optimization; measure Lighthouse
- Push notifications: Web Push subscription stored per user; Supabase function to send notifications on matches/messages

## Scalability Analysis
- Current limits
  - Supabase Postgres single instance, edge functions concurrency; Vercel build limits
- Horizontal scaling strategy
  - Edge functions stateless, scale by concurrency; front-end deployed via CDN; use read replicas
- Database sharding/partitioning
  - Partition large tables (`pin_analytics` by pinNumber/month); consider time-series extension; avoid cross-shard joins
- Auto-scaling configs
  - Supabase compute autoscale; configure function concurrency & memory; CDN caching headers for public PIN pages
- Monitoring for scaling triggers
  - Alerts on CPU/connection pool saturation, p95 latency thresholds, queue backlog; dashboards for RPS, error rate

## Development Standards
- Coding guidelines: TypeScript strict, functional components, hooks, error boundaries; consistent naming and module boundaries
- CI/CD pipeline: lint/typecheck/test on PR; build & preview; staging deploy on merge to `develop`; production on tags
- Code reviews: mandatory approvals, security checklist, performance checklist
- Documentation standards: inline docs, ADRs for architectural decisions, endpoint contracts maintained in repo
- Performance benchmarks: target SSR TTFB < 200ms (CDN), FCP < 2s on mid devices, API p95 < 300ms for reads

## Deployment Strategy
- Staging environment: separate Supabase project, environment variables, seed data; feature flags enabled
- Production rollout: canary deploys, progressive traffic shifting; database migrations with safe rollout
- Feature flags: gate new flows (SMS, push, 2FA, realtime) using env-driven toggles
- A/B testing: bucket users client-side, log to server; measure conversions (registration completion, PIN creation)
- Rollback procedures: maintain previous build artifacts; database migration down scripts; disable flags swiftly

## Maintenance Plan
- Monitoring dashboard: combine app metrics, API latency, DB health, realtime subscription status
- Alerts: thresholds for auth failures, 5xx spikes, rate-limit events, realtime disconnects
- Bug tracking: triage SLAs; templates for reproduction; auto-labeling
- Regular audits: security (secrets, tokens, access), data (PII encryption checks), performance (lighthouse, K6)
- Technical debt management: quarterly review; backlog grooming; refactor sprints

## Milestones & Deliverables
- Phase 1: Architecture audit & hardening (endpoint docs, CSRF/rate-limit verification)
- Phase 2: Registration & Login refinements (multi-step form polish, OTP/SMS optionality)
- Phase 3: Dashboard enhancements (charts, realtime, permissions)
- Phase 4: PIN flow security & analytics (encryption, recovery, audit)
- Phase 5: QA automation (Vitest, Playwright, K6) and monitoring
- Phase 6: PWA conversion and mobile optimizations
- Phase 7: Scalability configurations and partitioning plan
- Phase 8: Standards & CI/CD finalization
- Phase 9: Staging/production rollout and feature flags
- Phase 10: Maintenance dashboards, alerts, audits