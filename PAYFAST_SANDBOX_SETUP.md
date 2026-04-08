# PayFast Sandbox Setup

Last updated: April 9, 2026

This guide is for the current Special Gifts by M setup:

- frontend on Cloudflare Pages
- backend on Supabase
- static Next.js export
- PayFast handled securely through Supabase Edge Functions

## Your Sandbox Details

- Cloudflare URL: `https://a349b61d.special-gifts-app.pages.dev/`
- Merchant ID: `10004002`
- Merchant Key: sandbox value supplied
- Passphrase: sandbox value supplied
- EFT remains active: `yes`

## What Has Already Been Added In The App

The app now has:

- PayFast option enabled in checkout
- return page: `/checkout/payfast-return`
- cancel page: `/checkout/payfast-cancel`
- browser handoff to a secure Supabase Edge Function
- ITN handler source file for order status updates

Files:

- [checkout-form.tsx](C:\Users\legra\special-gifts-app\src\components\checkout-form.tsx)
- [payfast.ts](C:\Users\legra\special-gifts-app\src\lib\payfast.ts)
- [payfast-return page](C:\Users\legra\special-gifts-app\src\app\checkout\payfast-return\page.tsx)
- [payfast-cancel page](C:\Users\legra\special-gifts-app\src\app\checkout\payfast-cancel\page.tsx)
- [payfast-init function](C:\Users\legra\special-gifts-app\supabase\functions\payfast-init\index.ts)
- [payfast-itn function](C:\Users\legra\special-gifts-app\supabase\functions\payfast-itn\index.ts)
- [schema.sql](C:\Users\legra\special-gifts-app\supabase\schema.sql)

## Step 1: Update The Database

In Supabase:

1. Open `SQL Editor`
2. Open [schema.sql](C:\Users\legra\special-gifts-app\supabase\schema.sql)
3. Copy all of it
4. Paste it into a new query
5. Click `Run`

This adds the payment reference columns needed for PayFast updates.

## Step 2: Add Edge Function Secrets

In Supabase:

1. Open `Edge Functions`
2. Open the secrets or environment variables screen
3. Add these exact keys:

`PAYFAST_MERCHANT_ID`
`PAYFAST_MERCHANT_KEY`
`PAYFAST_PASSPHRASE`
`PAYFAST_MODE`
`PUBLIC_SITE_URL`

Use these values:

- `PAYFAST_MERCHANT_ID` = `10004002`
- `PAYFAST_MERCHANT_KEY` = your sandbox merchant key
- `PAYFAST_PASSPHRASE` = your sandbox passphrase
- `PAYFAST_MODE` = `sandbox`
- `PUBLIC_SITE_URL` = `https://a349b61d.special-gifts-app.pages.dev`

Supabase docs:
- [Edge Functions dashboard](https://supabase.com/docs/guides/functions/quickstart-dashboard)
- [Edge Function secrets](https://supabase.com/docs/guides/functions/secrets)

## Step 3: Create The `payfast-init` Function

In Supabase:

1. Open `Edge Functions`
2. Click `Deploy a new function`
3. Choose `Via Editor`
4. Name it: `payfast-init`
5. Replace the template code with the contents of:
   [payfast-init function](C:\Users\legra\special-gifts-app\supabase\functions\payfast-init\index.ts)
6. Click `Deploy function`

This function creates the order in Supabase as `pending_payment` and sends the signed sandbox payment form back to the browser.

## Step 4: Create The `payfast-itn` Function

In Supabase:

1. Click `Deploy a new function`
2. Choose `Via Editor`
3. Name it: `payfast-itn`
4. Replace the template code with the contents of:
   [payfast-itn function](C:\Users\legra\special-gifts-app\supabase\functions\payfast-itn\index.ts)
5. Click `Deploy function`

This function receives the PayFast ITN and updates the order status.

## Step 5: Redeploy The Web App

Push the latest code to GitHub, then let Cloudflare Pages rebuild.

After the deploy, the checkout page will show the PayFast sandbox option.

## Step 6: Test In Browser First

1. Open the live app:
   [https://a349b61d.special-gifts-app.pages.dev/](https://a349b61d.special-gifts-app.pages.dev/)
2. Add a product to cart
3. Go to checkout
4. Choose `PayFast`
5. Click `Continue to PayFast`
6. Complete the sandbox payment
7. Return to the app
8. Check `/admin`
9. Confirm the order moved from `pending_payment` to `paid`

PayFast sandbox references:
- [Sandbox test payments](https://support.payfast.help/portal/en/kb/articles/how-do-i-make-test-payments-in-sandbox-mode-20-9-2022)
- [Merchant ID and Key](https://support.payfast.help/portal/en/kb/articles/where-is-my-merchant-id-and-key-20-9-2022)
- [Passphrase](https://support.payfast.help/portal/en/kb/articles/how-do-i-enable-a-passphrase-on-my-payfast-account-20-9-2022)
- [Signature mismatch causes](https://support.payfast.help/portal/en/kb/articles/common-causes-of-a-failed-integration-signature-mismatch-20-9-2022)
- [ITN security errors](https://support.payfast.help/portal/en/kb/articles/what-causes-the-itn-security-check-errors-20-9-2022)

## Step 7: Rebuild The Android APK

Only after the browser sandbox flow works:

1. Push the final code to GitHub
2. Open GitHub `Actions`
3. Run `Build Android Debug APK`
4. Download the new APK artifact
5. Install or update it on your Android phone

The APK will then use the same working browser-based PayFast flow.
