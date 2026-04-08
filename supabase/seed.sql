-- ============================================================
-- NYUMBA SASA — Seed Data (optional, for development)
-- Requires a valid auth.users entry first.
-- Run AFTER schema.sql and rls.sql.
-- ============================================================

-- Auto-create user profile on sign-up via Supabase Auth hook
-- Dashboard > Authentication > Hooks > "after_user_created"
-- OR use this database trigger:

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
