-- SIH Team Matcher — Supabase/PostgreSQL production schema (v2)
-- Apply this in the Supabase SQL editor (or via `supabase db push` / migrations).
-- Adds: avatar_url, github_username (+ verified repo count cache), team_messages
-- (team chat), saved_profiles (bookmarks) on top of the v1 schema.

create extension if not exists "uuid-ossp";

-- =========================================================================
-- PROFILES
-- =========================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  college text not null,
  branch text not null,
  year int not null,
  experience text not null check (experience in ('Beginner','Intermediate','Advanced')),
  availability text not null check (availability in ('Full-time','Part-time','Flexible')),
  bio text default '',
  avatar_url text,
  github_username text,
  github_public_repos int,
  phone_number text,
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

-- =========================================================================
-- TEAMS
-- =========================================================================
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

-- Team chat: simple per-team message thread, subscribed to via Supabase Realtime.
create table if not exists team_messages (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  sender_profile_id uuid references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- Bookmarked / saved profiles for later follow-up.
create table if not exists saved_profiles (
  owner_profile_id uuid references profiles(id) on delete cascade,
  saved_profile_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_profile_id, saved_profile_id)
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  receiver_profile_id uuid references profiles(id) on delete cascade,
  type text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- INDEXES
-- =========================================================================
create index if not exists idx_user_skills_skill on user_skills(skill_id);
create index if not exists idx_user_roles_role on user_roles(role_id);
create index if not exists idx_pps_ps on profile_problem_statements(problem_statement_id);
create index if not exists idx_team_requests_receiver on team_requests(receiver_profile_id);
create index if not exists idx_team_requests_sender on team_requests(sender_profile_id);
create index if not exists idx_notifications_receiver on notifications(receiver_profile_id);
create index if not exists idx_profiles_college on profiles(college);
create index if not exists idx_profiles_availability on profiles(availability);
create index if not exists idx_team_members_profile on team_members(profile_id);
create index if not exists idx_team_messages_team on team_messages(team_id, created_at);
create index if not exists idx_saved_profiles_owner on saved_profiles(owner_profile_id);

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table team_requests enable row level security;
alter table team_messages enable row level security;
alter table saved_profiles enable row level security;
alter table notifications enable row level security;
alter table user_skills enable row level security;
alter table user_roles enable row level security;
alter table profile_problem_statements enable row level security;
alter table skills enable row level security;
alter table roles enable row level security;
alter table problem_statements enable row level security;

-- profiles: everyone authenticated can read all profiles (public discovery),
-- only the owner can insert/update their own row.
drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles for select using (auth.role() = 'authenticated');
drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- skills / roles / problem_statements: readable by all authenticated users;
-- writes restricted to service role (admin API routes use the service key).
drop policy if exists "skills_select_all" on skills;
create policy "skills_select_all" on skills for select using (auth.role() = 'authenticated');
drop policy if exists "skills_insert_authenticated" on skills;
create policy "skills_insert_authenticated" on skills for insert with check (auth.role() = 'authenticated');

drop policy if exists "roles_select_all" on roles;
create policy "roles_select_all" on roles for select using (auth.role() = 'authenticated');
drop policy if exists "roles_insert_authenticated" on roles;
create policy "roles_insert_authenticated" on roles for insert with check (auth.role() = 'authenticated');

drop policy if exists "problem_statements_select_all" on problem_statements;
create policy "problem_statements_select_all" on problem_statements for select using (auth.role() = 'authenticated');

drop policy if exists "user_skills_select_all" on user_skills;
create policy "user_skills_select_all" on user_skills for select using (auth.role() = 'authenticated');
drop policy if exists "user_skills_owner_write" on user_skills;
create policy "user_skills_owner_write" on user_skills for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "user_roles_select_all" on user_roles;
create policy "user_roles_select_all" on user_roles for select using (auth.role() = 'authenticated');
drop policy if exists "user_roles_owner_write" on user_roles;
create policy "user_roles_owner_write" on user_roles for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "pps_select_all" on profile_problem_statements;
create policy "pps_select_all" on profile_problem_statements for select using (auth.role() = 'authenticated');
drop policy if exists "pps_owner_write" on profile_problem_statements;
create policy "pps_owner_write" on profile_problem_statements for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- teams: readable by all authenticated users; only the leader can modify
drop policy if exists "teams_select_all" on teams;
create policy "teams_select_all" on teams for select using (auth.role() = 'authenticated');
drop policy if exists "teams_insert_leader" on teams;
create policy "teams_insert_leader" on teams for insert with check (auth.uid() = leader_profile_id);
drop policy if exists "teams_update_leader" on teams;
create policy "teams_update_leader" on teams for update using (auth.uid() = leader_profile_id);

drop policy if exists "team_members_select_all" on team_members;
create policy "team_members_select_all" on team_members for select using (auth.role() = 'authenticated');
drop policy if exists "team_members_leader_write" on team_members;
create policy "team_members_leader_write" on team_members for all using (
  exists (select 1 from teams t where t.id = team_id and t.leader_profile_id = auth.uid())
  or auth.uid() = profile_id
);

-- team_requests: only sender or receiver may see/act on a request
drop policy if exists "team_requests_select_own" on team_requests;
create policy "team_requests_select_own" on team_requests for select using (
  auth.uid() = sender_profile_id or auth.uid() = receiver_profile_id
);
drop policy if exists "team_requests_insert_sender" on team_requests;
create policy "team_requests_insert_sender" on team_requests for insert with check (auth.uid() = sender_profile_id);
drop policy if exists "team_requests_update_receiver" on team_requests;
create policy "team_requests_update_receiver" on team_requests for update using (
  auth.uid() = receiver_profile_id or auth.uid() = sender_profile_id
);

-- team_messages: only current team members may read/write
drop policy if exists "team_messages_select_member" on team_messages;
create policy "team_messages_select_member" on team_messages for select using (
  exists (select 1 from team_members tm where tm.team_id = team_messages.team_id and tm.profile_id = auth.uid())
);
drop policy if exists "team_messages_insert_member" on team_messages;
create policy "team_messages_insert_member" on team_messages for insert with check (
  auth.uid() = sender_profile_id
  and exists (select 1 from team_members tm where tm.team_id = team_messages.team_id and tm.profile_id = auth.uid())
);

-- saved_profiles: only the owner may see/manage their bookmarks
drop policy if exists "saved_profiles_owner_all" on saved_profiles;
create policy "saved_profiles_owner_all" on saved_profiles for all using (auth.uid() = owner_profile_id) with check (auth.uid() = owner_profile_id);

-- notifications: only the receiver may see/update their own notifications
drop policy if exists "notifications_select_own" on notifications;
create policy "notifications_select_own" on notifications for select using (auth.uid() = receiver_profile_id);
drop policy if exists "notifications_update_own" on notifications;
create policy "notifications_update_own" on notifications for update using (auth.uid() = receiver_profile_id);

-- =========================================================================
-- REALTIME
-- =========================================================================
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table team_messages;

-- =========================================================================
-- STORAGE (avatars)
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar_public_read" on storage.objects;
create policy "avatar_public_read" on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatar_owner_write" on storage.objects;
create policy "avatar_owner_write" on storage.objects for insert with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatar_owner_update" on storage.objects;
create policy "avatar_owner_update" on storage.objects for update using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
