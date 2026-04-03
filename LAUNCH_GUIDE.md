# Special Gifts by M Launch Guide

This guide walks you from local code to a live site using:

- Supabase
- GitHub
- Netlify
- Git Bash on Windows

## 1. Before you start

You need:

- A Supabase account
- A GitHub account
- A Netlify account
- Git for Windows installed
- Node.js installed

Important:

- Do not put secrets into GitHub.
- Do not commit the Supabase service role key.
- Do not commit your PUDO API key.

## 2. What is already built

This repo already includes:

- A homepage and category browsing experience
- Product pages with customization controls
- Cart and checkout
- An API route to save orders to Supabase
- Supabase SQL schema
- A starter product seed

Main files:

- `src/app/page.tsx`
- `src/app/shop/[slug]/page.tsx`
- `src/components/product-customizer.tsx`
- `src/components/checkout-form.tsx`
- `src/app/api/orders/route.ts`
- `supabase/schema.sql`
- `supabase/seed.sql`

## 3. Create the Supabase project

1. Log in to Supabase.
2. Create a new project.
3. Give it a project name such as `special-gifts-app`.
4. Choose a strong database password and store it safely.
5. Choose the region closest to your customers.
6. Wait until the project finishes provisioning.

After the project is ready:

1. Open the project dashboard.
2. Go to `SQL Editor`.
3. Open `supabase/schema.sql` from this repo.
4. Copy all contents and run it in the SQL Editor.
5. Open `supabase/seed.sql`.
6. Copy all contents and run it in the SQL Editor.

This creates:

- `orders`
- `products`
- basic row-level security policies

## 4. Get the Supabase keys

In Supabase:

1. Go to `Project Settings`.
2. Go to `Data API` or `API`, depending on the dashboard layout.
3. Copy these values:
   - Project URL
   - anon key
   - service_role key

You will use them in your local environment and in Netlify.

## 5. Create your local env file

In the project root:

1. Copy `.env.example` to `.env.local`

In PowerShell:

```powershell
Copy-Item .env.example .env.local
```

In Git Bash:

```bash
cp .env.example .env.local
```

2. Open `.env.local`
3. Paste your values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Important:

- `.env.local` should stay local.
- Never paste the service role key into a public repo.

## 6. Test locally

From the project root:

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000`

Test this flow:

1. Open the home page.
2. Open a product.
3. Choose options.
4. Add it to cart.
5. Go to checkout.
6. Fill in details.
7. Submit the order.

Expected behavior:

- If env vars are set and Supabase is correct, orders should save into the `orders` table.
- If env vars are missing, the app falls back to demo mode and returns a draft order response.

## 7. Check the saved order in Supabase

In Supabase:

1. Open `Table Editor`.
2. Open the `orders` table.
3. Confirm your test order appears.

The order row includes:

- customer info
- delivery method
- totals
- raw item configuration JSON

## 8. Prepare Git on Windows

Open Git Bash and set your identity if you have not already:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Optional but useful:

```bash
git config --global init.defaultBranch main
```

## 9. Make sure secrets stay out of Git

Before pushing:

1. Confirm `.env.local` is not staged.
2. Confirm no API keys were pasted into source files.
3. Confirm no customer test data is in committed files.

Check with:

```bash
git status
git diff
```

If you accidentally pasted a key into code, remove it before commit.

## 10. Create the GitHub repository

On GitHub:

1. Click `New repository`.
2. Use a name like `special-gifts-app`.
3. Choose `Private` if you want to keep business code private.
4. Do not add a README, `.gitignore`, or license if this repo already has files.
5. Create the repository.

## 11. Push this project to GitHub from Git Bash

In Git Bash:

```bash
cd /c/Users/legra/special-gifts-app
git status
git add .
git commit -m "Initial ecommerce foundation"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/special-gifts-app.git
git push -u origin main
```

If `origin` already exists:

```bash
git remote set-url origin https://github.com/YOUR-USERNAME/special-gifts-app.git
git push -u origin main
```

## 12. Connect GitHub to Netlify

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

## 13. Add environment variables in Netlify

Before deploying, add the same environment variables from `.env.local`.

In Netlify:

1. Open the site settings.
2. Go to environment variables.
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

Paste the exact values from Supabase.

## 14. Deploy the site

In Netlify:

1. Trigger the first deploy.
2. Wait for the build to finish.
3. Open the generated Netlify URL.

Test again on the live site:

1. Browse products.
2. Add an item to cart.
3. Complete checkout.
4. Confirm the order appears in Supabase.

## 15. Set your custom domain later

When you are ready:

1. Buy or use your domain.
2. In Netlify, open domain management.
3. Add your custom domain.
4. Update DNS records where your domain is registered.
5. Wait for SSL to finish provisioning.

You can do this after the site is already live.

## 16. Recommended first launch workflow

For launch week, keep it simple:

- Use EFT as the payment method
- Use WhatsApp confirmation as the final human handoff
- Use Supabase to store every order
- Manually update order status in Supabase

This is the safest low-cost MVP.

## 17. What to improve next

After the first live version, add:

1. Admin dashboard for managing orders
2. Real product images per item
3. Product management from Supabase instead of hardcoded catalog data
4. PayFast integration
5. User accounts
6. Email notifications
7. PUDO automation if you have the correct production integration details

## 18. Troubleshooting

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

## 19. Exact order to follow

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

## 20. Official references

- Supabase Next.js quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase CLI getting started: https://supabase.com/docs/guides/local-development/cli/getting-started
- Netlify Next.js overview: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- GitHub set up Git: https://docs.github.com/en/get-started/git-basics/set-up-git
- GitHub add local code: https://docs.github.com/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-an-existing-project-to-github-using-the-command-line?platform=mac
