-- ==============================================================================
-- FREEDAYZZ PULSE // SUPABASE DATABASE SCHEMA
-- Multi-Tenant Running Analytics, Base Role System & Dynamic Biometrics
-- ==============================================================================

-- 1. PROFILES TABLE (Extends Supabase auth.users with Base Roles)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'athlete' check (role in ('athlete', 'coach', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ATHLETE BIOMETRICS TABLE (Auto-Adjust RHR 7-Day & Dynamic HR Methods)
create table if not exists public.athlete_biometrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  max_hr int default 195,
  resting_hr int default 50,
  lthr int,
  hr_zone_method text default 'HRR' check (hr_zone_method in ('HRR', 'MAX_HR', 'LTHR')),
  auto_sync_rhr boolean default true, -- Dynamic Auto-Adjust from Garmin Rolling RHR
  weekly_target_km numeric default 30.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. USER GARMIN CONNECTIONS (Isolated Garmin API sync state per user)
create table if not exists public.user_garmin_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  garmin_display_name text,
  is_active boolean default true,
  last_synced_at timestamp with time zone,
  sync_status text default 'IDLE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.athlete_biometrics enable row level security;
alter table public.user_garmin_connections enable row level security;

-- 5. RLS POLICIES (Users can only read and update their own data)
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can view own biometrics" 
  on public.athlete_biometrics for select 
  using (auth.uid() = user_id);

create policy "Users can update own biometrics" 
  on public.athlete_biometrics for update 
  using (auth.uid() = user_id);

create policy "Users can view own garmin connection" 
  on public.user_garmin_connections for select 
  using (auth.uid() = user_id);

create policy "Users can update own garmin connection" 
  on public.user_garmin_connections for update 
  using (auth.uid() = user_id);

-- 6. AUTOMATIC TRIGGER: Auto-create Profile & Biometrics on User Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert into profiles
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'athlete')
  );

  -- Insert default biometrics with auto-adjust enabled
  insert into public.athlete_biometrics (user_id, max_hr, resting_hr, hr_zone_method, auto_sync_rhr, weekly_target_km)
  values (
    new.id,
    195,
    50,
    'HRR',
    true,
    30.0
  );

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
