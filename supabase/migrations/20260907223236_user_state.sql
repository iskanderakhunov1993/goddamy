-- Cross-device sync for regular users (profile, lesson progress, subscription
-- status, quiz answers, lesson feedback, enrollment, practice log).
-- One generic key-value table mirrors the existing localStorage keys 1:1 —
-- see src/lib/cloudSync.js for the sync logic that reads/writes it.
create table if not exists public.user_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_state enable row level security;

create policy "user_state: select own rows"
  on public.user_state for select
  using (auth.uid() = user_id);

create policy "user_state: insert own rows"
  on public.user_state for insert
  with check (auth.uid() = user_id);

create policy "user_state: update own rows"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_state: delete own rows"
  on public.user_state for delete
  using (auth.uid() = user_id);
