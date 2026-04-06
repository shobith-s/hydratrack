-- =============================================================================
-- HydroTrack — Supabase Schema
-- =============================================================================
-- Run this entire file in your Supabase project's SQL Editor:
--   Dashboard → SQL Editor → New query → paste → Run
--
-- Prerequisites:
--   • A free Supabase project (https://supabase.com)
--   • Supabase Auth enabled (it is by default)
-- =============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =============================================================================
-- TABLES
-- =============================================================================

-- users: one row per authenticated user (created on first sign-in)
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  daily_goal_ml int not null default 3000
);

-- drink_logs: one row per recorded drink attempt
create table if not exists public.drink_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  logged_at   timestamptz not null default now(),
  confirmed   boolean not null,
  confidence  float,
  frames_sent int
);

-- push_subscriptions: VAPID Web Push subscription per user
-- One active subscription per user (last-write-wins on upsert)
create table if not exists public.push_subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  subscription_json jsonb not null,
  created_at        timestamptz not null default now(),
  constraint push_subscriptions_user_id_unique unique (user_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists idx_drink_logs_user_logged
  on public.drink_logs (user_id, logged_at desc);

create index if not exists idx_push_subs_user
  on public.push_subscriptions (user_id);

-- =============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- =============================================================================
-- Users can only access their own rows. The backend uses the service_role key
-- which bypasses RLS — that is intentional for the scheduler and analytics.

alter table public.drink_logs enable row level security;
alter table public.push_subscriptions enable row level security;

-- drink_logs policies
create policy "Users can insert their own drink logs"
  on public.drink_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can read their own drink logs"
  on public.drink_logs for select
  using (auth.uid() = user_id);

-- push_subscriptions policies
create policy "Users can manage their own push subscription"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- TRIGGER: auto-create user row on first auth sign-in
-- =============================================================================
-- This keeps the users table in sync with Supabase Auth without any
-- extra API call from the frontend.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
