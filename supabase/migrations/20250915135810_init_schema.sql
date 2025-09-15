create type play_mode  as enum ('SP','DP');
create type chart_diff as enum ('B','N','H','A','L');

create table songs (
  id           bigserial primary key,
  title        text not null,
  textage_tag  text unique,
  bpm_min      numeric not null,
  bpm_max      numeric not null,
  constraint bpm_bounds check (bpm_min <= bpm_max),
  created_at   timestamptz not null default now()
);

create table charts (
  id       bigserial primary key,
  song_id  bigint not null references songs(id) on delete cascade,
  mode     play_mode  not null,
  diff     chart_diff not null,
  level    int,
  notes    int,
  unique (song_id, mode, diff)
);

alter table songs  enable row level security;
alter table charts enable row level security;
create policy songs_read  on songs  for select using (true);
create policy charts_read on charts for select using (true);
