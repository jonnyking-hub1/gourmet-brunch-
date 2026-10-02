-- Apply once to a new Supabase project, in the SQL Editor or with db push.
begin;

create table public.eea_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.eea_settings (
  id smallint primary key check (id = 1),
  pitches_open boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.eea_settings (id) values (1);

create table public.eea_registrations (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  first_name varchar(100) not null check (length(trim(first_name)) > 0),
  last_name varchar(100) not null check (length(trim(last_name)) > 0),
  email varchar(254) not null check (email = lower(email) and position('@' in email) > 1),
  business_stage text not null check (business_stage in ('Exploring an idea', 'Developing a product', 'Running a business')),
  reason text not null check (reason in ('Start an F&B business', 'Grow an F&B business')),
  reason_details varchar(1500) not null default '',
  needs_business_help text not null check (needs_business_help in ('Yes', 'No')),
  location varchar(200) not null check (length(trim(location)) > 0),
  university varchar(200) not null default ''
);

create table public.eea_pitches (
  id uuid primary key,
  submitted_at timestamptz not null default now(),
  founder_name varchar(150) not null check (length(trim(founder_name)) > 0),
  email varchar(254) not null check (email = lower(email) and position('@' in email) > 1),
  phone varchar(50) not null default '',
  business_name varchar(150) not null check (length(trim(business_name)) > 0),
  sector varchar(150) not null check (length(trim(sector)) > 0),
  stage text not null check (stage in ('Idea / pre-revenue', 'Operating business')),
  location varchar(200) not null check (length(trim(location)) > 0),
  summary varchar(2000) not null check (length(trim(summary)) > 0),
  customers varchar(1500) not null check (length(trim(customers)) > 0),
  revenue_model varchar(2000) not null check (length(trim(revenue_model)) > 0),
  turnover varchar(1500) not null default '',
  launch_plan varchar(1500) not null default '',
  support_needed varchar(1500) not null check (length(trim(support_needed)) > 0),
  deck_path text not null unique check (deck_path = 'pitches/' || id::text || '/deck.pdf'),
  deck_name varchar(200) not null,
  status text not null default 'New' check (status in ('New', 'Reviewing', 'Shortlisted', 'Not selected')),
  notes varchar(5000) not null default '',
  reviewed_at timestamptz,
  constraint pitch_stage_detail check (
    (stage = 'Idea / pre-revenue' and length(trim(launch_plan)) > 0 and turnover = '') or
    (stage = 'Operating business' and length(trim(turnover)) > 0 and launch_plan = '')
  )
);

-- All application access goes through validated server routes. Even a signed-in
-- user has no direct table access; dashboard access additionally checks eea_admins.
alter table public.eea_admins enable row level security;
alter table public.eea_settings enable row level security;
alter table public.eea_registrations enable row level security;
alter table public.eea_pitches enable row level security;
revoke all on public.eea_admins, public.eea_settings, public.eea_registrations, public.eea_pitches from public, anon, authenticated;
grant select, insert, update, delete on public.eea_admins, public.eea_settings, public.eea_registrations, public.eea_pitches to service_role;

-- A shared lock allows simultaneous submissions, while an intake update waits
-- for accepted inserts to commit. Once closing completes, no new insert can pass.
create function public.eea_submit_pitch(payload jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  accepting boolean;
  pitch_id uuid := (payload->>'id')::uuid;
begin
  select pitches_open into accepting from public.eea_settings where id = 1 for share;
  if not coalesce(accepting, false) then
    raise exception using errcode = 'PT409', message = 'Pitch submissions are closed.';
  end if;
  insert into public.eea_pitches (
    id, founder_name, email, phone, business_name, sector, stage, location,
    summary, customers, revenue_model, turnover, launch_plan, support_needed, deck_path, deck_name
  ) values (
    pitch_id, payload->>'founder_name', payload->>'email', coalesce(payload->>'phone', ''),
    payload->>'business_name', payload->>'sector', payload->>'stage', payload->>'location',
    payload->>'summary', payload->>'customers', payload->>'revenue_model',
    coalesce(payload->>'turnover', ''), coalesce(payload->>'launch_plan', ''),
    payload->>'support_needed', payload->>'deck_path', payload->>'deck_name'
  );
  return pitch_id;
end;
$$;
revoke all on function public.eea_submit_pitch(jsonb) from public, anon, authenticated;
grant execute on function public.eea_submit_pitch(jsonb) to service_role;

-- No browser Storage policies are created. Downloads pass through the protected
-- admin route; the server's secret key is the only storage credential used.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('eea-pitch-decks', 'eea-pitch-decks', false, 4194304, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

commit;
