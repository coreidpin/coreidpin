-- KV Store table for app-level key/value data
-- Created: 2025-11-11

create table if not exists public.kv_store_5cd3a043 (
  key text primary key,
  value jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Keep updated_at fresh on updates
create or replace function public.set_updated_at_kv_store()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kv_store_set_updated_at on public.kv_store_5cd3a043;
create trigger kv_store_set_updated_at
before update on public.kv_store_5cd3a043
for each row execute function public.set_updated_at_kv_store();

-- Enable RLS; restrict access to service role only
alter table public.kv_store_5cd3a043 enable row level security;

drop policy if exists kv_store_select_service on public.kv_store_5cd3a043;
create policy kv_store_select_service on public.kv_store_5cd3a043
  for select using (auth.role() = 'service_role');

drop policy if exists kv_store_write_service on public.kv_store_5cd3a043;
create policy kv_store_write_service on public.kv_store_5cd3a043
  for insert with check (auth.role() = 'service_role');

drop policy if exists kv_store_update_service on public.kv_store_5cd3a043;
create policy kv_store_update_service on public.kv_store_5cd3a043
  for update using (auth.role() = 'service_role');

drop policy if exists kv_store_delete_service on public.kv_store_5cd3a043;
create policy kv_store_delete_service on public.kv_store_5cd3a043
  for delete using (auth.role() = 'service_role');

-- Index on key is implicit via primary key; create GIN index for JSON queries (optional)
create index if not exists kv_store_value_gin_idx on public.kv_store_5cd3a043 using gin (value);