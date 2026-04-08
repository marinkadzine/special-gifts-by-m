create extension if not exists "pgcrypto";

create or replace function public.resolve_profile_role(user_email text)
returns text
language sql
stable
as $$
  select case
    when lower(coalesce(user_email, '')) in (
      'specialgiftsbym@gmail.com',
      'mariannelegrange@gmail.com',
      'marinkajvr@gmail.com'
    ) then 'admin'
    else 'customer'
  end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    public.resolve_profile_role(new.email)
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email, full_name, role)
select
  id,
  email,
  nullif(raw_user_meta_data ->> 'full_name', ''),
  public.resolve_profile_role(email)
from auth.users
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  role = excluded.role;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  delivery_method text not null default 'pudo',
  delivery_fee numeric(10, 2) not null default 0,
  payment_method text not null default 'eft',
  locker_id text,
  address text,
  notes text,
  subtotal numeric(10, 2) not null,
  total numeric(10, 2) not null,
  status text not null default 'pending',
  items jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.orders
  add column if not exists customer_id uuid references auth.users on delete set null;

alter table public.orders
  add column if not exists pudo_size text;

alter table public.orders
  drop constraint if exists orders_delivery_method_check;

alter table public.orders
  add constraint orders_delivery_method_check
  check (delivery_method in ('pudo', 'courier', 'collection'));

alter table public.orders
  drop constraint if exists orders_payment_method_check;

update public.orders
set payment_method = 'eft'
where payment_method = 'whatsapp';

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('eft', 'payfast', 'scan_to_pay'));

alter table public.orders
  drop constraint if exists orders_pudo_size_check;

alter table public.orders
  add constraint orders_pudo_size_check
  check (pudo_size is null or pudo_size in ('XS', 'S', 'M', 'L', 'XL'));

update public.orders
set customer_id = profiles.id
from public.profiles
where public.orders.customer_id is null
  and public.orders.email is not null
  and lower(public.orders.email) = lower(public.profiles.email);

create table if not exists public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  preferred_time text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  image_url text not null,
  caption text,
  featured boolean not null default false,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('order-assets', 'order-assets', true, 10485760)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  base_price numeric(10, 2) not null,
  description text not null,
  summary text not null,
  lead_time text not null,
  featured boolean not null default false,
  supports_gift_wrap boolean not null default false,
  supports_custom_vinyl boolean not null default false,
  variant_options jsonb,
  print_sizes jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.products
  add column if not exists store_section text not null default 'personalized';

alter table public.products
  add column if not exists badges jsonb;

alter table public.products
  add column if not exists image_url text;

alter table public.products
  add column if not exists gallery_images jsonb;

alter table public.products
  add column if not exists active boolean not null default true;

alter table public.products
  drop constraint if exists products_store_section_check;

alter table public.products
  add constraint products_store_section_check
  check (store_section in ('personalized', 'ready-made'));

update public.products
set store_section = 'ready-made'
where slug in (
  'photo-stone-slab',
  'custom-a4-puzzle',
  'custom-gift-bag',
  'wine-tumbler',
  'skinny-tumbler',
  'ceramic-coffee-mug',
  'christmas-hat'
);

alter table public.orders enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.callback_requests enable row level security;
alter table public.gallery_items enable row level security;

grant usage on schema public to anon, authenticated;

grant select on table public.products to anon, authenticated;
grant select on table public.gallery_items to anon, authenticated;
grant insert on table public.orders to anon, authenticated;
grant insert on table public.callback_requests to anon, authenticated;

grant select, insert, update on table public.products to authenticated;
grant select, update, delete on table public.orders to authenticated;
grant select, update, delete on table public.callback_requests to authenticated;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.gallery_items to authenticated;

drop policy if exists "Public can upload order assets" on storage.objects;
create policy "Public can upload order assets"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'order-assets');

drop policy if exists "Public can read order assets" on storage.objects;
create policy "Public can read order assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'order-assets');

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read gallery items" on public.gallery_items;
create policy "Public can read gallery items"
on public.gallery_items
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage gallery items" on public.gallery_items;
create policy "Admins can manage gallery items"
on public.gallery_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "Customers can submit orders" on public.orders;
create policy "Customers can submit orders"
on public.orders
for insert
to anon, authenticated
with check (customer_id is null or customer_id = auth.uid() or public.is_admin());

drop policy if exists "Customers can view linked orders" on public.orders;
create policy "Customers can view linked orders"
on public.orders
for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
on public.orders
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Public can create callback requests" on public.callback_requests;
create policy "Public can create callback requests"
on public.callback_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read callback requests" on public.callback_requests;
create policy "Admins can read callback requests"
on public.callback_requests
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update callback requests" on public.callback_requests;
create policy "Admins can update callback requests"
on public.callback_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete callback requests" on public.callback_requests;
create policy "Admins can delete callback requests"
on public.callback_requests
for delete
to authenticated
using (public.is_admin());
