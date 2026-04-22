create table if not exists public.home_page_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  caption text,
  cta_label text,
  cta_href text,
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.home_page_banners enable row level security;

grant select on table public.home_page_banners to anon, authenticated;
grant select, insert, update, delete on table public.home_page_banners to authenticated;

drop policy if exists "Public can read active home page banners" on public.home_page_banners;
create policy "Public can read active home page banners"
on public.home_page_banners
for select
to anon, authenticated
using (active = true or public.is_admin());

drop policy if exists "Admins can manage home page banners" on public.home_page_banners;
create policy "Admins can manage home page banners"
on public.home_page_banners
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.home_page_banners (
  title,
  image_url,
  caption,
  cta_label,
  cta_href,
  active,
  featured,
  sort_order
)
select
  'Mother''s Day Personalized Bundle',
  '/branding/mothers-day-banner.png',
  'Thoughtful gifts made with love. All for R250 with a regular mug, 10x10cm stone photo slab, Aero chocolate, and gift bag.',
  'Customize this bundle',
  '/shop?slug=mothers-day-personalized-bundle',
  true,
  true,
  0
where not exists (
  select 1
  from public.home_page_banners
  where image_url = '/branding/mothers-day-banner.png'
);

notify pgrst, 'reload schema';
