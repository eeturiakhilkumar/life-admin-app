# Life Admin

Life Admin is a cross-platform personal operations dashboard built with `Expo`, `React Native`, `Supabase`, and a shared Turbo monorepo. The same product codebase supports:

- Web
- iOS
- Android

The web app is deployed to Firebase Hosting. Mobile builds are prepared with Expo EAS for App Store and Play Store release flows.

## Repo Structure

- `apps/app`: Expo application for web, iOS, and Android
- `packages/ui`: shared UI primitives and design tokens
- `packages/domain`: shared types, schemas, reminder logic, dashboard logic
- `packages/ai`: AI prompt builders and structured response contracts
- `packages/config`: shared config for linting, formatting, and tests
- `supabase`: database migrations, local Supabase config, edge-function scaffolding
- `.github/workflows`: CI, build, and deployment automation
- `scripts`: utility scripts including architecture PDF generation
- `.nvmrc`: recommended local Node version

## Prerequisites

Install these before working on the project:

- `Node.js` 24.14.1
- `pnpm` 9.15.0 via `corepack`
- `Git`
- `Firebase CLI`
- `Supabase CLI` if you want to run or manage Supabase locally
- `Expo CLI` through the workspace (`pnpm exec expo ...`)
- `EAS CLI` for store builds and submission flows

Optional but useful:

- Xcode for iOS builds
- Android Studio for Android builds
- A Firebase project
- A Supabase project
- An OpenAI API key

## Initial Setup

Clone the repo and install dependencies:

```bash
cd /Users/aeeturi/Documents/Akhil/projects/life_admin_app/life-admin-app
nvm use
corepack enable pnpm
corepack prepare pnpm@9.15.0 --activate
pnpm install
```

If you use `nvm`, the repo includes `.nvmrc` pinned to Node 24.14.1.

If your environment has issues with a custom package mirror, this repo is configured to use the public npm registry through `.npmrc`.

## Environment Variables

Copy the example file and fill in real values:

```bash
cp .env.example .env.local
```

Current environment variables:

- `APP_ENV`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_SENTRY_DSN`
- `OPENAI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Notes:

- Variables prefixed with `EXPO_PUBLIC_` are exposed to the client app.
- Keep `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- For CI/CD, store secrets in GitHub Actions secrets, Firebase, EAS, or your hosting provider as appropriate.

## Local Development

### Run The Expo App

From the repo root:

```bash
pnpm dev:app
```

Or directly from the app workspace:

```bash
cd apps/app
pnpm exec expo start
```

### Run The Web App On Localhost

Expo web:

```bash
cd apps/app
pnpm exec expo start --web --host localhost --port 8081
```

If you want to serve the static production-style build instead:

```bash
cd /Users/aeeturi/Documents/Akhil/projects/life_admin_app/life-admin-app
pnpm build:web
cd apps/app
python3 -m http.server 8081 -d dist
```

Then open:

```bash
http://localhost:8081
```

### Supabase Local Workflow

If you want to run Supabase locally:

```bash
supabase start
supabase db reset
```

Migrations are stored in:

- `supabase/migrations`

Edge function scaffolding is stored in:

- `supabase/functions`

## Core Commands

From the repo root:

```bash
pnpm dev
pnpm dev:app
pnpm typecheck
pnpm test
pnpm build
pnpm build:web
pnpm pdf:architecture
```

## Testing

### Typecheck

```bash
pnpm typecheck
```

### Unit And Integration Tests

```bash
pnpm test
```

### Web End-To-End Tests

```bash
pnpm test:web
```

This uses Playwright.

### Mobile Smoke Tests

```bash
pnpm test:mobile
```

This uses Detox and requires the relevant simulator/emulator setup.

## Architecture Documentation

The editable architecture source is:

- `/Users/aeeturi/Documents/Akhil/projects/life_admin_app/docs/life-admin-architecture.md`

The generated PDF is:

- `/Users/aeeturi/Documents/Akhil/projects/life_admin_app/docs/life-admin-architecture.pdf`

To regenerate the PDF:

```bash
pnpm pdf:architecture
```

## Web Deployment To Firebase Hosting

### 1. Log In To Firebase

```bash
firebase login
```

### 2. Select Or Add Your Firebase Project

```bash
firebase use --add
```

### 3. Configure Hosting Targets

This repo can use one Firebase Hosting site for both preview and production GitHub Actions deploys. Map the targets to the same Hosting site ID:

```bash
firebase target:apply hosting life-admin-staging <your-hosting-site-id>
firebase target:apply hosting life-admin-production <your-hosting-site-id>
```

If `life-admin-app-16bd7` is your only Hosting site, you can use that value for both commands.

### 4. Build The Web App

```bash
pnpm build:web
```

The Firebase artifact is generated in:

- `apps/app/dist`

### 5. Deploy

Deploy all hosting targets:

```bash
firebase deploy --only hosting
```

Or deploy a single target:

```bash
firebase deploy --only hosting:life-admin-production
firebase deploy --only hosting:life-admin-staging
```

### Firebase Files

- `firebase.json`
- `.firebaserc`

## iOS And Android Build / Release

### 1. Log In To Expo

```bash
pnpm exec eas login
```

### 2. Initialize EAS If Needed

```bash
pnpm exec eas init
```

Then update `apps/app/app.config.ts` with the correct EAS project ID.

### 3. Build Mobile Apps

From the repo root:

```bash
pnpm exec eas build --platform ios --profile preview
pnpm exec eas build --platform android --profile preview
```

Production builds:

```bash
pnpm exec eas build --platform ios --profile production
pnpm exec eas build --platform android --profile production
```

### 4. Submit To Stores

iOS:

```bash
pnpm exec eas submit --platform ios --profile production
```

Android:

```bash
pnpm exec eas submit --platform android --profile production
```

### Mobile Release Requirements

Before store submission, make sure these are updated:

- iOS bundle identifier in `apps/app/app.config.ts`
- Android package name in `apps/app/app.config.ts`
- App icons and splash assets in `apps/app/assets`
- App Store and Play Store metadata
- Apple Sign-In config
- Privacy policy and legal links
- Data safety / privacy disclosures

## CI/CD

GitHub Actions workflow:

- `.github/workflows/ci.yml`

Current automation includes:

- dependency install
- typecheck
- tests
- web build
- Firebase web deployment
- EAS preview mobile builds

Required GitHub secrets depend on your environment, but this repo now expects:

- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_PROJECT_ID`
- `EXPO_TOKEN`

Add additional secrets for Supabase, OpenAI, Sentry, or store credentials as needed.

## Troubleshooting

### GitHub Actions Cannot Find pnpm

The workflow already sets up `pnpm` before Node caching. If this fails again, confirm:

- the workflow is using the latest committed `.github/workflows/ci.yml`
- `packageManager` in `package.json` is still `pnpm@9.15.0`

### Firebase Target Not Configured

Run:

```bash
firebase target:apply hosting life-admin-staging <your-hosting-site-id>
firebase target:apply hosting life-admin-production <your-hosting-site-id>
```

### Firebase GitHub Deploy Missing Service Account

Add these repository secrets in GitHub Actions:

```bash
FIREBASE_SERVICE_ACCOUNT
FIREBASE_PROJECT_ID
```

`FIREBASE_SERVICE_ACCOUNT` should contain the full Firebase service-account JSON. `FIREBASE_PROJECT_ID` should contain your Firebase project ID, for example `life-admin-app-16bd7`.

### Expo Web Build Fails On Notifications

The project already guards notification initialization on web. If you add new notification code, keep it platform-aware and avoid initializing native notification APIs during static rendering.

### Localhost Server Cannot Bind

On restricted environments, port binding may require elevated permissions. If Expo dev server is unreliable in your shell, build the web app first and serve `apps/app/dist` with a simple local HTTP server.

## Deployment Targets

- Web: Firebase Hosting
- iOS: EAS Build -> TestFlight -> App Store
- Android: EAS Build -> Internal testing -> Play Store
- Backend: Supabase Auth, Postgres, Storage, Edge Functions
