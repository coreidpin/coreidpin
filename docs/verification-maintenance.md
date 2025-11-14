# Email Verification Maintenance

This project uses token-based email verification stored in `public.email_verifications` with columns:
- `user_id` (UUID FK to `profiles`)
- `token` (text; 6-digit code for method `code`)
- `sent_at` (timestamp with time zone; default now)
- `expires_at` (timestamp with time zone)
- `used_at` (timestamp with time zone)
- `method` (text; e.g., `code`)
- `status` (text; optional; `used` set when verified)

## Edge Functions
- `send-verification-email`: Issues a 6-digit code, enforces 1/min/user rate limit, and emails via Resend.
- `verify-email-code`: Validates code for the resolved `user_id`, marks `used_at` and `status='used'`.
- `cleanup-email-verifications`: Purges rows where `used_at` or `expires_at` are older than 7 days.

All functions now return structured errors with `error_code`:
- `ERR_RATE_LIMIT`: Too many requests; includes `remainingSeconds`.
- `ERR_NOT_FOUND`: No profile/user for email.
- `ERR_INVALID_CODE`: Code not found, used, or expired.
- `ERR_DB_INSERT` / `ERR_DB_UPDATE`: Database write failures.
- `ERR_EMAIL_SEND`: Email provider failure.
- `ERR_PROFILE_LOOKUP`, `ERR_VERIFICATION_LOOKUP`: Internal query errors.

## Indexes
Added composite indexes to improve lookup performance and rate-limit checks:
- `(user_id, token)`
- `(user_id, sent_at DESC)`

## Scheduling Cleanup
Schedule the cleanup job (daily recommended) in Supabase:
1. Deploy Edge Function `cleanup-email-verifications`.
2. In Supabase Dashboard → Edge Functions → Schedules → New schedule
   - Function: `cleanup-email-verifications`
   - Cron: `@daily` (or `0 3 * * *` for 3am UTC)
   - Method: POST
   - Auth: Service role

## Client Handling
`src/utils/api.ts` surfaces friendly messages for common cases (rate limit, not found, invalid code). If needed, use `error_code` for precise UI flows.
