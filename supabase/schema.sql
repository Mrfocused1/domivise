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
    event_name in (
      'page_view',
      'cta_click',
      'section_view',
      'form_validation_failed',
      'form_submit_attempt',
      'form_submit_success',
      'form_submit_error'
    )
    and length(event_name) between 1 and 64
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

create schema if not exists app_private;

create table if not exists app_private.admin_recovery_email_sends (
  id bigint generated always as identity primary key,
  requested_for text not null,
  sent_at timestamptz not null default now()
);

revoke all on schema app_private from public, anon, authenticated;
revoke all on all tables in schema app_private from public, anon, authenticated;

create index if not exists admin_recovery_email_sends_sent_at_idx
  on app_private.admin_recovery_email_sends (sent_at desc);

create or replace function public.admin_recovery_token_hash(target_email text)
returns text
language plpgsql
volatile
security definer
set search_path = public, auth, extensions, app_private
as $$
declare
  headers jsonb := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  supplied_secret text := headers ->> 'x-admin-reset-secret';
  expected_secret_sha256 text := '9574de49e154e5d2d786d6e4980084bcb02f960333d4ebdb4daad638a14d7dca';
  token_hash text;
begin
  if supplied_secret is null or encode(extensions.digest(supplied_secret, 'sha256'), 'hex') <> expected_secret_sha256 then
    raise insufficient_privilege using message = 'reset_secret_required';
  end if;

  if lower(coalesce(target_email, '')) <> 'hello@domivise.co.uk' then
    raise invalid_parameter_value using message = 'unsupported_reset_account';
  end if;

  if exists (
    select 1
    from app_private.admin_recovery_email_sends
    where sent_at >= now() - interval '90 seconds'
  ) then
    raise too_many_connections using message = 'reset_email_rate_limited';
  end if;

  select one_time_tokens.token_hash
    into token_hash
  from auth.one_time_tokens
  where one_time_tokens.token_type::text = 'recovery_token'
    and lower(one_time_tokens.relates_to) = 'hello@domivise.co.uk'
    and one_time_tokens.updated_at >= (now() at time zone 'utc') - interval '60 minutes'
  order by one_time_tokens.updated_at desc
  limit 1;

  if token_hash is null then
    raise no_data_found using message = 'recovery_token_unavailable';
  end if;

  insert into app_private.admin_recovery_email_sends (requested_for)
  values ('hello@domivise.co.uk');

  return token_hash;
end;
$$;

revoke all on function public.admin_recovery_token_hash(text) from public, anon, authenticated;
grant execute on function public.admin_recovery_token_hash(text) to anon;

create or replace function public.site_analytics_summary(days_back integer default 30)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with params as (
    select greatest(1, least(coalesce(days_back, 30), 365))::int as days
  ),
  bounds as (
    select days, now() - (days * interval '1 day') as since_at
    from params
  ),
  events as (
    select e.*
    from public.site_analytics_events e
    cross join bounds b
    where e.created_at >= b.since_at
  ),
  totals as (
    select
      count(distinct visitor_id) filter (where event_name = 'page_view') as visitors,
      count(distinct session_id) filter (where event_name = 'page_view') as sessions,
      count(*) filter (where event_name = 'page_view') as page_views,
      count(*) filter (where event_name = 'cta_click') as cta_clicks,
      count(*) filter (where event_name = 'form_submit_attempt') as form_attempts,
      count(*) filter (where event_name = 'form_submit_success') as applications,
      count(*) filter (where event_name in ('form_validation_failed', 'form_submit_error')) as errors
    from events
  )
  select jsonb_build_object(
    '_guard', (select 1 / case when public.is_site_content_admin() then 1 else 0 end),
    'days', (select days from bounds),
    'visitors', coalesce((select visitors from totals), 0),
    'sessions', coalesce((select sessions from totals), 0),
    'pageViews', coalesce((select page_views from totals), 0),
    'ctaClicks', coalesce((select cta_clicks from totals), 0),
    'formAttempts', coalesce((select form_attempts from totals), 0),
    'applications', coalesce((select applications from totals), 0),
    'errorsTotal', coalesce((select errors from totals), 0),
    'conversion', case
      when coalesce((select page_views from totals), 0) = 0 then 0
      else round(((select applications from totals)::numeric / greatest((select page_views from totals), 1)) * 100, 1)
    end,
    'funnel', jsonb_build_array(
      jsonb_build_object('label', 'Page views', 'value', coalesce((select page_views from totals), 0)),
      jsonb_build_object('label', 'CTA clicks', 'value', coalesce((select cta_clicks from totals), 0)),
      jsonb_build_object('label', 'Form attempts', 'value', coalesce((select form_attempts from totals), 0)),
      jsonb_build_object('label', 'Applications', 'value', coalesce((select applications from totals), 0))
    ),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', day::date,
        'pageViews', coalesce(day_events.page_views, 0),
        'ctaClicks', coalesce(day_events.cta_clicks, 0),
        'applications', coalesce(day_events.applications, 0)
      ) order by day)
      from generate_series(
        current_date - ((select days from bounds) - 1),
        current_date,
        interval '1 day'
      ) day
      left join (
        select
          created_at::date as event_day,
          count(*) filter (where event_name = 'page_view') as page_views,
          count(*) filter (where event_name = 'cta_click') as cta_clicks,
          count(*) filter (where event_name = 'form_submit_success') as applications
        from events
        group by created_at::date
      ) day_events on day_events.event_day = day::date
    ), '[]'::jsonb),
    'sources', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc, label)
      from (
        select coalesce(nullif(source, ''), nullif(referrer_host, ''), 'direct') as label, count(*) as value
        from events
        where event_name = 'page_view'
        group by 1
        order by value desc, label
        limit 8
      ) rows
    ), '[]'::jsonb),
    'ctas', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc, label)
      from (
        select coalesce(nullif(metadata ->> 'label', ''), nullif(source, ''), 'CTA') as label, count(*) as value
        from events
        where event_name = 'cta_click'
        group by 1
        order by value desc, label
        limit 8
      ) rows
    ), '[]'::jsonb),
    'sections', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc, label)
      from (
        select coalesce(nullif(metadata ->> 'section', ''), 'section') as label, count(*) as value
        from events
        where event_name = 'section_view'
        group by 1
        order by value desc, label
        limit 8
      ) rows
    ), '[]'::jsonb),
    'portfolioSizes', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc, label)
      from (
        select coalesce(nullif(metadata ->> 'portfolioSize', ''), 'Not supplied') as label, count(*) as value
        from events
        where event_name = 'form_submit_success'
        group by 1
        order by value desc, label
        limit 8
      ) rows
    ), '[]'::jsonb),
    'marketingConsent', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc, label)
      from (
        select case when metadata ->> 'marketingConsent' = 'yes' then 'Yes' else 'No' end as label, count(*) as value
        from events
        where event_name = 'form_submit_success'
        group by 1
        order by value desc, label
      ) rows
    ), '[]'::jsonb),
    'errors', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc, label)
      from (
        select event_name as label, count(*) as value
        from events
        where event_name in ('form_validation_failed', 'form_submit_error')
        group by event_name
        order by value desc, label
      ) rows
    ), '[]'::jsonb)
  ) - '_guard';
$$;

revoke all on function public.site_analytics_summary(integer) from public, anon;
grant execute on function public.site_analytics_summary(integer) to authenticated;
