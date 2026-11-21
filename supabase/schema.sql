-- =====================================================
-- Gayane 51 — Supabase schema
-- Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================

-- 1) Հրավիրատոմսի կարգավորումներ (ժամ, հասցե, քարտեզ) — խմբագրվում է Admin-ից
create table if not exists public.invitation_settings (
  slug        text primary key,
  title       text not null default 'Գայանեի 51-ամյակ',
  event_date  date not null,
  event_time  text not null default '17:00' check (event_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  venue_name  text not null default '«Ակունքի դրախտ»',
  inviter_name text not null default 'Գայանեի ընտանիքը',
  address     text not null default '',
  map_url     text not null default '',
  updated_at  timestamptz not null default now()
);

insert into public.invitation_settings (slug, event_date, event_time, venue_name, address, map_url)
values ('gayane-51', '2026-12-09', '17:00', '«Ակունքի դրախտ»', '', '')
on conflict (slug) do nothing;

-- 2) Ադմինների ցուցակ (email-ով)
create table if not exists public.admins (
  email text primary key
);

-- 3) Հյուրերի պատասխաններ
create table if not exists public.guest_responses (
  id                uuid primary key default gen_random_uuid(),
  invitation_id     text not null references public.invitation_settings(slug) on delete cascade,
  guest_name        text not null check (char_length(guest_name) between 2 and 80),
  attendance_status text not null check (attendance_status in ('yes', 'no')),
  guest_count       int  not null default 1 check (guest_count between 0 and 10),
  companion_name    text check (companion_name is null or char_length(companion_name) <= 80),
  message           text check (message is null or char_length(message) <= 500),
  submitted_at      timestamptz not null default now()
);

create index if not exists guest_responses_invitation_idx
  on public.guest_responses (invitation_id, submitted_at desc);

-- 4) Ադմին ստուգող ֆունկցիա
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 5) Row Level Security
alter table public.invitation_settings enable row level security;
alter table public.admins              enable row level security;
alter table public.guest_responses     enable row level security;

-- Կարգավորումները կարդալ կարող են բոլորը (հրավիրատոմսի էջի համար)
drop policy if exists "settings_read_all" on public.invitation_settings;
create policy "settings_read_all" on public.invitation_settings
  for select to anon, authenticated using (true);

-- Փոխել կարող է միայն ադմինը
drop policy if exists "settings_update_admin" on public.invitation_settings;
create policy "settings_update_admin" on public.invitation_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Ադմինը տեսնում է միայն իր տողը admins աղյուսակում
drop policy if exists "admins_read_self" on public.admins;
create policy "admins_read_self" on public.admins
  for select to authenticated using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Պատասխանները՝ կարդալ/ջնջել միայն ադմինը.
-- INSERT policy ՉԿԱ դիտմամբ. հյուրերը գրում են միայն /api/rsvp-ով (service role),
-- ուստի անանուն օգտատերը ուղիղ DB-ին չի կարող ո՛չ գրել, ո՛չ կարդալ։
drop policy if exists "responses_read_admin" on public.guest_responses;
create policy "responses_read_admin" on public.guest_responses
  for select to authenticated using (public.is_admin());

drop policy if exists "responses_delete_admin" on public.guest_responses;
create policy "responses_delete_admin" on public.guest_responses
  for delete to authenticated using (public.is_admin());

revoke all on public.guest_responses from anon;
revoke all on public.admins from anon;

-- 6) Realtime Admin վահանակի համար
alter publication supabase_realtime add table public.guest_responses;

-- 7) Ավելացրեք Ձեր ադմին email-ը (նախ Authentication -> Users -> Add user)
-- insert into public.admins (email) values ('your-email@example.com');
