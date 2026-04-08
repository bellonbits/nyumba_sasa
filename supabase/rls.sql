-- ============================================================
-- NYUMBA SASA — Row Level Security (RLS) Policies
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================
alter table public.users enable row level security;

-- Anyone can view user profiles (needed for agent contact info)
create policy "Users are publicly viewable"
  on public.users for select
  using (true);

-- Users can only update their own profile
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Insert handled by trigger (see seed.sql) — no direct insert from client
create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- ============================================================
-- LISTINGS
-- ============================================================
alter table public.listings enable row level security;

-- Approved listings are publicly viewable; agents see their own; admins see all
create policy "Listings: public can view approved"
  on public.listings for select
  using (
    status = 'approved'
    or agent_id = auth.uid()
    or exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only agents and admins can create listings
create policy "Listings: agents can create"
  on public.listings for insert
  with check (
    agent_id = auth.uid()
    and exists (
      select 1 from public.users
      where id = auth.uid() and role in ('agent', 'admin')
    )
  );

-- Agents can update their own; admins can update any
create policy "Listings: agents/admins can update"
  on public.listings for update
  using (
    agent_id = auth.uid()
    or exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Agents can delete their own; admins can delete any
create policy "Listings: agents/admins can delete"
  on public.listings for delete
  using (
    agent_id = auth.uid()
    or exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- FAVORITES
-- ============================================================
alter table public.favorites enable row level security;

-- Users can only see their own favorites
create policy "Favorites: users see own"
  on public.favorites for select
  using (user_id = auth.uid());

-- Users can add favorites
create policy "Favorites: users can insert"
  on public.favorites for insert
  with check (user_id = auth.uid());

-- Users can delete their own favorites
create policy "Favorites: users can delete own"
  on public.favorites for delete
  using (user_id = auth.uid());

-- ============================================================
-- MESSAGES
-- ============================================================
alter table public.messages enable row level security;

-- Users can only see messages they sent or received
create policy "Messages: participants can view"
  on public.messages for select
  using (
    sender_id = auth.uid()
    or receiver_id = auth.uid()
  );

-- Authenticated users can send messages
create policy "Messages: authenticated can insert"
  on public.messages for insert
  with check (sender_id = auth.uid());

-- Users can mark their own received messages as read
create policy "Messages: receiver can update is_read"
  on public.messages for update
  using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());
