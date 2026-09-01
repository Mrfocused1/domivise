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
