# Special Gifts by M

A Next.js storefront for Special Gifts by M that is designed to work as:

- a web app
- an install-friendly web app
- and a future Android or iOS packaged app from the same codebase

## What this project includes

- Category-driven storefront based on the Special Gifts catalogue
- Product detail pages with customization controls
- Cart and checkout flow
- Supabase-ready order capture with browser-side inserts for web and mobile packaging
- Branding assets and mobile-friendly UI
- SQL schema and seed files for the ecommerce backend
- App manifest and install icons for web-to-mobile readiness
- Capacitor configuration for Android APK and later iOS packaging

## Core app files

- `src/app/page.tsx`
- `src/app/shop/[slug]/page.tsx`
- `src/app/checkout/page.tsx`
- `src/components/product-customizer.tsx`
- `src/components/checkout-form.tsx`
- `capacitor.config.ts`
- `supabase/schema.sql`
- `supabase/seed.sql`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Make sure `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Start the app:

```bash
npm run dev
```

4. Verify:

```bash
npm run lint
npm run build
```

## Supabase setup

1. Create a new Supabase project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. Run `supabase/seed.sql`.
4. Add the same two public env vars locally and in Netlify.

## Deployment

- Web app hosting: Netlify
- Backend: Supabase
- Version control: GitHub

## Mobile app path

This repo should not stay web-only.

The intended mobile path is:

1. Launch as a web app first
2. Keep the UI mobile-first
3. Use the included manifest and app icons for install readiness
4. Use the included Capacitor config to package the same app into:
   - Android APK / AAB
   - iOS app project

See `MOBILE_APP_PLAN.md` for the mobile packaging strategy.

## Security note

- Do not commit `.env.local`
- Do not commit the PUDO API key
