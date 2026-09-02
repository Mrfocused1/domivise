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
    and one_time_tokens.updated_at >= (now() at time zone 'utc') - interval '5 minutes'
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
