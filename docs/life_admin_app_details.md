# Life Admin App Details

Last updated: 2026-04-07

## Firebase Hosting Deployment

The current web build was deployed on 2026-04-07 to the Firebase project `life-admin-app-16bd7`.

Deployment command used:

```bash
pnpm exec firebase deploy --only hosting:life-admin-staging --project life-admin-app-16bd7
```

Deployment result:

- Hosting target: `life-admin-staging`
- Firebase project: `life-admin-app-16bd7`
- Published build directory: `apps/app/dist`
- Live Hosting URL: `https://life-admin-app-16bd7.web.app`

Important note:

- the app is intended to work with Firebase Phone Authentication on the hosted Firebase domain
- if phone authentication behavior differs between localhost and hosting, the hosted domain should be treated as the primary validation environment

## Firebase Runtime Stabilization

The Firebase runtime configuration was further hardened on 2026-04-08.

- the app now includes a project-scoped Firebase web config fallback in source
- this fallback uses the Firebase config provided specifically for `life-admin-app-16bd7`
- runtime auth setup no longer depends entirely on Expo env injection being present in every web execution path

This was added because the browser could still show `Firebase phone auth is not configured for this application yet.` even when Expo config resolution contained the correct values.

## Fixed Port And OTP Button Enablement

Two important behavior fixes were applied on 2026-04-07:

- the web app now has a dedicated fixed dev script on port `8084`
- the sign-in screen no longer keeps `Send OTP` disabled because of a fragile Firebase config lookup on web

### Fixed Local Port

The project now exposes a consistent web startup command:

```bash
pnpm --dir /Users/aeeturi/Documents/Akhil/projects/life_admin_app/life-admin-app run dev:web
```

That command runs the Expo web app on:

- `http://localhost:8084`

The goal is to keep one predictable localhost port for repeated development reruns.

### OTP Button Enablement Fix

The sign-in screen behavior has been tightened so the `Send OTP` button is enabled only when both conditions are true:

- Firebase phone auth config is available to the running Expo web app
- the entered mobile number parses into a valid E.164-ready value

Implementation details:

- Firebase config resolution now falls back to `process.env.EXPO_PUBLIC_FIREBASE_*` values in addition to Expo `extra`
- this avoids false "not configured" states on the web runtime
- the sign-in screen now computes phone validity reactively from the typed input
- a valid phone number now allows the button to enable instead of waiting on the wrong runtime config state
- inline validation guidance is shown under the mobile number input

Current behavior expectation:

- empty or invalid phone number: button stays disabled
- valid phone number and Firebase config available: button becomes enabled
- while OTP request is in flight: button disables and shows `Sending OTP...`

### Sign-In Copy Refinement

The mobile-number field UX was refined further on 2026-04-07:

- placeholder copy changed to `Enter your mobile number`
- helper text now shows a cleaner example format
- invalid phone-number feedback is now shown in a proper inline error container
- phone-number parser messages were rewritten to be shorter, clearer, and more user friendly

## Latest Auth Direction Change

The authentication direction changed after the earlier OTP implementation work:

- previous implementation direction: Supabase phone OTP
- current required direction: Firebase phone authentication on the sign-in screen

Current status:

- the app still contains the earlier OTP-oriented auth scaffolding
- Firebase SDK installation has now succeeded in this workspace
- the auth migration is being moved to Firebase for this app only
- Firebase phone auth has a real hosted domain available for this app: `https://life-admin-app-16bd7.firebaseapp.com`
- Firebase test phone numbers with OTPs have been added for safer development testing

Important scoping decision:

- the provided Firebase config must be used only for this application
- no global/shared Firebase defaults should be introduced outside this repo
- environment variables and runtime config should remain scoped to `life-admin-app`

Next implementation target:

- replace the current auth provider with Firebase Auth
- use Firebase phone sign-in on the sign-in screen
- keep the login gate so the dashboard and modules stay protected behind authentication

## Firebase Auth Hardening Notes

The sign-in flow is being hardened for real web interaction quality:

- the web version of the OTP action controls now uses real HTML `button` elements
- the native version continues to use React Native `Pressable`
- this keeps the Expo app cross-platform while giving the web surface proper button semantics and reliable click handling

## Product Direction

Life Admin is being positioned as an AI-based personal operations dashboard rather than a feature-heavy admin tool. The product goal is to give users one trusted workspace for recurring life operations:

- Bills
- Appointments
- Renewals
- Travel tickets
- Important dates
- Shopping lists
- Documents

Important product framing from the latest requirements:

- The experience should feel workflow-centric, not like a pile of disconnected utilities.
- Existing application content must only be visible after the user is logged in.
- Mobile number + OTP is the required sign-in entry point.
- The sign-in page should use a single mobile-number textbox and an OTP popup flow.

## What Was Already In The App Before This Auth Slice

The current app shell already included:

- Expo Router app structure for web and mobile
- Dashboard, modules, search, inbox, settings, onboarding, and detail routes
- Shared UI, domain, and AI packages in the Turbo monorepo
- Mock dashboard and module data
- A Supabase client placeholder using Expo config env vars

## Auth Implementation Added In This Slice

### Goal

Protect all previously built application surfaces behind authenticated access using mobile-number OTP via Supabase Auth.

### Implementation Summary

Added a proper auth foundation in the Expo app:

- Supabase client updated for persisted auth sessions
- Auth provider added to app-wide providers
- Session bootstrap and auth-state subscription added
- Protected-route guard added
- Root route now decides between sign-in and dashboard based on session state
- OTP sign-in screen rebuilt around phone number + SMS verification
- OTP popup flow added so verification happens in a modal after “Send OTP”
- Settings screen now includes sign-out
- Protected routes now redirect logged-out users to sign-in

### Files Added

- `life-admin-app/apps/app/src/lib/auth-utils.ts`
- `life-admin-app/apps/app/src/providers/auth-provider.tsx`
- `life-admin-app/apps/app/src/components/require-auth.tsx`

### Files Updated

- `life-admin-app/apps/app/src/lib/api.ts`
- `life-admin-app/apps/app/src/providers/app-providers.tsx`
- `life-admin-app/apps/app/app/index.tsx`
- `life-admin-app/apps/app/app/auth/sign-in.tsx`
- `life-admin-app/apps/app/app/(tabs)/_layout.tsx`
- `life-admin-app/apps/app/src/features/module-screen.tsx`
- `life-admin-app/apps/app/app/settings/privacy.tsx`
- `life-admin-app/apps/app/app/settings/notifications.tsx`
- `life-admin-app/apps/app/app/onboarding.tsx`
- `life-admin-app/apps/app/app/(tabs)/settings.tsx`
- `life-admin-app/apps/app/tests/app.test.ts`
- `life-admin-app/tests/e2e/smoke.spec.ts`

## Detailed Behavior

### 1. Session Management

The app now creates the Supabase client with persisted session behavior enabled.

For native platforms:

- AsyncStorage is used for session persistence
- automatic token refresh is enabled
- auth auto-refresh is started/stopped with app foreground state

For web:

- the standard Supabase web session handling remains active

### 2. Route Protection

The following areas are now intended to be protected:

- dashboard tab stack
- module screens
- privacy settings
- notification settings
- onboarding route

When no verified session exists, protected routes redirect to `/auth/sign-in`.

### 3. OTP Flow

The sign-in flow now works like this:

1. User enters a mobile number in a single textbox
2. App normalizes it into an E.164-style phone number
3. App requests an OTP using Supabase phone auth
4. OTP popup opens
5. User enters the 6-digit OTP in the popup
6. App verifies the OTP with Supabase
7. On success, Supabase session becomes active and the app redirects to `/dashboard`

### 3a. Mobile Number Input Assumption

To keep the UI to a single field, the current implementation uses this rule:

- if the user enters a number beginning with `+`, it is treated as a full international number
- if the user enters exactly 10 digits, the app currently assumes India and prefixes `+91`
- if the user needs another country, they should enter the country code directly

If you want, this can be replaced later with a proper country picker.

### 4. Settings / Sign-Out

The settings screen now shows:

- currently signed-in phone number when available
- sign-out action

## What You Need To Do From Your End

These are the required setup steps for proper end-to-end OTP auth:

### A. Provide Real Supabase Credentials

In `life-admin-app/.env.local`, set:

```bash
APP_ENV=development
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=life-admin-staging
```

### B. Enable Phone Auth In Supabase

In your Supabase project:

- enable Phone authentication
- configure an SMS provider
- review rate limits and anti-abuse protections

### C. Configure An SMS Provider

Supabase phone auth requires an SMS provider to actually deliver OTP codes. Until that is configured, the UI can be built but OTP delivery will not work in real life.

### D. Test With Real Phone Numbers

After configuration:

1. run the app locally
2. request an OTP
3. verify login
4. sign out
5. confirm protected routes redirect correctly when logged out

## Firebase Migration Blocker

To switch the app from Supabase OTP to Firebase phone authentication, the project needs the Firebase SDK installed first.

The installation attempt is currently blocked by this local environment issue:

- npm/pnpm cannot verify the registry certificate chain
- observed error: `UNABLE_TO_VERIFY_LEAF_SIGNATURE`

Until that environment issue is fixed, the realtime Firebase auth migration cannot be completed in code.

## Important Notes And Constraints

### Travel Tickets

The latest product direction explicitly includes travel tickets. The currently checked-in domain model and module list do not yet include a `travel_ticket` item type or a travel module route.

That means:

- travel tickets are now part of the documented product scope
- travel ticket support still needs a dedicated implementation slice
- auth work was completed without forcing a risky schema expansion in the same change

### Dependency Follow-Up

I attempted to install `react-native-url-polyfill`, which is commonly recommended for Supabase React Native auth setups, but the install hit an SSL verification issue against the npm registry in this environment.

Impact:

- the current auth implementation uses the existing dependencies already in the repo
- if you see runtime URL/polyfill issues on device, we should retry that dependency install in a clean network environment

### Existing Generated File Changes In Repo

There were already generated or local-environment changes present in the repo during this work, including Expo-generated files. Those should be reviewed separately before committing if you want a clean commit.

## Validation Plan For This Slice

Minimum checks to run after the code changes:

```bash
source ~/.nvm/nvm.sh
nvm use 24.14.1
pnpm --dir /Users/aeeturi/Documents/Akhil/projects/life_admin_app/life-admin-app typecheck
pnpm --dir /Users/aeeturi/Documents/Akhil/projects/life_admin_app/life-admin-app build:web
pnpm --dir /Users/aeeturi/Documents/Akhil/projects/life_admin_app/life-admin-app test
```

Web flow checks:

- `/` should show sign-in when logged out
- `/dashboard` should redirect to sign-in when logged out
- successful OTP verification should land on `/dashboard`
- sign-out should lock the app again

## Validation Results Recorded On 2026-04-07

Completed during this implementation pass:

- `pnpm typecheck` passed
- `pnpm test` passed
- `pnpm build:web` passed
- Expo web dev server reran successfully
- localhost responded with `HTTP 200`

Important runtime note:

- an older Expo process was already using port `8081`
- the updated auth-enabled app was started on `http://localhost:8082`

Additional note:

- Expo currently reports dependency compatibility warnings for some package versions in the workspace
- the app still compiled and served successfully, but those version drifts should be cleaned up in a separate maintenance pass
- Playwright smoke tests could not run yet because the required local browser binary is not installed in this environment

## Next Recommended Product Slices

After OTP auth is stable, the next logical slices are:

1. add travel tickets to the shared domain model and module surface
2. replace mock dashboard/module data with authenticated user-scoped Supabase data
3. add row-level security policies for user-owned data
4. add OTP/auth Playwright coverage with test-safe auth strategy
5. design the first AI-assisted capture workflow for one module end to end
