# Email Verification and Error Handling

## Error Scenarios
### "No email found"
- Trigger: when a request to send verification or PIN email has no email value or user record lacks email.
- HTTP: 404 Not Found
- User guidance: "Please log in again or update your profile email."
- Logging: writes `error:noemail:<ts>` KV with `ip`, `userAgent`, and `route`.

### Delivery failures
- Trigger: Resend returns non-2xx or network exception.
- HTTP: 500 with `{ success:false, error:"..." }`.
- Logging: `email:send:failure:<ts>` or `email:send:exception:<ts>` KV with context `{ to, subject, status, error }`.
- Retry: automatic up to 3 attempts for transient (5xx) errors.

## API Integration Points
- `POST /auth/send-verification-email` → sends Resend email with signed link.
- `GET /auth/verify-link?token=...` → validates token and activates account.
- `POST /auth/send-pin-code` → emails 6-digit code.
- `POST /auth/verify-pin-code` → validates code and activates account.
- `GET /diagnostics/email/health` → checks Resend credentials health.

## Configuration
- `RESEND_API_KEY`: Resend API key.
- `FROM_EMAIL`: verified sender email address.
- `SITE_URL`: public site URL for templates.
- `VERIFY_TOKEN_SECRET`: HMAC secret used to sign verification tokens.

## Troubleshooting
- 404 No email found: ensure session is active and profile contains a valid email.
- 401/403 from Resend health: verify `RESEND_API_KEY` in Supabase project secrets; confirm domain verification.
- Delivery failures: check `email:send:*` KV logs; confirm sender domain and template content; retry manually.
- Token errors: check token expiry and signature; issue a fresh verification email.

## Logging
- Success: `email:send:success:<ts>` with `{ to, subject, status, id }`.
- Failure: `email:send:failure:<ts>` or `email:send:exception:<ts>` with error detail.
- Health: `email:health:<ts>` and alerts `alerts:email:<ts>` when unhealthy.

