## Goals
- Convert the app to an installable PWA with robust offline behavior.
- Optimize mobile UX and performance (bundle size, rendering, networking).
- Keep sensitive data safe (do not cache private/auth content).

## PWA Foundations
1. Add PWA integration with Vite:
   - Install `vite-plugin-pwa` and configure in `vite.config.ts` with `registerType: 'autoUpdate'`, `workbox` runtimeCaching, `manifest` basics (name, short_name, description, colors, display).
   - Register SW in `src/main.tsx` via `virtual:pwa-register` and show update-available toast with reload.
2. Manifest & Icons:
   - Provide `icons` for 192, 512, maskable variants; set `theme_color` and `background_color`.
   - Add `<meta name="theme-color">`, `<link rel="manifest">`, and apple touch icon/meta in `index.html`.
3. Offline UX:
   - In-app offline banner: small component that listens to `navigator.onLine` and shows reconnect state.
   - Provide `navigateFallback: 'index.html'` so client routing works offline.

## Caching Strategy (Workbox)
- Static assets (CSS/JS/images): `CacheFirst` with expiration (e.g., 30 days, 200 entries).
- HTML shell: `NetworkFirst` with short timeout and fallback to last-good shell.
- API:
  - Public, non-sensitive GET endpoints only (e.g., `GET /pin/:number/analytics`): `NetworkFirst` with TTL 1 day, max 50 entries, cacheableResponse `200`.
  - Skip caching for endpoints with Authorization or user profile data.
- Images/avatars served from public CDNs: `StaleWhileRevalidate` with reasonable TTL.

## Install Prompt & App Behavior
- Capture `beforeinstallprompt` and surface a CTA (banner/button) in top-level layout.
- Provide dismiss/deferral; re-show based on cooldown.
- Add instructions page for iOS manual add-to-home-screen (no SW install prompt on iOS).

## Push Notifications (Optional, gated)
- Prepare foundation only:
  - SW: subscribe to push on user opt-in; handle `push` event with data payload.
  - Backend: store subscriptions and VAPID public key (requires new edge function and keys). Keep behind a feature flag.
- Start with local notification demo in SW; roll real push later after keys are available.

## Mobile Performance
- Code splitting:
  - Lazy-load heavy libs: charts (`recharts`) and employer/professional dashboard routes using `React.lazy` + `Suspense`.
  - Create manual chunks in Vite (`recharts`, `supabase-js`, `vendor`) to isolate heavy dependencies.
- Reduce costly assets:
  - Lottie player: remove global include from `index.html`; dynamically import only where used, or gate behind `prefers-reduced-motion`.
  - Ensure images use `loading="lazy"`, `srcset` for responsive sizes.
- Rendering tweaks:
  - Ensure charts render in a `ResponsiveContainer` and avoid unnecessary rerenders (memoize props, selector-based state).
  - Use CSS containment for complex sections where helpful.
- Network optimizations:
  - Add `<link rel="preconnect">` to Supabase endpoints; enable `keepalive` on lightweight POST diagnostics.
  - Implement request timeout and abort for non-critical calls on mobile networks.

## Build & Delivery Optimizations
- Vite `build`:
  - `target: 'es2020'`, `sourcemap: false`, `chunkSizeWarningLimit` tuned, `rollupOptions.manualChunks` set for vendor splitting.
- Asset pipeline:
  - Compress images to web-friendly formats; prefer `webp/avif` where possible.
  - Use WOFF2 fonts only; preload critical fonts if any.
- HTTP caching headers:
  - Ensure `index.html` served with `no-cache`; static hashed assets with long `max-age`.

## Testing & QA
- Lighthouse CI: add workflow with thresholds (PWA score ≥ 0.9, Performance ≥ 0.85, Best Practices ≥ 0.9).
- Playwright E2E:
  - Offline mode: simulate offline and assert offline banner and shell still navigable.
  - Install prompt: mock `beforeinstallprompt` and assert CTA appears and defers correctly.
- Vitest:
  - Unit-test install prompt handler and offline banner store logic.
- Monitoring:
  - Add `navigator.connection` metrics (e.g., `effectiveType`, `downlink`) to diagnostics payload for mobile performance monitoring.

## Rollout & Safety
- Feature flags: gate SW registration and install prompt initially; enable progressively.
- Update strategy: `skipWaiting` + `clientsClaim` with visible update toast and reload action.
- Security: never cache responses containing `Authorization`; do not store tokens in SW or caches; respect CORS and private data boundaries.
- Fallbacks: provide a small offline "You’re offline" view inside the app; avoid creating large standalone offline pages.

## Implementation Steps
1. Configure `vite-plugin-pwa` in `vite.config.ts` with manifest and runtime caching (no auth endpoints cached).
2. Register SW in `src/main.tsx` and add update toast.
3. Add meta/manifest links to `index.html`; add icons (generated from existing logo).
4. Implement offline banner component and wire to global layout.
5. Code-split charts and dashboard routes with `React.lazy` + manualChunks.
6. Replace global Lottie include with on-demand import and motion gating.
7. Add preconnect hints and lazy image loading.
8. Add tests (Lighthouse CI workflow, Playwright offline/install, Vitest unit tests).
9. Monitor real-user mobile metrics; iterate on caching TTLs based on observed behavior.

## Deliverables
- PWA-enabled build (installable, offline-capable, auto-updating SW).
- Documented caching policy and exclusions for sensitive data.
- Improved mobile performance (smaller initial bundle, faster LCP/FCP on mid-tier devices).
- CI checks for PWA and performance, with Playwright offline coverage.

## Notes
- Requires generating app icons; no additional docs are created unless explicitly requested.
- Push notifications depend on VAPID keys and backend endpoints; planned as gated optional feature.
- All changes follow existing code style and avoid exposing secrets in SW or caches.