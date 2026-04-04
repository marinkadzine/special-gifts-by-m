# Special Gifts by M Launch Guide

This guide takes the Special Gifts by M store from local setup to a live web app using:

- Supabase
- GitHub
- Netlify
- Git Bash on Windows

This repo is now built for:

- browser-based web app access
- install-friendly PWA behavior
- future Android APK and iPhone packaging through Capacitor

For the mobile packaging workflow, see `MOBILE_APP_PLAN.md`.

## 1. What changed in the architecture

The checkout no longer depends on a custom server route.

Orders are now sent directly from the browser to Supabase using the public anon key and row-level security rules.

That matters because:

- it keeps the web app simple to host
- it works better with static export
- it is compatible with Capacitor packaging for Android and iPhone

## 2. Before you start

You need:

- A Supabase account
- A GitHub account
- A Netlify account
- Git for Windows installed
- Node.js installed

Important:

- Do not put secrets into GitHub
- Do not commit `.env.local`
- Do not commit your PUDO API key

## 3. Create the Supabase project

1. Log in to Supabase.
2. Create a new project.
3. Give it a name such as `special-gifts-app`.
4. Choose a strong database password and save it safely.
5. Choose the region closest to your customers.
6. Wait for the project to finish provisioning.

After the project is ready:

1. Open `SQL Editor`.
2. Run `supabase/schema.sql`.
3. Run `supabase/seed.sql`.

This creates:

- `orders`
- `products`
- public read access for products
- public insert access for orders through row-level security

## 4. Get the Supabase values you actually need

In Supabase:

1. Go to `Project Settings`.
2. Go to `API` or `Data API`.
3. Copy:
   - `Project URL`
   - `anon` key

These are the only values needed for the storefront and mobile-ready checkout flow.

## 5. Create `.env.local`

In the project root:

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Git Bash:

```bash
cp .env.example .env.local
```

Then open `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 6. Test locally

From the project root:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and test this flow:

1. Open a product
2. Choose options
3. Add it to cart
4. Go to checkout
5. Fill in the order form
6. Submit the order

Expected result:

- the order is inserted into Supabase
- WhatsApp opens with the order message

If Supabase is not connected yet, the app stays in demo mode and still opens the WhatsApp handoff.

## 7. Confirm the saved order in Supabase

In Supabase:

1. Open `Table Editor`
2. Open `orders`
3. Confirm your test order appears

## 8. Push to GitHub

Create a private repository on GitHub, then use Git Bash:

```bash
cd /c/Users/legra/special-gifts-app
git status
git add .
git commit -m "Prepare Special Gifts web app for APK packaging"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/special-gifts-app.git
git push -u origin main
```

If `origin` already exists:

```bash
git remote set-url origin https://github.com/YOUR-USERNAME/special-gifts-app.git
git push -u origin main
```

## 9. Connect GitHub to Netlify

In Netlify:

1. Log in.
2. Click `Add new site`.
3. Choose `Import an existing project`.
4. Choose GitHub.
5. Authorize Netlify if asked.
6. Select the `special-gifts-app` repository.

For this project:

- Let Netlify detect Next.js automatically.
- Do not manually force an old runtime.

## 10. Add environment variables in Netlify

Before deploying, add the same environment variables from `.env.local`.

In Netlify:

1. Open the site settings.
2. Go to environment variables.
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Paste the exact values from Supabase.

## 11. Deploy the site

In Netlify:

1. Trigger the first deploy.
2. Wait for the build to finish.
3. Open the generated Netlify URL.

Test again on the live site:

1. Browse products.
2. Add an item to cart.
3. Complete checkout.
4. Confirm the order appears in Supabase.

## 12. Set your custom domain later

When you are ready:

1. Buy or use your domain.
2. In Netlify, open domain management.
3. Add your custom domain.
4. Update DNS records where your domain is registered.
5. Wait for SSL to finish provisioning.

You can do this after the site is already live.

## 13. Recommended first launch workflow

For launch week, keep it simple:

- Use EFT as the payment method
- Use WhatsApp confirmation as the final human handoff
- Use Supabase to store every order
- Manually update order status in Supabase

This is the safest low-cost MVP.

## 14. What to improve next

After the first live version, add:

1. Admin dashboard for managing orders
2. Real product images per item
3. Product management from Supabase instead of hardcoded catalog data
4. PayFast integration
5. User accounts
6. Email notifications
7. PUDO automation if you have the correct production integration details

## 15. Troubleshooting

### The local site runs but orders do not save

Check:

- `.env.local` exists
- keys are correct
- Supabase tables were created
- `orders` table exists

### Netlify deploys but checkout fails

Check:

- Netlify environment variables are set
- values match Supabase exactly
- the deploy was rebuilt after adding env vars

### Git push is rejected

Check:

- repository URL is correct
- you are authenticated to GitHub
- the repo already exists on GitHub

### A secret was committed by mistake

Do this immediately:

1. Rotate the secret in the provider dashboard.
2. Remove it from the repo.
3. If needed, rewrite git history before making the repo public.

## 16. Exact order to follow

If you want the shortest safe path, do this in order:

1. Create Supabase project
2. Run `supabase/schema.sql`
3. Run `supabase/seed.sql`
4. Create `.env.local`
5. Run local test
6. Create GitHub repo
7. Push local repo to GitHub
8. Connect repo to Netlify
9. Add env vars in Netlify
10. Deploy
11. Test live checkout
12. Verify orders in Supabase

## 17. Official references

- Supabase Next.js quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase CLI getting started: https://supabase.com/docs/guides/local-development/cli/getting-started
- Netlify Next.js overview: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- GitHub set up Git: https://docs.github.com/en/get-started/git-basics/set-up-git
- GitHub add local code: https://docs.github.com/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-an-existing-project-to-github-using-the-command-line?platform=mac
