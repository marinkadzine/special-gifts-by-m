insert into public.products (
  slug,
  name,
  category,
  store_section,
  base_price,
  description,
  summary,
  lead_time,
  featured,
  supports_gift_wrap,
  supports_custom_vinyl,
  active
)
values
  (
    'adult-essential-tee',
    'Unisex Essential T-Shirt',
    'Clothing',
    'personalized',
    180,
    'High-quality unisex cotton T-shirt for custom prints, gifting, and event wear.',
    'Classic unisex cotton tee for everyday gifting, events, and branding.',
    '2-4 business days',
    true,
    true,
    false,
    true
  ),
  (
    'custom-vinyl-sticker',
    'Custom Vinyl Sticker',
    'Stickers',
    'personalized',
    0,
    'Custom-cut vinyl sticker priced by custom dimensions for branding, labels, and decor.',
    'Made-to-size vinyl sticker with live price calculation.',
    '2-3 business days',
    true,
    false,
    true,
    true
  ),
  (
    'wine-tumbler',
    'Wine Tumbler',
    'Drinkware',
    'ready-made',
    230,
    'Stylish insulated wine tumbler ready for names, bridal gifts, and gifting sets.',
    'Elegant custom tumbler for gifting and celebrations.',
    '3-5 business days',
    true,
    true,
    false,
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  store_section = excluded.store_section,
  base_price = excluded.base_price,
  description = excluded.description,
  summary = excluded.summary,
  lead_time = excluded.lead_time,
  featured = excluded.featured,
  supports_gift_wrap = excluded.supports_gift_wrap,
  supports_custom_vinyl = excluded.supports_custom_vinyl,
  active = excluded.active;
