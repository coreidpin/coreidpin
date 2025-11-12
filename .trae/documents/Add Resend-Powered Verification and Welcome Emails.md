## Goals
- Send email verification and welcome messages using Resend with your env (`RESEND_API_KEY`, `FROM_EMAIL`, `SITE_URL`).
- Provide accessible, branded HTML + plain-text templates.
- Expose secure endpoints in the `server` function to trigger emails.

## Implementation
1. Email utilities
- Create `supabase/functions/server/lib/email.ts` with a `sendEmail(to, subject, html, text)` using Resend REST API and env vars.
- Include a small helper for inline styles and safe escaping.

2. Templates
- Create `supabase/functions/server/templates/verification.ts` and `welcome.ts` exporting functions that return `{ subject, html, text }` given user name/email and verification link.
- Verification email:
  - Subject: "Verify your PIN account"
  - CTA link: `${SITE_URL}/verify?token=<code>&email=<email>` (if using code), or the Supabase magic link if applicable.
  - Content: Welcome, brief instructions, security note, support contact.
- Welcome email:
  - Subject: "Welcome to PIN"
  - Content: Onboarding tips, dashboard link `${SITE_URL}/dashboard`, help links.

3. Server routes
- In `supabase/functions/server/index.tsx` mount under `/auth`:
  - `POST /auth/send-verification` → body `{ email, name?, link? }` builds template and calls `sendEmail`.
  - `POST /auth/send-welcome` → body `{ email, name? }` builds welcome template.
- Return `{ success: true }` or error JSON; require `Authorization` header with anon key (existing auth middleware or simple header check).

4. Frontend integration
- In `src/utils/api.ts` add methods:
  - `sendVerificationEmail(email, name?)` → calls `/auth/send-verification` (already present, align path and headers).
  - `sendWelcomeEmail(email, name?)` → new method to call `/auth/send-welcome`.
- Use in Registration/Login flows:
  - After successful registration → trigger `sendVerificationEmail`.
  - After `hasCompletedOnboarding` is set → trigger `sendWelcomeEmail`.

5. Security & Config
- Use `RESEND_API_KEY`, `FROM_EMAIL`, `SITE_URL` via Deno `Deno.env.get(...)` in the Edge function.
- Validate `FROM_EMAIL` domain (SPF/DKIM setup) and fail early with descriptive errors.
- Do not log secrets.

6. Testing
- Unit: mock Resend `fetch` and assert payload.
- Manual: call endpoints with test email and inspect delivery (Resend dashboard).
- E2E: simulate registration → receive verification email; simulate onboarding → receive welcome email.

## Deliverables
- Resend email utility and two templates (verification and welcome).
- New endpoints under `/auth` in `server` function.
- Frontend methods to trigger emails.
- Verified delivery with your `RESEND_API_KEY` and `FROM_EMAIL`.

## Notes
- If you prefer Supabase magic links for verification, we can embed the magic link directly; otherwise use code-based flow you already have (`verify-email-code`).
- We won’t commit any secrets; all values read from env in the Edge function.