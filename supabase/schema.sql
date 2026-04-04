create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  delivery_method text not null check (delivery_method in ('pudo', 'courier', 'collection')),
  delivery_fee numeric(10, 2) not null default 0,
  payment_method text not null check (payment_method in ('eft', 'whatsapp')),
  locker_id text,
  address text,
  notes text,
  subtotal numeric(10, 2) not null,
  total numeric(10, 2) not null,
  status text not null default 'pending',
  items jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

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

alter table public.orders enable row level security;
alter table public.products enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant insert on table public.orders to anon, authenticated;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "Public can submit orders" on public.orders;
create policy "Public can submit orders"
on public.orders
for insert
to anon, authenticated
with check (true);
