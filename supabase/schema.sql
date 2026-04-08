-- ============================================================
-- NYUMBA SASA — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('user', 'agent', 'admin');
create type listing_status as enum ('pending', 'approved', 'rejected');
create type listing_type as enum ('rent', 'buy');

-- ============================================================
-- USERS TABLE
-- Mirrors Supabase auth.users — populated on sign-up
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  phone       text not null default '',
  role        user_role not null default 'user',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Index for role-based queries
create index on public.users (role);

-- ============================================================
-- LISTINGS TABLE
-- ============================================================
create table if not exists public.listings (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text not null,
  price         numeric(12, 2) not null check (price >= 0),
  listing_type  listing_type not null,
  location      text not null,
  city          text not null,
  bedrooms      integer not null default 1 check (bedrooms >= 0),
  bathrooms     integer not null default 1 check (bathrooms >= 0),
  area_sqm      numeric(8, 2),
  images        text[] not null default '{}',
  amenities     text[] not null default '{}',
  agent_id      uuid not null references public.users(id) on delete cascade,
  status        listing_status not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes for common filter queries
create index on public.listings (status);
create index on public.listings (listing_type);
create index on public.listings (city);
create index on public.listings (agent_id);
create index on public.listings (created_at desc);

-- Full-text search index
create index on public.listings using gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, '') || ' ' || coalesce(city, ''))
);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger listings_updated_at
  before update on public.listings
  for each row execute function update_updated_at_column();

-- ============================================================
-- FAVORITES TABLE
-- ============================================================
create table if not exists public.favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index on public.favorites (user_id);
create index on public.favorites (listing_id);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
create table if not exists public.messages (
  id           uuid primary key default uuid_generate_v4(),
  sender_id    uuid not null references public.users(id) on delete cascade,
  receiver_id  uuid not null references public.users(id) on delete cascade,
  listing_id   uuid not null references public.listings(id) on delete cascade,
  text         text not null check (length(text) > 0),
  is_read      boolean not null default false,
  created_at   timestamptz not null default now(),
  constraint no_self_message check (sender_id != receiver_id)
);

create index on public.messages (sender_id);
create index on public.messages (receiver_id);
create index on public.messages (listing_id);
create index on public.messages (created_at desc);

-- ============================================================
-- REALTIME: enable for messages table
-- ============================================================
alter publication supabase_realtime add table public.messages;
