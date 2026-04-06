# Life Admin

Life Admin is a cross-platform personal operations dashboard built with Expo, React Native, and Supabase. The workspace is structured as a Turbo monorepo so web, iOS, and Android can share the same product logic while deploying independently.

## Workspaces

- `apps/app`: Expo app targeting web, iOS, and Android
- `packages/ui`: shared UI primitives and design tokens
- `packages/domain`: data contracts, validation, and reminder logic
- `packages/ai`: AI prompt builders and response schemas
- `packages/config`: shared ESLint, Prettier, and Vitest config

## Core Commands

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install
pnpm dev:app
pnpm build:web
pnpm test
pnpm pdf:architecture
```

The generated architecture artifacts are stored in `/Users/aeeturi/Documents/Akhil/projects/life_admin_app/docs`.

## Deployment Targets

- Web: Firebase Hosting
- iOS: EAS Build -> TestFlight -> App Store
- Android: EAS Build -> Internal testing -> Play Store
- Backend: Supabase Auth, Postgres, Storage, Edge Functions
