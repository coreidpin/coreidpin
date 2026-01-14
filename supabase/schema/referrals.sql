-- Referrals table schema for GidiPIN invites
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_user_id uuid not null,
  contact text,
  channel text not null check (channel in ('email','sms','whatsapp','link')),
  status text not null default 'sent' check (status in ('sent','accepted','expired')),
  is_default boolean not null default false,
  referral_code text not null unique,
  referral_link text not null,
  sent_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  moderation_status text default 'clean' check (moderation_status in ('clean','reported','blocked')),
  report_count int not null default 0,
  report_reason text
);

-- Ensure column exists for existing installations
alter table public.referrals add column if not exists is_default boolean not null default false;

create index if not exists referrals_inviter_idx on public.referrals(inviter_user_id);
create index if not exists referrals_status_idx on public.referrals(status);
create index if not exists referrals_default_idx on public.referrals(inviter_user_id) where is_default = true;

-- Optional: RLS (leave disabled if using service role)
alter table public.referrals enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'referrals' and policyname = 'referrals_select_own'
  ) then
    create policy referrals_select_own on public.referrals for select
      using (auth.uid() = inviter_user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'referrals' and policyname = 'referrals_insert_self'
  ) then
    create policy referrals_insert_self on public.referrals for insert
      with check (auth.uid() = inviter_user_id);
  end if;
end $$;
