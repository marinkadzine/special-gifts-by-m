# Special Gifts by M

A Netlify-ready Next.js storefront for Special Gifts by M, built around your real catalogue and a free-tool workflow using Supabase, GitHub, and Netlify.

## What this starter includes

- Category-driven storefront based on your pricing PDF
- Product detail pages with customization controls
- Cart + checkout flow with EFT / WhatsApp order support
- Supabase order persistence API route
- Branding assets and launch-oriented UI
- SQL schema and seed files for Supabase

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env.local
```

3. Add your Supabase values to `.env.local`.

4. Start the app:

```bash
npm run dev
```

## Supabase setup

1. Create a new Supabase project.
2. Open the SQL Editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. In Project Settings, copy:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` -> `SUPABASE_SERVICE_ROLE_KEY`

## GitHub setup with Git Bash

```bash
git init
git add .
git commit -m "Initial ecommerce foundation"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/special-gifts-app.git
git push -u origin main
```

## Netlify deploy

1. Log into Netlify.
2. Choose `Add new site` -> `Import an existing project`.
3. Connect your GitHub repo.
4. Let Netlify detect the Next.js settings automatically.
5. Add the same Supabase env vars from `.env.local`.
6. Deploy the site.

## Important MVP assumptions

- Custom vinyl pricing currently uses `R3 * (width + height)` as an estimate because the price sheet says `R3 per cm` but does not define the exact billing formula.
- Checkout uses EFT and WhatsApp-first order confirmation to stay free and simple at launch.
- PayFast can be added next once merchant credentials are available.

## Security note

- Do not commit secret values such as your Supabase service role key or the PUDO API key to GitHub.
