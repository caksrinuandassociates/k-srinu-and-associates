alter table public.site_settings
  add column if not exists homepage_stats jsonb not null
  default '[{"value":"5+","label":"years of Excellence"},{"value":"200+","label":"Happy Clients"},{"value":"1000+","label":"Compliance Filings"},{"value":"100%","label":"Client Satisfaction"}]'::jsonb;

update public.site_settings
set homepage_stats = '[{"value":"5+","label":"years of Excellence"},{"value":"200+","label":"Happy Clients"},{"value":"1000+","label":"Compliance Filings"},{"value":"100%","label":"Client Satisfaction"}]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'site_settings_homepage_stats_four_items'
      and conrelid = 'public.site_settings'::regclass
  ) then
    alter table public.site_settings
      add constraint site_settings_homepage_stats_four_items
      check (
        jsonb_typeof(homepage_stats) = 'array'
        and jsonb_array_length(homepage_stats) = 4
      );
  end if;
end
$$;

comment on column public.site_settings.homepage_stats is
  'Four editable homepage hero statistics, each with a value and label.';
