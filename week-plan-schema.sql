-- Field Log: weekly plan chips
-- Run this once in Supabase: Project > SQL Editor > New query > paste > Run

create table week_plan_chips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day text not null,
  chip_type text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table week_plan_chips enable row level security;

create policy "select own plan chips" on week_plan_chips for select using (auth.uid() = user_id);
create policy "insert own plan chips" on week_plan_chips for insert with check (auth.uid() = user_id);
create policy "update own plan chips" on week_plan_chips for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own plan chips" on week_plan_chips for delete using (auth.uid() = user_id);
