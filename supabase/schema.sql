-- Chạy file này trong Supabase SQL Editor trước seed.sql.
-- Chỉ publishable key được đặt trong config.js. Không đưa secret key lên GitHub.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null check (category in ('top','bottom','shoes')),
  gender text not null check (gender in ('men','women','unisex')),
  style text not null default 'knit',
  price integer not null check (price >= 0),
  sizes jsonb not null default '{"XS":0,"S":0,"M":0,"L":0,"XL":0}'::jsonb,
  image_url text,
  tryon_images jsonb not null default '{}'::jsonb,
  color text not null default '#777777',
  accent text not null default '#555555',
  active boolean not null default true,
  sort_order integer not null default 100,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  code text primary key,
  customer jsonb not null,
  total integer not null check (total >= 0),
  status text not null default 'new' check (status in ('new','confirmed','shipped','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_code text not null references public.orders(code) on delete cascade,
  product_id text,
  name text not null,
  size text not null,
  qty integer not null check (qty > 0),
  unit_price integer not null check (unit_price >= 0)
);

create or replace function public.is_shop_admin()
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$ select exists(select 1 from public.admin_users where user_id = auth.uid()) $$;

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.admin_users, public.products, public.orders, public.order_items from anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update on public.products to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
revoke execute on function public.is_shop_admin() from public, anon;
grant execute on function public.is_shop_admin() to authenticated;

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated using (active = true);
drop policy if exists products_admin_read on public.products;
create policy products_admin_read on public.products for select to authenticated using (public.is_shop_admin());
drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert on public.products for insert to authenticated with check (public.is_shop_admin());
drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products for update to authenticated using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists orders_admin_read on public.orders;
create policy orders_admin_read on public.orders for select to authenticated using (public.is_shop_admin());
drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders for update to authenticated using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists order_items_admin_read on public.order_items;
create policy order_items_admin_read on public.order_items for select to authenticated using (public.is_shop_admin());

create or replace function public.place_order(customer jsonb, requested_items jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_item jsonb;
  v_product public.products%rowtype;
  v_code text;
  v_size text;
  v_qty integer;
  v_total integer := 0;
begin
  if customer is null or length(trim(customer->>'name')) < 2 or length(trim(customer->>'name')) > 100
     or coalesce(customer->>'phone','') !~ '^[0-9+ .-]{9,15}$'
     or length(trim(customer->>'address')) < 5 or length(trim(customer->>'address')) > 300 then
    raise exception 'Thông tin nhận hàng không hợp lệ.';
  end if;
  if requested_items is null or jsonb_typeof(requested_items) <> 'array'
     or jsonb_array_length(requested_items) < 1 or jsonb_array_length(requested_items) > 20 then
    raise exception 'Giỏ hàng không hợp lệ.';
  end if;

  v_code := 'HM-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  insert into public.orders(code, customer, total) values (v_code, jsonb_build_object('name',trim(customer->>'name'),'phone',trim(customer->>'phone'),'address',trim(customer->>'address')), 0);

  for v_item in select value from jsonb_array_elements(requested_items)
  loop
    v_size := v_item->>'size';
    if v_size not in ('XS','S','M','L','XL') or coalesce(v_item->>'qty','') !~ '^[0-9]+$' then
      raise exception 'Size hoặc số lượng không hợp lệ.';
    end if;
    v_qty := (v_item->>'qty')::integer;
    if v_qty < 1 or v_qty > 10 then raise exception 'Số lượng mỗi món phải từ 1 đến 10.'; end if;

    select * into v_product from public.products where id = v_item->>'id' and active = true for update;
    if not found then raise exception 'Có sản phẩm không còn bán.'; end if;
    if coalesce((v_product.sizes->>v_size)::integer,0) < v_qty then
      raise exception 'Sản phẩm % size % không đủ tồn kho.', v_product.name, v_size;
    end if;
    update public.products
       set sizes = jsonb_set(sizes, array[v_size], to_jsonb(((sizes->>v_size)::integer - v_qty)), true), updated_at = now()
     where id = v_product.id;
    insert into public.order_items(order_code, product_id, name, size, qty, unit_price)
    values (v_code, v_product.id, v_product.name, v_size, v_qty, v_product.price);
    v_total := v_total + v_product.price * v_qty;
  end loop;

  update public.orders set total = v_total where code = v_code;
  return jsonb_build_object('code', v_code, 'total', v_total, 'demo', false);
end;
$$;

revoke execute on function public.place_order(jsonb,jsonb) from public, authenticated;
grant execute on function public.place_order(jsonb,jsonb) to anon;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('products','products',true,3145728,array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

drop policy if exists shop_admin_storage_insert on storage.objects;
create policy shop_admin_storage_insert on storage.objects for insert to authenticated
with check (bucket_id = 'products' and public.is_shop_admin());
drop policy if exists shop_admin_storage_update on storage.objects;
create policy shop_admin_storage_update on storage.objects for update to authenticated
using (bucket_id = 'products' and public.is_shop_admin()) with check (bucket_id = 'products' and public.is_shop_admin());
