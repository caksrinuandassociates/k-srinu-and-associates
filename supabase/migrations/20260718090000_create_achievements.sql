create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 180),
  description text not null default '' check (char_length(description) <= 2000),
  achieved_on date,
  year_label text check (year_label is null or char_length(year_label) <= 20),
  image_url text check (image_url is null or char_length(image_url) <= 2000),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists achievements_public_feed_idx
  on public.achievements (is_active, display_order asc, achieved_on desc);

alter table public.achievements enable row level security;

revoke all on table public.achievements from public;
revoke all on table public.achievements from anon;
revoke all on table public.achievements from authenticated;
grant select on table public.achievements to anon;
grant select, insert, update, delete on table public.achievements to authenticated;

create policy "Published achievements are publicly readable"
  on public.achievements
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Approved admins can manage achievements"
  on public.achievements
  for all
  to authenticated
  using (
    (select auth.uid()) = any (array[
      '58011623-c3da-4edf-9f17-4e6a1532ab86'::uuid,
      'c7f89760-6165-40ac-a1dc-9bc3de18f1b8'::uuid
    ])
  )
  with check (
    (select auth.uid()) = any (array[
      '58011623-c3da-4edf-9f17-4e6a1532ab86'::uuid,
      'c7f89760-6165-40ac-a1dc-9bc3de18f1b8'::uuid
    ])
  );

create or replace function public.set_achievements_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_achievements_updated_at on public.achievements;
create trigger trg_achievements_updated_at
  before update on public.achievements
  for each row execute function public.set_achievements_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('achievement-images', 'achievement-images', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read achievement images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'achievement-images');

create policy "Approved admins can upload achievement images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'achievement-images'
    and (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );

create policy "Approved admins can update achievement images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'achievement-images'
    and (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  )
  with check (
    bucket_id = 'achievement-images'
    and (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );

create policy "Approved admins can delete achievement images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'achievement-images'
    and (select auth.jwt() ->> 'email') in (
      'prudhvi@varadanexus.com',
      'caksrinuandassociates@gmail.com'
    )
  );
