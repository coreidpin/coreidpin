-- Supabase SQL migration: profiles and login_history tables
-- Created: 2025-11-11

-- Profiles table stores extended user profile metadata
create table if not exists public.profiles (
  user_id uuid primary key,
  email text not null,
  name text,
  user_type text check (user_type in ('professional','employer','university')),
  company_name text,
  role text,
  institution text,
  gender text,
  profile_complete boolean default false,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional: link to auth.users if available
alter table public.profiles
  add constraint profiles_user_fk
  foreign key (user_id) references auth.users(id) on delete cascade;

create index if not exists profiles_user_type_idx on public.profiles(user_type);
create index if not exists profiles_email_idx on public.profiles(email);

-- Enable RLS and allow users to read/update their own profile
alter table public.profiles enable row level security;
create policy if not exists select_own_profile on public.profiles
  for select using (auth.uid() = user_id);
create policy if not exists update_own_profile on public.profiles
  for update using (auth.uid() = user_id);
create policy if not exists insert_service_role on public.profiles
  for insert with check (auth.role() = 'service_role');

-- Login history for auditing and security
create table if not exists public.login_history (
  id bigserial primary key,
  user_id uuid,
  email text,
  ip text,
  user_agent text,
  success boolean not null,
  reason text,
  created_at timestamptz default now()
);

alter table public.login_history
  add constraint login_history_user_fk
  foreign key (user_id) references auth.users(id) on delete set null;

create index if not exists login_history_user_idx on public.login_history(user_id);
create index if not exists login_history_email_idx on public.login_history(email);
create index if not exists login_history_created_idx on public.login_history(created_at);

-- RLS: allow users to read their own login history; writes reserved for service role
alter table public.login_history enable row level security;
create policy if not exists select_own_login_history on public.login_history
  for select using (auth.uid() = user_id);
create policy if not exists insert_service_role_login_history on public.login_history
  for insert with check (auth.role() = 'service_role');

-- Trigger to maintain updated_at on profiles
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();