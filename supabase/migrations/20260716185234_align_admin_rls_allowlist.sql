-- Keep database authorization aligned with the two accounts accepted by the
-- browser admin console. Exact auth user IDs are used instead of editable
-- metadata or a blanket `to authenticated` policy.

drop policy if exists "admin update compliance" on public.compliance_calendar;
drop policy if exists "admin update careers" on public.career_openings;
drop policy if exists "admin update team" on public.team_members;
drop policy if exists "admin_full_access_team" on public.team_members;
drop policy if exists "admin manage site settings" on public.site_settings;

drop policy if exists "admin can read contact" on public.contact_submissions;
drop policy if exists "admin can update contact" on public.contact_submissions;
drop policy if exists "admin can delete contact" on public.contact_submissions;
drop policy if exists "admin manage contact submissions" on public.contact_submissions;

drop policy if exists "admin can read career" on public.career_submissions;
drop policy if exists "admin can update career" on public.career_submissions;
drop policy if exists "admin can delete career" on public.career_submissions;
drop policy if exists "admin manage career submissions" on public.career_submissions;

grant select, insert, update, delete on table public.compliance_calendar to authenticated;
grant select, insert, update, delete on table public.career_openings to authenticated;
grant select, insert, update, delete on table public.team_members to authenticated;
grant select, insert, update, delete on table public.site_settings to authenticated;
grant select, update, delete on table public.contact_submissions to authenticated;
grant select, update, delete on table public.career_submissions to authenticated;

create policy "Approved admins can manage compliance"
on public.compliance_calendar
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

create policy "Approved admins can manage careers"
on public.career_openings
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

create policy "Approved admins can manage team"
on public.team_members
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

create policy "Approved admins can manage site settings"
on public.site_settings
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

create policy "Approved admins can manage contact submissions"
on public.contact_submissions
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

create policy "Approved admins can manage career submissions"
on public.career_submissions
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
