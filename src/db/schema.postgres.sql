-- SIH Team Matcher — Supabase/PostgreSQL production schema
-- This mirrors the SQLite schema used for local/dev in schema.sqlite.sql.
-- Apply this in the Supabase SQL editor when migrating from local dev to production.

create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  college text not null,
  branch text not null,
  year int not null,
  experience text not null check (experience in ('Beginner','Intermediate','Advanced')),
  availability text not null check (availability in ('Full-time','Part-time','Flexible')),
  bio text default '',
  is_looking_for_team boolean not null default true,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists skills (
  id serial primary key,
  name text unique not null
);

create table if not exists user_skills (
  profile_id uuid references profiles(id) on delete cascade,
  skill_id int references skills(id) on delete cascade,
  primary key (profile_id, skill_id)
);

create table if not exists roles (
  id serial primary key,
  name text unique not null
);

create table if not exists user_roles (
  profile_id uuid references profiles(id) on delete cascade,
  role_id int references roles(id) on delete cascade,
  primary key (profile_id, role_id)
);

create table if not exists problem_statements (
  id serial primary key,
  title text not null,
  description text default '',
  category text default '',
  is_active boolean not null default true
);

create table if not exists profile_problem_statements (
  profile_id uuid references profiles(id) on delete cascade,
  problem_statement_id int references problem_statements(id) on delete cascade,
  primary key (profile_id, problem_statement_id)
);

create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  leader_profile_id uuid references profiles(id) on delete cascade,
  problem_statement_id int references problem_statements(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists team_members (
  team_id uuid references teams(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  role_id int references roles(id),
  joined_at timestamptz not null default now(),
  primary key (team_id, profile_id)
);

create table if not exists team_requests (
  id uuid primary key default uuid_generate_v4(),
  sender_profile_id uuid references profiles(id) on delete cascade,
  receiver_profile_id uuid references profiles(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  receiver_profile_id uuid references profiles(id) on delete cascade,
  type text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_user_skills_skill on user_skills(skill_id);
create index if not exists idx_user_roles_role on user_roles(role_id);
create index if not exists idx_pps_ps on profile_problem_statements(problem_statement_id);
create index if not exists idx_team_requests_receiver on team_requests(receiver_profile_id);
create index if not exists idx_team_requests_sender on team_requests(sender_profile_id);
create index if not exists idx_notifications_receiver on notifications(receiver_profile_id);
create index if not exists idx_profiles_college on profiles(college);
create index if not exists idx_profiles_availability on profiles(availability);

-- Row Level Security
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table team_requests enable row level security;
alter table notifications enable row level security;
alter table user_skills enable row level security;
alter table user_roles enable row level security;
alter table profile_problem_statements enable row level security;

-- profiles: everyone (authenticated) can read all profiles (public discovery),
-- but only the owner can insert/update/delete their own row.
create policy "profiles_select_all" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

create policy "user_skills_select_all" on user_skills for select using (true);
create policy "user_skills_owner_write" on user_skills for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "user_roles_select_all" on user_roles for select using (true);
create policy "user_roles_owner_write" on user_roles for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "pps_select_all" on profile_problem_statements for select using (true);
create policy "pps_owner_write" on profile_problem_statements for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- teams: readable by all authenticated users; only the leader can modify
create policy "teams_select_all" on teams for select using (auth.role() = 'authenticated');
create policy "teams_insert_leader" on teams for insert with check (auth.uid() = leader_profile_id);
create policy "teams_update_leader" on teams for update using (auth.uid() = leader_profile_id);

create policy "team_members_select_all" on team_members for select using (auth.role() = 'authenticated');
create policy "team_members_leader_write" on team_members for all using (
  exists (select 1 from teams t where t.id = team_id and t.leader_profile_id = auth.uid())
);

-- team_requests: only sender or receiver may see/act on a request
create policy "team_requests_select_own" on team_requests for select using (
  auth.uid() = sender_profile_id or auth.uid() = receiver_profile_id
);
create policy "team_requests_insert_sender" on team_requests for insert with check (auth.uid() = sender_profile_id);
create policy "team_requests_update_receiver" on team_requests for update using (auth.uid() = receiver_profile_id or auth.uid() = sender_profile_id);

-- notifications: only the receiver may see/update their own notifications
create policy "notifications_select_own" on notifications for select using (auth.uid() = receiver_profile_id);
create policy "notifications_update_own" on notifications for update using (auth.uid() = receiver_profile_id);
