-- Comprehensive authentication and onboarding schemas for Supabase
-- Created: 2025-11-11

-- Extensions
create extension if not exists pgcrypto;

-- Enum for verification status
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'verification_status_enum'
  ) then
    create type verification_status_enum as enum ('pending','verified','rejected');
  end if;
end$$;

-- Registration: app_users table (links to auth.users)
create table if not exists public.app_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null,
  password_hash text not null check (
    -- enforce use of bcrypt or argon2 formatted hashes
    password_hash ~ '^\$2[aby]\$' or password_hash ~ '^\$argon2id\$'
  ),
  first_name text,
  last_name text,
  phone_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  verification_status verification_status_enum default 'pending',
  -- Email format validation
  constraint app_users_email_format_chk check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  -- Username rules: 3-30 chars, alphanumeric and underscore only
  constraint app_users_username_format_chk check (
    username ~ '^[A-Za-z0-9_]{3,30}$'
  ),
  -- Phone number: digits only, 10-15 length (optional)
  constraint app_users_phone_format_chk check (
    phone_number is null or phone_number ~ '^[0-9]{10,15}$'
  )
);

-- Unique indexes (case-insensitive)
create unique index if not exists app_users_email_unique_idx
  on public.app_users (lower(email));
create unique index if not exists app_users_username_unique_idx
  on public.app_users (lower(username));

-- Sanitization trigger to trim and normalize
create or replace function public.sanitize_app_user()
returns trigger as $$
begin
  new.email := lower(trim(new.email));
  new.username := lower(trim(new.username));
  if new.first_name is not null then
    new.first_name := initcap(trim(new.first_name));
  end if;
  if new.last_name is not null then
    new.last_name := initcap(trim(new.last_name));
  end if;
  if new.phone_number is not null then
    new.phone_number := regexp_replace(new.phone_number, '\\D', '', 'g');
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists app_users_sanitize_trg on public.app_users;
create trigger app_users_sanitize_trg
before insert or update on public.app_users
for each row execute function public.sanitize_app_user();

-- Complexity validator and registration helper
create or replace function public.validate_password_complexity(pw text)
returns boolean language sql immutable as $$
  select length(pw) >= 8
     and pw ~ '[A-Z]'
     and pw ~ '[a-z]'
     and pw ~ '[0-9]'
     and pw ~ '[^A-Za-z0-9]';
$$;

create or replace function public.register_app_user(
  p_user_id uuid,
  p_email text,
  p_username text,
  p_password_plain text,
  p_first_name text default null,
  p_last_name text default null,
  p_phone_number text default null
)
returns uuid as $$
declare
  v_hash text;
begin
  -- email/username checks
  if p_email is null or p_username is null then
    raise exception 'email and username are required';
  end if;
  if p_password_plain is null or not public.validate_password_complexity(p_password_plain) then
    raise exception 'Password does not meet complexity requirements';
  end if;

  -- hash using bcrypt
  v_hash := crypt(p_password_plain, gen_salt('bf', 12));

  insert into public.app_users(user_id, email, username, password_hash, first_name, last_name, phone_number)
  values (p_user_id, p_email, p_username, v_hash, p_first_name, p_last_name, p_phone_number)
  on conflict (user_id) do update set
    email = excluded.email,
    username = excluded.username,
    password_hash = excluded.password_hash,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone_number = excluded.phone_number,
    updated_at = now();

  return p_user_id;
end;
$$ language plpgsql security definer;

-- RLS for app_users
alter table public.app_users enable row level security;
drop policy if exists app_users_select_own on public.app_users;
create policy app_users_select_own on public.app_users
  for select using (auth.uid() = user_id);
drop policy if exists app_users_update_own on public.app_users;
create policy app_users_update_own on public.app_users
  for update using (auth.uid() = user_id);
drop policy if exists app_users_insert_service on public.app_users;
create policy app_users_insert_service on public.app_users
  for insert with check (auth.role() = 'service_role');

-- Password Reset: password_resets table
create table if not exists public.password_resets (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  reset_token text not null unique,
  token_expiry timestamptz not null,
  created_at timestamptz default now(),
  is_used boolean default false,
  used_at timestamptz,
  constraint password_resets_expiry_chk check (
    token_expiry <= created_at + interval '24 hours'
  )
);

create index if not exists password_resets_active_idx on public.password_resets(user_id, token_expiry) where is_used = false;

create or replace function public.create_password_reset_request(p_user_id uuid)
returns text as $$
declare
  v_token text;
begin
  v_token := encode(gen_random_bytes(32), 'hex');
  insert into public.password_resets(user_id, reset_token, token_expiry)
  values (p_user_id, v_token, now() + interval '24 hours');
  return v_token;
end;
$$ language plpgsql security definer;

-- RLS for password_resets
alter table public.password_resets enable row level security;
drop policy if exists password_resets_select_own on public.password_resets;
create policy password_resets_select_own on public.password_resets
  for select using (auth.uid() = user_id);
drop policy if exists password_resets_insert_service on public.password_resets;
create policy password_resets_insert_service on public.password_resets
  for insert with check (auth.role() = 'service_role');
drop policy if exists password_resets_update_service on public.password_resets;
create policy password_resets_update_service on public.password_resets
  for update using (auth.role() = 'service_role');

-- Login tracking: extend login_history and add lockouts
-- Add new columns if they don't exist
-- Ensure base login_history table exists to avoid relation errors
create table if not exists public.login_history (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  success boolean not null,
  method text,
  login_timestamp timestamptz default now(),
  ip_address inet,
  device_info jsonb default '{}'::jsonb,
  location_data jsonb
);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'login_history' and column_name = 'login_timestamp') then
    alter table public.login_history add column login_timestamp timestamptz default now();
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'login_history' and column_name = 'ip_address') then
    alter table public.login_history add column ip_address inet;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'login_history' and column_name = 'device_info') then
    alter table public.login_history add column device_info jsonb default '{}'::jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'login_history' and column_name = 'location_data') then
    alter table public.login_history add column location_data jsonb;
  end if;
end$$;

create index if not exists login_history_timestamp_idx on public.login_history(login_timestamp);
create index if not exists login_history_ip_idx on public.login_history(ip_address);

-- Account lockouts
create table if not exists public.account_lockouts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  attempt_count int not null default 0,
  window_started timestamptz not null default now(),
  locked_until timestamptz,
  lock_reason text
);

alter table public.account_lockouts enable row level security;
drop policy if exists account_lockouts_select_own on public.account_lockouts;
create policy account_lockouts_select_own on public.account_lockouts
  for select using (auth.uid() = user_id);
drop policy if exists account_lockouts_update_service on public.account_lockouts;
create policy account_lockouts_update_service on public.account_lockouts
  for update using (auth.role() = 'service_role');
drop policy if exists account_lockouts_insert_service on public.account_lockouts;
create policy account_lockouts_insert_service on public.account_lockouts
  for insert with check (auth.role() = 'service_role');

create or replace function public.update_lockout_on_login()
returns trigger as $$
declare
  v_threshold int := 5; -- max attempts
  v_window interval := interval '15 minutes';
  v_lock_duration interval := interval '15 minutes';
  v_rec public.account_lockouts;
begin
  -- Only process failures
  if new.success is false then
    -- Upsert into account_lockouts
    insert into public.account_lockouts(user_id, attempt_count, window_started)
    values (new.user_id, 1, now())
    on conflict (user_id) do update
      set attempt_count = case
        when now() - public.account_lockouts.window_started > v_window then 1
        else public.account_lockouts.attempt_count + 1 end,
          window_started = case
            when now() - public.account_lockouts.window_started > v_window then now()
            else public.account_lockouts.window_started end
    returning * into v_rec;

    if v_rec.attempt_count >= v_threshold then
      update public.account_lockouts
        set locked_until = now() + v_lock_duration,
            lock_reason = 'Too many failed login attempts'
        where user_id = new.user_id;
    end if;
  else
    -- On successful login, reset counters
    update public.account_lockouts
      set attempt_count = 0,
          window_started = now(),
          locked_until = null,
          lock_reason = null
      where user_id = new.user_id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists login_history_lockout_trg on public.login_history;
create trigger login_history_lockout_trg
after insert on public.login_history
for each row execute function public.update_lockout_on_login();

-- Onboarding schema: onboarding_status
create table if not exists public.onboarding_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_step text not null default 'select-role',
  steps_completed int not null default 0,
  profile_completion_percentage int not null default 0 check (profile_completion_percentage between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists onboarding_current_step_idx on public.onboarding_status(current_step);

alter table public.onboarding_status enable row level security;
drop policy if exists onboarding_select_own on public.onboarding_status;
create policy onboarding_select_own on public.onboarding_status
  for select using (auth.uid() = user_id);
drop policy if exists onboarding_update_own on public.onboarding_status;
create policy onboarding_update_own on public.onboarding_status
  for update using (auth.uid() = user_id);
drop policy if exists onboarding_insert_service on public.onboarding_status;
create policy onboarding_insert_service on public.onboarding_status
  for insert with check (auth.role() = 'service_role');

create or replace function public.onboarding_after_registration()
returns trigger as $$
begin
  insert into public.onboarding_status(user_id)
  values (new.user_id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql;

drop trigger if exists app_users_onboarding_init_trg on public.app_users;
create trigger app_users_onboarding_init_trg
after insert on public.app_users
for each row execute function public.onboarding_after_registration();

-- Maintain updated_at
create or replace function public.set_updated_at_generic()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists onboarding_set_updated_at on public.onboarding_status;
create trigger onboarding_set_updated_at
before update on public.onboarding_status
for each row execute function public.set_updated_at_generic();

-- Realtime publications: include app_users and onboarding_status
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    execute 'alter publication supabase_realtime add table public.app_users';
    execute 'alter publication supabase_realtime add table public.onboarding_status';
  end if;
end $$;