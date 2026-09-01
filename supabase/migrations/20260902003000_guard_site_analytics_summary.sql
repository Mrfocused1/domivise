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
