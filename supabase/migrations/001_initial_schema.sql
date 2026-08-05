-- Supabase Migration: Initial Schema
-- Run this in Supabase SQL Editor

-- 1. Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  theme text default 'dark' check (theme in ('light', 'dark')),
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "own profile" on profiles for all using (auth.uid() = id);

-- 2. Visions & Missions
create table if not exists visions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  statement text not null default '',
  missions jsonb default '[]'::jsonb,
  active_mission_id uuid,
  created_at timestamptz default now()
);
alter table visions enable row level security;
create policy "own vision" on visions for all using (auth.uid() = user_id);

-- 3. Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  goal text,
  status text default 'active' check (status in ('active', 'done', 'paused')),
  deadline date,
  progress int default 0,
  color text default '#8b5cf6',
  order_index int default 0,
  created_at timestamptz default now()
);
alter table projects enable row level security;
create policy "own projects" on projects for all using (auth.uid() = user_id);

-- 4. Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  done boolean default false,
  due_date date,
  priority int default 0 check (priority in (0, 1, 2)),
  order_index int default 0,
  created_at timestamptz default now()
);
alter table tasks enable row level security;
create policy "own tasks" on tasks for all using (auth.uid() = user_id);

-- 5. Unified Check-ins (Prayer, Health, Addiction, Habits)
create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  date date not null default CURRENT_DATE,
  category text not null check (category in ('prayer', 'health', 'addiction', 'habit')),
  item_id text not null,
  completed boolean default true,
  value int default 1,
  created_at timestamptz default now(),
  unique (user_id, date, category, item_id)
);
alter table checkins enable row level security;
create policy "own checkins" on checkins for all using (auth.uid() = user_id);

-- 6. Addictions (What you're quitting)
create table if not exists addictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  item_id text not null unique,
  started_date date not null default CURRENT_DATE,
  relapsed_at timestamptz,
  created_at timestamptz default now()
);
alter table addictions enable row level security;
create policy "own addictions" on addictions for all using (auth.uid() = user_id);

-- 7. Skills
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  level int default 1,
  xp int default 0,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now()
);
alter table skills enable row level security;
create policy "own skills" on skills for all using (auth.uid() = user_id);

-- 8. Achievement Definitions (Fixed)
create table if not exists achievement_defs (
  id text primary key,
  title text not null,
  description text,
  icon text not null,
  category text not null,
  threshold int not null,
  rarity text default 'common' check (rarity in ('common', 'rare', 'epic', 'legendary'))
);
-- Public read access
alter table achievement_defs enable row level security;
create policy "public read achievements" on achievement_defs for select using (true);

-- 9. User Achievements
create table if not exists user_achievements (
  user_id uuid references profiles(id) on delete cascade,
  achievement_id text references achievement_defs(id),
  unlocked_at timestamptz default now(),
  primary key (user_id, achievement_id)
);
alter table user_achievements enable row level security;
create policy "own achievements" on user_achievements for all using (auth.uid() = user_id);

-- Seed Achievement Definitions
insert into achievement_defs (id, title, description, icon, category, threshold, rarity) values
('prayer_streak_3', 'Consistent Start', '3 days all 5 prayers', '🌱', 'prayer', 3, 'common'),
('prayer_streak_7', 'Week of Light', '7 days all 5 prayers', '⭐', 'prayer', 7, 'rare'),
('prayer_streak_30', 'Month of Devotion', '30 days all 5 prayers', '🌙', 'prayer', 30, 'epic'),
('health_streak_7', 'Healthy Week', '7 days all health habits', '💪', 'health', 7, 'rare'),
('addiction_7', 'One Week Free', '7 days clean', '🕊️', 'addiction', 7, 'rare'),
('addiction_30', 'Month of Freedom', '30 days clean', '🏆', 'addiction', 30, 'epic'),
('addiction_100', 'Centurion', '100 days clean', '👑', 'addiction', 100, 'legendary'),
('skill_level_5', 'Apprentice', 'Reach level 5 in any skill', '🔧', 'skill', 5, 'common'),
('skill_level_10', 'Master', 'Reach level 10 in any skill', '🎓', 'skill', 10, 'rare'),
('project_complete', 'Project Finished', 'Complete a project', '✅', 'project', 1, 'common'),
('streak_100', 'Century', '100 day overall streak', '💯', 'general', 100, 'legendary')
on conflict (id) do nothing;

-- Indexes for performance
create index if not exists idx_checkins_user_date on checkins(user_id, date);
create index if not exists idx_tasks_user_project on tasks(user_id, project_id);
create index if not exists idx_projects_user_status on projects(user_id, status);