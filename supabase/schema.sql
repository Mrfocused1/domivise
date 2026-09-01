-- DomiVise content storage.
-- Store the same JSON shape used by js/content.js. RLS allows public visitors
-- to read only published homepage content. Writes require an authenticated
-- Supabase user with app_metadata.role = "admin" or an "admin" roles entry.

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.site_content enable row level security;

create or replace function public.is_site_content_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    or coalesce(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin';
$$;

create or replace function public.touch_site_content()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists touch_site_content on public.site_content;
create trigger touch_site_content
before insert or update on public.site_content
for each row execute function public.touch_site_content();

create index if not exists site_content_updated_by_idx
  on public.site_content (updated_by);

drop policy if exists "Published homepage content is readable" on public.site_content;
create policy "Published homepage content is readable"
  on public.site_content
  for select
  to anon
  using (id = 'homepage' and is_published = true);

drop policy if exists "Authenticated admins can manage content" on public.site_content;
create policy "Authenticated admins can manage content"
  on public.site_content
  for all
  to authenticated
  using (public.is_site_content_admin())
  with check (public.is_site_content_admin());

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

insert into public.site_content (id, content, is_published)
values ('homepage', '{}'::jsonb, true)
on conflict (id) do nothing;

-- First-party website analytics.
-- Public visitors can insert events only. Signed-in admins can read the
-- aggregate source data used by admin.html.

create table if not exists public.site_analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  page_path text not null default '/',
  source text,
  referrer_host text,
  visitor_id uuid not null,
  session_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.site_analytics_events enable row level security;

create index if not exists site_analytics_events_created_at_idx
  on public.site_analytics_events (created_at desc);

create index if not exists site_analytics_events_event_created_at_idx
  on public.site_analytics_events (event_name, created_at desc);

create index if not exists site_analytics_events_source_idx
  on public.site_analytics_events (source);

drop policy if exists "Visitors can record analytics events" on public.site_analytics_events;
create policy "Visitors can record analytics events"
  on public.site_analytics_events
  for insert
  to anon
  with check (
    length(event_name) between 1 and 64
    and length(page_path) between 1 and 300
    and (source is null or length(source) <= 120)
    and (referrer_host is null or length(referrer_host) <= 180)
    and jsonb_typeof(metadata) = 'object'
  );

drop policy if exists "Authenticated admins can read analytics" on public.site_analytics_events;
create policy "Authenticated admins can read analytics"
  on public.site_analytics_events
  for select
  to authenticated
  using (public.is_site_content_admin());

grant insert on public.site_analytics_events to anon;
grant select on public.site_analytics_events to authenticated;
grant usage on sequence public.site_analytics_events_id_seq to anon;
