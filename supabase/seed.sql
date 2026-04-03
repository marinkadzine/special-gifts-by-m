insert into public.products (
  slug,
  name,
  category,
  base_price,
  description,
  summary,
  lead_time,
  featured,
  supports_gift_wrap,
  supports_custom_vinyl
)
values
  (
    'adult-essential-tee',
    'Essential Adult Tee',
    'Clothing',
    180,
    'High-quality cotton T-shirt for custom prints, gifting, and event wear.',
    'Cotton tee with long or short sleeve options for men and women.',
    '2-4 business days',
    true,
    true,
    false
  ),
  (
    'custom-vinyl-sticker',
    'Custom Vinyl Sticker',
    'Stickers',
    0,
    'Custom-cut vinyl sticker priced by custom dimensions for branding, labels, and decor.',
    'Made-to-size vinyl sticker with live price calculation.',
    '2-3 business days',
    true,
    false,
    true
  ),
  (
    'wine-tumbler',
    'Wine Tumbler',
    'Drinkware',
    230,
    'Stylish insulated wine tumbler ready for names, bridal gifts, and gifting sets.',
    'Elegant custom tumbler for gifting and celebrations.',
    '3-5 business days',
    true,
    true,
    false
  )
on conflict (slug) do nothing;
