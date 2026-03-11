create extension if not exists "pgcrypto";

create type public.noise_level as enum ('Quiet', 'Moderate', 'Buzzing');
create type public.outlet_availability as enum ('Sparse', 'Decent', 'Plentiful');
create type public.creature_rarity as enum ('Common', 'Rare', 'Epic');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  major text,
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.creatures (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  rarity public.creature_rarity not null,
  description text not null,
  accent text not null,
  illustration text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_spots (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  building_code text not null,
  description text not null,
  long_description text not null,
  tags text[] not null default '{}',
  noise_level public.noise_level not null,
  outlet_availability public.outlet_availability not null,
  featured_creature_id uuid not null references public.creatures (id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  study_spot_id uuid not null references public.study_spots (id) on delete cascade,
  duration_minutes integer not null check (duration_minutes in (25, 45, 60)),
  xp_earned integer not null check (xp_earned >= 0),
  creature_granted_id uuid references public.creatures (id),
  completed_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_creatures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  creature_id uuid not null references public.creatures (id) on delete cascade,
  origin_spot_id uuid not null references public.study_spots (id) on delete cascade,
  acquired_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  due_at timestamptz,
  completed boolean not null default false,
  xp_reward integer not null default 20 check (xp_reward >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, major)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'major'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_creatures enable row level security;
alter table public.tasks enable row level security;
alter table public.study_spots enable row level security;
alter table public.creatures enable row level security;

create policy "profiles are viewable by owner"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles are updatable by owner"
on public.profiles
for update
using (auth.uid() = id);

create policy "study spots are public readable"
on public.study_spots
for select
using (true);

create policy "creatures are public readable"
on public.creatures
for select
using (true);

create policy "sessions owned by user"
on public.study_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user creatures owned by user"
on public.user_creatures
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tasks owned by user"
on public.tasks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
