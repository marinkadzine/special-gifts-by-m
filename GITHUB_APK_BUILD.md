# GitHub APK Build

Use this workflow when your laptop is too slow to build the Android app locally.

## What it does

The GitHub Actions workflow:

1. installs the project dependencies
2. builds the static Next.js app
3. syncs the Capacitor Android project
4. runs the Android Gradle debug build
5. uploads the APK as a downloadable artifact

## Before you run it

Add these repository secrets in GitHub:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

You can add them in:

`GitHub -> Repo -> Settings -> Secrets and variables -> Actions`

## How to run it

1. Open the GitHub repository.
2. Click `Actions`.
3. Click `Build Android Debug APK`.
4. Click `Run workflow`.
5. Choose the `main` branch.
6. Click the green `Run workflow` button.

## How to download the APK

1. Open the finished workflow run.
2. Scroll to `Artifacts`.
3. Download `special-gifts-by-m-debug-apk`.
4. Extract the zip file.
5. Install `app-debug.apk` on your Android phone.

## Important notes

- This workflow builds a **debug APK**, which is good for testing and direct installs.
- A debug APK is not the final Play Store release build.
- If the repository stays private, GitHub Actions usage counts against your private-repo quota.
- If the repository is public, standard GitHub-hosted Actions minutes are free.
