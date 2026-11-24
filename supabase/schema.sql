create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 120),
  start_time time not null,
  description text not null default '',
  helper_text text not null default '',
  position integer not null default 0,
  is_completed boolean not null default false,
  schedule_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_schedules_date_pos
  on public.schedules (schedule_date, position asc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_schedules_updated_at on public.schedules;
create trigger trg_schedules_updated_at
  before update on public.schedules
  for each row
  execute function public.set_updated_at();

alter table public.schedules enable row level security;

drop policy if exists "Users can manage their own schedules" on public.schedules;
drop policy if exists "Shared access for all schedules" on public.schedules;
create policy "Shared access for all schedules"
  on public.schedules
  for all
  to anon, authenticated
  using (true)
  with check (true);
