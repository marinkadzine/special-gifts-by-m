# Special Gifts by M Mobile Delivery Plan

Special Gifts by M must support both:

- Web App access in the browser
- Installed mobile app delivery when a client prefers Android or iPhone

## Current recommendation

Use this stack:

- Next.js for the main web app
- PWA features for installability from the browser
- Capacitor for packaging the web app into Android and iOS app projects

This gives one codebase with multiple delivery options.

## Delivery choices for clients

### 1. Web App

- Opens in browser
- Easiest to update
- Best for immediate launch

### 2. Installed Web App / PWA

- Can be installed from supported browsers
- Feels more app-like
- No app store submission required

### 3. Android APK / AAB

- Packaged with Capacitor
- Can be installed directly or published to Google Play

### 4. iOS App

- Packaged with Capacitor
- Built and signed in Xcode
- Can be delivered privately or submitted to the App Store

## What is already prepared in this repo

- Responsive web storefront
- Mobile-first checkout flow
- Web app manifest
- App icons for install/mobile packaging
- Supabase backend structure for shared orders
- Static-export-friendly architecture for Capacitor
- Capacitor config and CLI scripts

Files involved:

- `src/app/manifest.ts`
- `src/app/layout.tsx`
- `capacitor.config.ts`
- `next.config.ts`
- `public/app-icons/icon-192.png`
- `public/app-icons/icon-512.png`
- `public/app-icons/apple-touch-icon.png`

## Recommended rollout order

### Phase 1: Web launch

Launch the ecommerce site as a web app first.

Why:

- Fastest route to production
- Lowest cost
- Easy to test with real customers
- Same backend can be reused for mobile packaging later

### Phase 2: PWA readiness

This repo now uses direct Supabase browser inserts instead of a server-only order route.

Why that matters:

- it keeps the same checkout flow working in a static build
- it fits Capacitor packaging much better
- it avoids relying on a custom server inside the mobile wrapper

After the web launch:

- confirm install prompt behavior
- add offline fallback if needed
- polish app icon, splash screen, and mobile navigation

### Phase 3: Capacitor packaging

Wrap the web app for Android and iOS.

Core command flow now:

```bash
npm install
npm run build:mobile
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

## Android path

Target result:

- Android Studio project
- APK for direct install
- AAB for Play Store submission

Typical flow:

1. Install Android Studio
2. Run `npm run cap:add:android`
3. Run `npm run build:mobile`
4. Run `npm run cap:sync`
5. Open Android Studio
6. Build APK or AAB

## iOS path

Target result:

- Xcode project
- iPhone app build
- App Store submission option

Typical flow:

1. Use a Mac with Xcode
2. Run `npm run cap:add:ios`
3. Run `npm run build:mobile`
4. Run `npm run cap:sync`
5. Open Xcode
6. Configure signing
7. Build for device or App Store

## Important business note

Web app first does not block APK or iOS later.

It is the best route for urgent launch because:

- Special Gifts by M can go live quickly
- the same Supabase project can keep serving both web and mobile
- clients can choose browser access now and installable app access next

## What we should do next

After the store is stable, the next engineering step should be:

1. Finish Special Gifts by M web checkout and content
2. Add proper product images and admin workflows
3. Run the included Capacitor setup for Android
4. Produce APK for testing
5. Prepare iOS packaging later
