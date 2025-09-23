create type play_mode as enum ('SP', 'DP');
create type option_type as enum ('REGULAR', 'MIRROR', 'RANDOM', 'R-RANDOM', 'S-RANDOM');
create type chart_diff as enum ('B', 'N', 'H', 'A', 'L');

create table songs (
  id           bigserial primary key,
  title        text not null,
  textage_tag  text unique,
  bpm_min      numeric not null,
  bpm_max      numeric not null,
  created_at   timestamptz not null default now(),
  constraint bpm_bounds check (bpm_min <= bpm_max)
);
alter table songs enable row level security;
create policy songs_read on songs for select using (true);


create table charts (
  id         bigserial primary key,
  song_id    bigint not null references songs(id) on delete cascade,
  play_mode  play_mode not null,
  diff       chart_diff not null,
  level      int,
  notes      int,
  unique (song_id, play_mode, diff)
);
alter table charts enable row level security;
create policy charts_read on charts for select using (true);


create table chart_option_posts (
  id           bigserial primary key,
  chart_id     bigint not null references charts(id) on delete cascade,
  option_type  option_type not null,
  comment      varchar(255),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);


create table chart_haichi_posts (
  id           bigserial primary key,
  chart_id     bigint not null references charts(id) on delete cascade,
  lane_text    varchar(7) not null,
  comment      varchar(255),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
