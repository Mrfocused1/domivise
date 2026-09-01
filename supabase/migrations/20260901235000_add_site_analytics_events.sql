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
