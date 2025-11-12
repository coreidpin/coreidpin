# Authentication & Onboarding Schemas

This document describes the Supabase database schemas for registration, password reset, login tracking (with lockout), and onboarding progress.

## Registration: `public.app_users`

- Purpose: Store application-level user profile and credentials metadata linked to `auth.users`.
- Relationships: `user_id` references `auth.users(id)`.

Fields:
- `user_id` (uuid, PK) — Auth user id, e.g. `2b6f2f6f-...`
- `email` (text, unique, case-insensitive) — e.g. `jane.doe@example.com`
- `username` (text, unique, 3–30, alnum + underscore) — e.g. `jane_doe`
- `password_hash` (text, bcrypt or argon2id format) — e.g. `$2b$12$...`
- `first_name` (text, optional) — e.g. `Jane`
- `last_name` (text, optional) — e.g. `Doe`
- `phone_number` (text, optional, digits only 10–15) — e.g. `2348012345678`
- `verification_status` (enum: pending|verified|rejected, default pending)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)

Validation & Sanitization:
- Email regex validation and normalized to lowercase.
- Username regex `^[A-Za-z0-9_]{3,30}$` and normalized to lowercase.
- Phone number stripped to digits.

Password Complexity:
- `validate_password_complexity(pw text)` enforces: ≥8 chars, upper, lower, digit, symbol.
- `register_app_user(...)` helper hashes (bcrypt) and inserts; rejects weak passwords.

RLS:
- Select/Update own rows; insert reserved for service role.

Indexes:
- Unique `lower(email)` and `lower(username)`.

Realtime:
- Added to publication `supabase_realtime` for immediate consumption by client subscriptions.

Example:
```json
{
  "user_id": "2b6f2f6f-...",
  "email": "jane.doe@example.com",
  "username": "jane_doe",
  "verification_status": "pending"
}
```

## Password Reset: `public.password_resets`

- Purpose: Track password reset requests and status.
- Relationships: `user_id` references `auth.users(id)`.

Fields:
- `id` (bigserial, PK)
- `user_id` (uuid, FK)
- `reset_token` (text, unique, 32-byte hex)
- `token_expiry` (timestamptz, required; must be ≤ `created_at + 24h`)
- `created_at` (timestamptz, default now)
- `is_used` (boolean, default false)
- `used_at` (timestamptz, optional)

Functions:
- `create_password_reset_request(user_id)` returns `reset_token` and inserts with 24h expiry.

RLS:
- Select own rows; insert/update reserved for service role.

Indexes:
- Partial index on active resets: `(user_id) where is_used = false and token_expiry > now()`.

Example:
```json
{
  "user_id": "2b6f2f6f-...",
  "reset_token": "d1f3...",
  "token_expiry": "2025-11-12T08:00:00Z",
  "is_used": false
}
```

## Login Tracking: `public.login_history` + `public.account_lockouts`

- Purpose: Audit login attempts and enforce lockout on repeated failures.

`login_history` fields (extended):
- `id` (bigserial, PK)
- `user_id` (uuid, optional FK)
- `email` (text, optional)
- `login_timestamp` (timestamptz, default now)
- `ip_address` (inet, optional)
- `user_agent` (text, optional)
- `device_info` (jsonb, optional)
- `location_data` (jsonb, optional)
- `success` (boolean)
- `reason` (text, optional)

Indexes:
- `login_timestamp`, `ip_address`, and user/email indices for fast filtering.

RLS:
- Users can select their own history; inserts reserved for service role.

Lockout Mechanism: `public.account_lockouts`
- `user_id` (uuid, PK, FK to `auth.users`)
- `attempt_count` (int, default 0)
- `window_started` (timestamptz, default now)
- `locked_until` (timestamptz, optional)
- `lock_reason` (text, optional)

Trigger:
- `update_lockout_on_login()` on `login_history` insert:
  - If failure: increment count within 15-min window; lock for 15 minutes after 5 failures.
  - If success: reset counters/lock.

Example failure event:
```json
{
  "user_id": "2b6f2f6f-...",
  "login_timestamp": "2025-11-11T07:20:00Z",
  "ip_address": "192.0.2.5",
  "success": false,
  "reason": "invalid-password"
}
```

## Onboarding: `public.onboarding_status`

- Purpose: Track onboarding flow progress per user.
- Relationships: `user_id` references `auth.users(id)`.

Fields:
- `user_id` (uuid, PK)
- `current_step` (text, default `select-role`) — e.g. `profile-details`
- `steps_completed` (int, default 0)
- `profile_completion_percentage` (int 0–100, default 0)
- `completed_at` (timestamptz, optional)
- `created_at` / `updated_at` (timestamptz)

Trigger:
- After insert on `app_users` creates `onboarding_status` row.

RLS:
- Users can select/update their own onboarding status; inserts via service role.

Example:
```json
{
  "user_id": "2b6f2f6f-...",
  "current_step": "profile-details",
  "steps_completed": 2,
  "profile_completion_percentage": 40
}
```

## Realtime Subscriptions

Tables added to `supabase_realtime` publication:
- `public.app_users`
- `public.onboarding_status`

Client example (TypeScript):
```ts
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

// Listen for new registrations
supabase.channel('app_users-reg')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'app_users' }, payload => {
    console.log('New registration:', payload.new);
    // Process onboarding initialization or analytics here
  })
  .subscribe();
```

## Notes
- Registration helper is provided for DB-level validation; projects using Supabase Auth should call it alongside `auth.admin.createUser`.
- Password complexity cannot be derived from a hash at rest; the helper validates plaintext then hashes with bcrypt.
- Ensure env and service role usage for insert/update operations per policies.