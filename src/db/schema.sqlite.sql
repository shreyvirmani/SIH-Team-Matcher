-- SIH Team Matcher — local/dev schema (SQLite)
-- Mirrors src/db/schema.postgres.sql for the Supabase/Postgres production target.
-- UUIDs are stored as TEXT (generated in application code with crypto.randomUUID()).

create table if not exists users (
  id text primary key,
  email text unique not null,
  password_hash text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists profiles (
  id text primary key references users(id) on delete cascade,
  full_name text not null,
  college text not null,
  branch text not null,
  year integer not null,
  experience text not null,
  availability text not null,
  bio text default '',
  is_looking_for_team integer not null default 1,
  is_admin integer not null default 0,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists skills (
  id integer primary key autoincrement,
  name text unique not null
);

create table if not exists user_skills (
  profile_id text references profiles(id) on delete cascade,
  skill_id integer references skills(id) on delete cascade,
  primary key (profile_id, skill_id)
);

create table if not exists roles (
  id integer primary key autoincrement,
  name text unique not null
);

create table if not exists user_roles (
  profile_id text references profiles(id) on delete cascade,
  role_id integer references roles(id) on delete cascade,
  primary key (profile_id, role_id)
);

create table if not exists problem_statements (
  id integer primary key autoincrement,
  title text not null,
  description text default '',
  category text default '',
  is_active integer not null default 1
);

create table if not exists profile_problem_statements (
  profile_id text references profiles(id) on delete cascade,
  problem_statement_id integer references problem_statements(id) on delete cascade,
  primary key (profile_id, problem_statement_id)
);

create table if not exists teams (
  id text primary key,
  name text not null,
  leader_profile_id text references profiles(id) on delete cascade,
  problem_statement_id integer references problem_statements(id),
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists team_members (
  team_id text references teams(id) on delete cascade,
  profile_id text references profiles(id) on delete cascade,
  role_id integer references roles(id),
  joined_at text not null default (datetime('now')),
  primary key (team_id, profile_id)
);

create table if not exists team_requests (
  id text primary key,
  sender_profile_id text references profiles(id) on delete cascade,
  receiver_profile_id text references profiles(id) on delete cascade,
  team_id text references teams(id) on delete cascade,
  status text not null default 'pending',
  message text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists notifications (
  id text primary key,
  receiver_profile_id text references profiles(id) on delete cascade,
  type text not null,
  message text not null,
  read_at text,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_user_skills_skill on user_skills(skill_id);
create index if not exists idx_user_roles_role on user_roles(role_id);
create index if not exists idx_pps_ps on profile_problem_statements(problem_statement_id);
create index if not exists idx_team_requests_receiver on team_requests(receiver_profile_id);
create index if not exists idx_team_requests_sender on team_requests(sender_profile_id);
create index if not exists idx_notifications_receiver on notifications(receiver_profile_id);
create index if not exists idx_profiles_college on profiles(college);
create index if not exists idx_profiles_availability on profiles(availability);
create index if not exists idx_team_members_profile on team_members(profile_id);
