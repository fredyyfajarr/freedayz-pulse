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
  garmin_api_key text, -- Personal API Key or token for Garmin BYOK
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
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

drop policy if exists "Users can view own biometrics" on public.athlete_biometrics;
create policy "Users can view own biometrics" 
  on public.athlete_biometrics for select 
  using (auth.uid() = user_id);

drop policy if exists "Users can update own biometrics" on public.athlete_biometrics;
create policy "Users can update own biometrics" 
  on public.athlete_biometrics for update 
  using (auth.uid() = user_id);

drop policy if exists "Users can view own garmin connection" on public.user_garmin_connections;
create policy "Users can view own garmin connection" 
  on public.user_garmin_connections for select 
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own garmin connection" on public.user_garmin_connections;
create policy "Users can insert own garmin connection" 
  on public.user_garmin_connections for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own garmin connection" on public.user_garmin_connections;
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

-- ==============================================================================
-- 7. COACHING MODULE TABLES (Cross-Device Sync for Coach Roster & Tasks)
-- ==============================================================================

create table if not exists public.squad_athletes (
  id text primary key,
  coach_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text not null,
  target_race text default '',
  acwr numeric default 1.0,
  acwr_zone text default 'SWEET_SPOT' check (acwr_zone in ('SWEET_SPOT', 'WARNING', 'DANGER')),
  weekly_mileage_km numeric default 0,
  target_weekly_km numeric default 30,
  last_session text default '-',
  tsb numeric default 0,
  package_tier text default 'Standard',
  joined_at text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.coach_tasks (
  id text primary key,
  coach_id uuid references public.profiles(id) on delete cascade not null,
  athlete_id text not null,
  athlete_name text not null,
  athlete_email text,
  coach_name text not null,
  title text not null,
  type text not null check (type in ('INTERVAL', 'TEMPO', 'LONG_RUN', 'RECOVERY', 'STRENGTH_DRILL', 'RACE_SIMULATION')),
  due_date text not null,
  target_distance_km numeric default 0,
  target_pace text default '',
  target_hr_zone text default '',
  instructions text default '',
  status text default 'PENDING' check (status in ('PENDING', 'COMPLETED', 'MISSED')),
  completed_at timestamp with time zone,
  reported_rpe int,
  athlete_feedback text,
  coach_review_note text,
  adherence_score int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.squad_athletes enable row level security;
alter table public.coach_tasks enable row level security;

drop policy if exists "Coaches manage own squad athletes" on public.squad_athletes;
create policy "Coaches manage own squad athletes"
  on public.squad_athletes for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

drop policy if exists "Coaches manage own tasks" on public.coach_tasks;
create policy "Coaches manage own tasks"
  on public.coach_tasks for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

drop policy if exists "Athletes can view and update assigned tasks" on public.coach_tasks;
create policy "Athletes can view and update assigned tasks"
  on public.coach_tasks for select
  using (lower(athlete_email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Athletes can submit feedback on assigned tasks" on public.coach_tasks;
create policy "Athletes can submit feedback on assigned tasks"
  on public.coach_tasks for update
  using (lower(athlete_email) = lower(auth.jwt() ->> 'email'));

-- ==============================================================================
-- 8. MULTI-TENANT TELEMETRY TABLES (Per-User Activities, Streams, PRs & Sync)
-- ==============================================================================

create table if not exists public.activities (
  user_id uuid references public.profiles(id) on delete cascade not null,
  id text not null,
  start_time timestamp with time zone not null,
  sport_type text default 'running',
  name text not null,
  distance_meters numeric default 0,
  duration_seconds numeric default 0,
  payload jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, id)
);

create index if not exists idx_activities_user_start
  on public.activities (user_id, start_time desc);

create table if not exists public.activity_details (
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_id text not null,
  payload jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, activity_id)
);

create table if not exists public.best_efforts (
  user_id uuid references public.profiles(id) on delete cascade not null,
  id text not null,
  milestone text not null,
  time_seconds numeric not null,
  payload jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, id)
);

create table if not exists public.sync_states (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  last_synced_at timestamp with time zone not null
);

alter table public.activities enable row level security;
alter table public.activity_details enable row level security;
alter table public.best_efforts enable row level security;
alter table public.sync_states enable row level security;

drop policy if exists "Users manage own activities" on public.activities;
create policy "Users manage own activities"
  on public.activities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own activity details" on public.activity_details;
create policy "Users manage own activity details"
  on public.activity_details for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own best efforts" on public.best_efforts;
create policy "Users manage own best efforts"
  on public.best_efforts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own sync state" on public.sync_states;
create policy "Users manage own sync state"
  on public.sync_states for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
