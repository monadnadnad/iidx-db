alter table chart_recommendations
  add column user_id uuid;

do $$
begin
  if exists (
    select 1 from chart_recommendations where user_id is null
  ) then
    raise exception 'chart_recommendations must be empty before adding user_id';
  end if;
end $$;

alter table chart_recommendations
  alter column user_id set not null,
  add constraint chart_recommendations_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade;

create index if not exists idx_chart_recommendations_chart_created
  on chart_recommendations (chart_id, created_at desc);

alter table chart_recommendations enable row level security;

create policy chart_recommendations_select on chart_recommendations
  for select using (true);

create policy chart_recommendations_insert_authenticated on chart_recommendations
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy chart_recommendations_update_own on chart_recommendations
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy chart_recommendations_delete_own on chart_recommendations
  for delete using (auth.uid() = user_id);
