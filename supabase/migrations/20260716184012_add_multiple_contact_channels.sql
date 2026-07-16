alter table public.site_settings
  add column if not exists contact_phones jsonb not null default '[]'::jsonb,
  add column if not exists contact_emails jsonb not null default '[]'::jsonb;

update public.site_settings
set
  contact_phones = case
    when jsonb_array_length(contact_phones) = 0 and nullif(btrim(phone), '') is not null
      then jsonb_build_array(btrim(phone))
    else contact_phones
  end,
  contact_emails = case
    when jsonb_array_length(contact_emails) = 0 and nullif(btrim(email), '') is not null
      then jsonb_build_array(btrim(email))
    else contact_emails
  end;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'site_settings_contact_phones_array'
      and conrelid = 'public.site_settings'::regclass
  ) then
    alter table public.site_settings
      add constraint site_settings_contact_phones_array
      check (jsonb_typeof(contact_phones) = 'array' and jsonb_array_length(contact_phones) <= 10);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'site_settings_contact_emails_array'
      and conrelid = 'public.site_settings'::regclass
  ) then
    alter table public.site_settings
      add constraint site_settings_contact_emails_array
      check (jsonb_typeof(contact_emails) = 'array' and jsonb_array_length(contact_emails) <= 10);
  end if;
end
$$;

comment on column public.site_settings.contact_phones is
  'Ordered public contact phone numbers. The first value is used as the primary call-to-action number.';

comment on column public.site_settings.contact_emails is
  'Ordered public contact email addresses. The first value is used as the primary email call-to-action.';
