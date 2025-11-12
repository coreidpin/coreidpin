-- Structured onboarding flow with templates, steps, sequencing, and email verification
-- Created: 2025-11-11

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'onboarding_step_key') then
    create type onboarding_step_key as enum (
      'registration',
      'verify_email',
      'profile_setup',
      'initial_setup',
      'terms_acceptance',
      'privacy_acknowledgment',
      'success_confirmation'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'onboarding_step_status') then
    create type onboarding_step_status as enum ('pending','in_progress','completed','skipped','error');
  end if;
end$$;

-- Required extensions
create extension if not exists pgcrypto;

-- Email verifications table (tracks confirmation link lifecycle)
create table if not exists public.email_verifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  sent_at timestamptz default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  method text default 'link',
  status text not null default 'active' check (status in ('active','expired','used'))
);

alter table public.email_verifications enable row level security;
drop policy if exists email_verifications_select_own on public.email_verifications;
create policy email_verifications_select_own on public.email_verifications
  for select using (auth.uid() = user_id);
drop policy if exists email_verifications_insert_service on public.email_verifications;
create policy email_verifications_insert_service on public.email_verifications
  for insert with check (auth.role() = 'service_role');
drop policy if exists email_verifications_update_service on public.email_verifications;
create policy email_verifications_update_service on public.email_verifications
  for update using (auth.role() = 'service_role');

create index if not exists email_verifications_user_idx on public.email_verifications(user_id);
create index if not exists email_verifications_status_idx on public.email_verifications(status);
create index if not exists email_verifications_expires_idx on public.email_verifications(expires_at);

create or replace function public.create_email_verification(p_user_id uuid, p_ttl interval default interval '48 hours')
returns text as $$
declare v_token text;
begin
  v_token := encode(gen_random_bytes(32), 'hex');
  insert into public.email_verifications(user_id, token, expires_at)
    values (p_user_id, v_token, now() + p_ttl);
  return v_token;
end;
$$ language plpgsql security definer;

-- Maintain status without volatile generated columns
create or replace function public.email_verifications_set_status()
returns trigger as $$
begin
  if new.used_at is not null then
    new.status := 'used';
  elsif new.expires_at <= now() then
    new.status := 'expired';
  else
    new.status := 'active';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists email_verifications_set_status_trg on public.email_verifications;
create trigger email_verifications_set_status_trg
before insert or update on public.email_verifications
for each row execute function public.email_verifications_set_status();

-- Add legal acceptance columns to app_users if missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='app_users' and column_name='terms_accepted'
  ) then
    alter table public.app_users add column terms_accepted boolean default false;
  end if;
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='app_users' and column_name='privacy_acknowledged'
  ) then
    alter table public.app_users add column privacy_acknowledged boolean default false;
  end if;
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='app_users' and column_name='terms_version'
  ) then
    alter table public.app_users add column terms_version text;
  end if;
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='app_users' and column_name='privacy_version'
  ) then
    alter table public.app_users add column privacy_version text;
  end if;
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='app_users' and column_name='legal_accepted_at'
  ) then
    alter table public.app_users add column legal_accepted_at timestamptz;
  end if;
end$$;

-- Onboarding flow templates
create table if not exists public.onboarding_flow_templates (
  id bigserial primary key,
  user_type text check (user_type in ('professional','employer','university')),
  name text not null,
  created_at timestamptz default now()
);

alter table public.onboarding_flow_templates enable row level security;
drop policy if exists onboarding_templates_select_all on public.onboarding_flow_templates;
create policy onboarding_templates_select_all on public.onboarding_flow_templates for select using (true);
drop policy if exists onboarding_templates_write_service on public.onboarding_flow_templates;
create policy onboarding_templates_write_service on public.onboarding_flow_templates for insert with check (auth.role() = 'service_role');
drop policy if exists onboarding_templates_update_service on public.onboarding_flow_templates;
create policy onboarding_templates_update_service on public.onboarding_flow_templates for update using (auth.role() = 'service_role');

-- Steps for templates
create table if not exists public.onboarding_template_steps (
  id bigserial primary key,
  template_id bigint not null references public.onboarding_flow_templates(id) on delete cascade,
  step_key onboarding_step_key not null,
  title text not null,
  description text,
  step_order int not null,
  required boolean not null default true,
  required_fields jsonb not null default '[]'::jsonb,
  validation_rules jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (template_id, step_order),
  unique (template_id, step_key)
);

create index if not exists onboarding_template_steps_order_idx on public.onboarding_template_steps(template_id, step_order);

alter table public.onboarding_template_steps enable row level security;
drop policy if exists template_steps_select_all on public.onboarding_template_steps;
create policy template_steps_select_all on public.onboarding_template_steps for select using (true);
drop policy if exists template_steps_write_service on public.onboarding_template_steps;
create policy template_steps_write_service on public.onboarding_template_steps for insert with check (auth.role() = 'service_role');
drop policy if exists template_steps_update_service on public.onboarding_template_steps;
create policy template_steps_update_service on public.onboarding_template_steps for update using (auth.role() = 'service_role');

-- User progress per step
create table if not exists public.onboarding_user_steps (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id bigint not null references public.onboarding_flow_templates(id) on delete cascade,
  step_key onboarding_step_key not null,
  status onboarding_step_status not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  context_data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, step_key)
);

create index if not exists onboarding_user_steps_user_idx on public.onboarding_user_steps(user_id);
create index if not exists onboarding_user_steps_status_idx on public.onboarding_user_steps(status);
create index if not exists onboarding_user_steps_template_idx on public.onboarding_user_steps(template_id);

alter table public.onboarding_user_steps enable row level security;
drop policy if exists user_steps_select_own on public.onboarding_user_steps;
create policy user_steps_select_own on public.onboarding_user_steps for select using (auth.uid() = user_id);
drop policy if exists user_steps_update_own on public.onboarding_user_steps;
create policy user_steps_update_own on public.onboarding_user_steps for update using (auth.uid() = user_id);
drop policy if exists user_steps_insert_service on public.onboarding_user_steps;
create policy user_steps_insert_service on public.onboarding_user_steps for insert with check (auth.role() = 'service_role');

-- Keep updated_at fresh
create or replace function public.set_updated_at_generic()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;

drop trigger if exists onboarding_user_steps_set_updated_at on public.onboarding_user_steps;
create trigger onboarding_user_steps_set_updated_at
before update on public.onboarding_user_steps
for each row execute function public.set_updated_at_generic();

-- Ensure onboarding_status has template_id
do $$
begin
  if not exists (
    select 1 from information_schema.columns where table_schema='public' and table_name='onboarding_status' and column_name='template_id'
  ) then
    alter table public.onboarding_status add column template_id bigint;
  end if;
end$$;

-- Seed: default templates and steps
insert into public.onboarding_flow_templates(user_type, name)
select * from (values
  ('professional','default'),
  ('employer','default'),
  ('university','default')
) v(user_type, name)
where not exists (
  select 1 from public.onboarding_flow_templates t where t.user_type = v.user_type and t.name = v.name
);

-- Helper function: get template id for a user
create or replace function public.get_user_template_id(p_user_id uuid)
returns bigint as $$
declare v_tid bigint; v_ut text; begin
  select template_id into v_tid from public.onboarding_status where user_id = p_user_id;
  if v_tid is not null then return v_tid; end if;
  -- fallback by user_type from profiles
  select user_type into v_ut from public.profiles where user_id = p_user_id;
  if v_ut is null then v_ut := 'professional'; end if;
  select id into v_tid from public.onboarding_flow_templates where user_type = v_ut and name = 'default' limit 1;
  return v_tid;
end; $$ language plpgsql;

-- Insert default steps for each seeded template
do $$
declare r record; begin
  for r in select id, user_type from public.onboarding_flow_templates loop
    -- Registration
    insert into public.onboarding_template_steps(template_id, step_key, title, description, step_order, required, required_fields, validation_rules)
    values (r.id, 'registration', 'Create account', 'Name, email, password', 1, true,
      '["name","email","password"]'::jsonb,
      '{"email":"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$","password":"complex"}'::jsonb)
    on conflict (template_id, step_key) do nothing;
    -- Verify Email
    insert into public.onboarding_template_steps(template_id, step_key, title, description, step_order, required)
    values (r.id, 'verify_email', 'Verify email', 'Confirm email via link', 2, true)
    on conflict (template_id, step_key) do nothing;
    -- Profile Setup
    insert into public.onboarding_template_steps(template_id, step_key, title, description, step_order, required)
    values (r.id, 'profile_setup', 'Complete profile', 'Optional information collection', 3, false)
    on conflict (template_id, step_key) do nothing;
    -- Initial Setup
    insert into public.onboarding_template_steps(template_id, step_key, title, description, step_order, required)
    values (r.id, 'initial_setup', 'Initial setup wizard', 'Configure platform features', 4, true)
    on conflict (template_id, step_key) do nothing;
    -- Terms
    insert into public.onboarding_template_steps(template_id, step_key, title, description, step_order, required)
    values (r.id, 'terms_acceptance', 'Accept terms', 'Agree to Terms of Service', 5, true)
    on conflict (template_id, step_key) do nothing;
    -- Privacy
    insert into public.onboarding_template_steps(template_id, step_key, title, description, step_order, required)
    values (r.id, 'privacy_acknowledgment', 'Acknowledge privacy policy', 'Confirm Privacy Policy', 6, true)
    on conflict (template_id, step_key) do nothing;
    -- Success
    insert into public.onboarding_template_steps(template_id, step_key, title, description, step_order, required)
    values (r.id, 'success_confirmation', 'Success page', 'Onboarding complete', 7, true)
    on conflict (template_id, step_key) do nothing;
  end loop;
end$$;

-- Initialize user steps after app_users insert
create or replace function public.init_user_onboarding_steps()
returns trigger as $$
declare v_tid bigint; begin
  v_tid := public.get_user_template_id(new.user_id);
  update public.onboarding_status set template_id = v_tid, current_step = 'registration' where user_id = new.user_id;
  -- Create all steps for user in pending state
  insert into public.onboarding_user_steps(user_id, template_id, step_key, status)
  select new.user_id, v_tid, s.step_key, 'pending'
  from public.onboarding_template_steps s
  where s.template_id = v_tid
  on conflict (user_id, step_key) do nothing;
  return new;
end; $$ language plpgsql;

drop trigger if exists app_users_onboarding_steps_init_trg on public.app_users;
create trigger app_users_onboarding_steps_init_trg
after insert on public.app_users
for each row execute function public.init_user_onboarding_steps();

-- Sequence enforcement: cannot complete a step before all prior required steps are completed
create or replace function public.enforce_onboarding_sequence()
returns trigger as $$
declare v_order int; v_tid bigint; v_missing int; begin
  if new.status = 'completed' then
    v_tid := new.template_id;
    select step_order into v_order from public.onboarding_template_steps where template_id = v_tid and step_key = new.step_key;
    -- count prior required steps not completed
    select count(*) into v_missing
    from public.onboarding_template_steps s
    where s.template_id = v_tid and s.step_order < v_order and s.required = true
      and not exists (
        select 1 from public.onboarding_user_steps us
        where us.user_id = new.user_id and us.step_key = s.step_key and us.status = 'completed'
      );
    if v_missing > 0 then
      raise exception 'Cannot complete step % before completing all required prior steps', new.step_key;
    end if;
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists onboarding_user_steps_sequence_trg on public.onboarding_user_steps;
create trigger onboarding_user_steps_sequence_trg
before insert or update on public.onboarding_user_steps
for each row execute function public.enforce_onboarding_sequence();

-- Step-specific rules
create or replace function public.enforce_step_specific_rules()
returns trigger as $$
declare v_ok boolean; begin
  if new.status = 'completed' then
    if new.step_key = 'registration' then
      -- Ensure base record exists and email/username are present
      perform 1 from public.app_users where user_id = new.user_id;
      if not found then raise exception 'Registration step requires app_users record'; end if;
    elsif new.step_key = 'verify_email' then
      -- Confirm via auth.users or email_verifications
      select (exists (select 1 from auth.users where id = new.user_id and email_confirmed_at is not null)
          or exists (select 1 from public.email_verifications where user_id = new.user_id and used_at is not null and expires_at > now()))
      into v_ok;
      if not v_ok then raise exception 'Email not verified yet'; end if;
    elsif new.step_key = 'profile_setup' then
      -- Optional step: allow completion without constraints
      -- Optionally check onboarding_status.profile_completion_percentage >= 40
      null; 
    elsif new.step_key = 'initial_setup' then
      -- Ensure some initial settings were provided in context_data
      if coalesce(jsonb_array_length(new.context_data -> 'features_enabled'), 0) = 0 then
        raise exception 'Initial setup requires selecting at least one feature';
      end if;
    elsif new.step_key = 'terms_acceptance' then
      perform 1 from public.app_users where user_id = new.user_id and terms_accepted = true and terms_version is not null;
      if not found then raise exception 'Terms must be accepted with version recorded'; end if;
    elsif new.step_key = 'privacy_acknowledgment' then
      perform 1 from public.app_users where user_id = new.user_id and privacy_acknowledged = true and privacy_version is not null;
      if not found then raise exception 'Privacy policy must be acknowledged with version recorded'; end if;
    elsif new.step_key = 'success_confirmation' then
      -- Ensure all required steps are completed
      perform 1 from public.onboarding_template_steps s
      where s.template_id = new.template_id and s.required = true
        and not exists (
          select 1 from public.onboarding_user_steps us
          where us.user_id = new.user_id and us.step_key = s.step_key and us.status = 'completed'
        );
      if found then raise exception 'All required steps must be completed before success'; end if;
    end if;
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists onboarding_user_steps_specific_trg on public.onboarding_user_steps;
create trigger onboarding_user_steps_specific_trg
before insert or update on public.onboarding_user_steps
for each row execute function public.enforce_step_specific_rules();

-- Keep onboarding_status.current_step in sync
create or replace function public.sync_onboarding_current_step()
returns trigger as $$
declare v_tid bigint; v_next_step onboarding_step_key; begin
  v_tid := new.template_id;
  if new.status = 'completed' then
    -- find the next step by order
    select s.step_key into v_next_step
    from public.onboarding_template_steps s
    where s.template_id = v_tid
      and s.step_order = (
        select s2.step_order + 1 from public.onboarding_template_steps s2
        where s2.template_id = v_tid and s2.step_key = new.step_key
      );
    update public.onboarding_status set current_step = coalesce(v_next_step::text, 'success_confirmation'), updated_at = now()
    where user_id = new.user_id;
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists onboarding_user_steps_sync_trg on public.onboarding_user_steps;
create trigger onboarding_user_steps_sync_trg
after update on public.onboarding_user_steps
for each row execute function public.sync_onboarding_current_step();

-- Realtime publications: broadcast progress changes
do $$
declare
  pub_oid oid;
begin
  select oid into pub_oid from pg_publication where pubname = 'supabase_realtime';
  if pub_oid is not null then
    if not exists (
      select 1
      from pg_publication_rel pr
      join pg_class c on c.oid = pr.prrelid
      join pg_namespace n on n.oid = c.relnamespace
      where pr.prpubid = pub_oid
        and n.nspname = 'public'
        and c.relname = 'onboarding_user_steps'
    ) then
      execute 'alter publication supabase_realtime add table public.onboarding_user_steps';
    end if;

    if not exists (
      select 1
      from pg_publication_rel pr
      join pg_class c on c.oid = pr.prrelid
      join pg_namespace n on n.oid = c.relnamespace
      where pr.prpubid = pub_oid
        and n.nspname = 'public'
        and c.relname = 'onboarding_template_steps'
    ) then
      execute 'alter publication supabase_realtime add table public.onboarding_template_steps';
    end if;

    if not exists (
      select 1
      from pg_publication_rel pr
      join pg_class c on c.oid = pr.prrelid
      join pg_namespace n on n.oid = c.relnamespace
      where pr.prpubid = pub_oid
        and n.nspname = 'public'
        and c.relname = 'email_verifications'
    ) then
      execute 'alter publication supabase_realtime add table public.email_verifications';
    end if;
  end if;
end $$;