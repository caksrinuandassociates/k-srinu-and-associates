create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 180),
  summary text not null default '' check (char_length(summary) <= 320),
  content text not null check (char_length(content) between 1 and 10000),
  category text not null default 'General' check (char_length(category) <= 80),
  link_url text check (link_url is null or char_length(link_url) <= 2000),
  pdf_url text check (pdf_url is null or char_length(pdf_url) <= 2000),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_valid_window check (expires_at is null or expires_at > starts_at)
);

create index if not exists notifications_public_feed_idx
  on public.notifications (is_active, starts_at desc, display_order asc);

alter table public.notifications enable row level security;

revoke all on table public.notifications from public;
revoke all on table public.notifications from anon;
revoke all on table public.notifications from authenticated;
grant select on table public.notifications to anon;
grant select, insert, update, delete on table public.notifications to authenticated;

create policy "Published notifications are publicly readable"
  on public.notifications
  for select
  to anon, authenticated
  using (
    is_active = true
    and starts_at <= now()
    and (expires_at is null or expires_at > now())
  );

create policy "Approved admins can view every notification"
  on public.notifications
  for select
  to authenticated
  using (
    (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );

create policy "Approved admins can create notifications"
  on public.notifications
  for insert
  to authenticated
  with check (
    (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );

create policy "Approved admins can update notifications"
  on public.notifications
  for update
  to authenticated
  using (
    (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  )
  with check (
    (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );

create policy "Approved admins can delete notifications"
  on public.notifications
  for delete
  to authenticated
  using (
    (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('notification-files', 'notification-files', true, 10485760, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Approved admins can read notification files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'notification-files'
    and (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );

create policy "Approved admins can upload notification files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'notification-files'
    and (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );

create policy "Approved admins can update notification files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'notification-files'
    and (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  )
  with check (
    bucket_id = 'notification-files'
    and (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );

create policy "Approved admins can delete notification files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'notification-files'
    and (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );
