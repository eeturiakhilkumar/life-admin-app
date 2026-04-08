# Life Admin Architecture

## Product Vision And MVP Scope
Life Admin is an AI-assisted personal operations dashboard that helps users manage the recurring work of life from one place. The product consolidates bills, appointments, renewals, important dates, shopping lists, and documents into a workflow-first experience built for web, iOS, and Android.

The MVP focuses on reducing fragmentation rather than adding heavy feature depth inside each module. Every module should feel like part of the same operating system:
- One inbox for capture
- One dashboard for prioritization
- One reminder engine
- One document layer
- One AI assistant that suggests rather than acts silently

Launch modules:
- Bills
- Appointments
- Renewals
- Important dates
- Shopping lists
- Documents

Deferred after MVP:
- Travel tickets as a dedicated module
- Shared household and family collaboration
- Autonomous AI actions without explicit user approval
- Complex calendar sync and external booking workflows

## Selected Tech Stack And Rationale
### App Framework
Use **React Native with Expo and Expo Router** as the primary app framework.

Why:
- One codebase for web, iOS, and Android
- Native mobile builds remain valid for the App Store and Play Store
- Faster delivery for a greenfield MVP than separate web and mobile implementations
- Good support for notifications, auth redirects, camera, file access, and OTA updates

### Workspace And Tooling
Use:
- `pnpm` for package management
- `Turborepo` for workspace orchestration
- `TypeScript` everywhere
- Shared packages for UI, domain, AI contracts, and config

Why:
- Keeps the app shell and shared business logic cleanly separated
- Supports platform reuse without turning the main app into a single oversized folder
- Makes testing, CI, and future package growth easier

### Backend
Use **Supabase** for:
- Authentication
- Postgres relational data
- Document storage
- Row-level security
- Edge Functions for secure AI calls
- Optional Realtime features

Why:
- Structured life-admin workflows fit relational data well
- Storage plus Postgres is a strong match for document-linked records
- RLS aligns with the privacy-first posture
- Server-side AI calls are straightforward to isolate

### Web Hosting
Use **Firebase Hosting** for the web deployment target.

Why:
- Static Expo web export fits the MVP architecture
- Hosting is simple, fast, and production-proven
- Preview and production channels are easy to wire into CI

### Mobile Distribution
Use **Expo Application Services** for:
- Build pipelines
- Signing and credentials
- OTA update management
- Submission handoff to the Apple App Store and Google Play Store

### AI Layer
Use **OpenAI** only from server-side functions.

V1 AI capabilities:
- Quick-capture parsing
- Document summaries
- Structured field extraction
- Weekly digest generation

The AI layer is assistive, not autonomous.

## Repo Structure
The implementation lives in `/Users/aeeturi/Documents/Akhil/projects/life_admin_app/life-admin-app`.

Workspace layout:
- `apps/app`: Expo application for web, iOS, Android
- `packages/ui`: shared components and design tokens
- `packages/domain`: schemas, types, reminder logic, dashboard aggregation
- `packages/ai`: prompts and structured response contracts
- `packages/config`: shared ESLint, Prettier, and Vitest config
- `supabase`: migrations, local config, and edge functions
- `.github/workflows`: CI, web deployment, and mobile build automation

## Core Data Model
The product uses a shared item model so dashboard ranking, reminders, search, and AI suggestions remain consistent across modules.

Core enums:
- `item_type`: bill, appointment, renewal, important_date, shopping_list, document
- `item_status`: draft, active, completed, archived

Core contracts:
- `Reminder`
- `DocumentRecord`
- `DocumentLink`
- `AiSuggestion<T>`
- `QuickCaptureInput`
- `QuickCaptureResult`
- `DashboardFeedItem`

Primary tables:
- `profiles`
- `items`
- `reminders`
- `documents`
- `document_links`
- `shopping_list_items`
- `ai_runs`

Modeling principles:
- Module-specific behavior extends a shared item backbone
- Documents can attach to any relevant life-admin record
- Reminder scheduling is many-to-one per item
- AI outputs are captured as suggestions and audit records rather than implicit writes

## AI Boundaries And Privacy Rules
Privacy is a product feature, not a later hardening pass.

Rules for the MVP:
- AI runs server-side only
- AI may suggest values, summaries, and next actions
- AI may not silently write to bills, appointments, renewals, or documents
- The user must confirm any record changes derived from AI
- AI runs are logged for auditability and retry visibility
- Only the minimum necessary document content should be processed externally

Strong privacy defaults:
- Row-level security on user-owned tables
- Sensitive keys are never exposed in the client bundle
- Notification and document access require explicit OS permissions
- Future deletion/export flows should work from the same canonical data model

## Testing Strategy
### Unit
Use `Vitest` for:
- Zod schema validation
- Reminder and due-date calculations
- Renewal logic
- Dashboard aggregation
- AI response parsing and confidence handling

### Integration
Cover:
- Session bootstrap behavior
- CRUD flows against the client data layer
- Document upload initiation
- AI suggestion handoff to confirmation UI

### End-To-End
Use:
- `Playwright` for web
- `Detox` for iOS and Android smoke coverage

Critical release scenarios:
- Sign in with email, Google, and Apple
- Create and update a bill
- Create an appointment with reminders
- Track a renewal deadline
- Add important dates and shopping list items
- Upload a document and preview extracted suggestions
- Search across modules
- Verify the static web build under Firebase Hosting
- Validate production mobile builds for store submission

## Deployment Strategy
### Web
Deployment path:
- Build Expo web output
- Export static assets
- Deploy to Firebase Hosting
- Use SPA rewrites to route all app paths to `index.html`

Environments:
- Local development
- Staging
- Production

### iOS
Release path:
- `EAS Build` for signed binaries
- TestFlight for validation
- App Store Connect for release management

Required readiness:
- Bundle identifier
- App icons and splash assets
- Permission usage descriptions
- Apple Sign-In support
- Privacy manifest and store disclosures

### Android
Release path:
- `EAS Build` for Android App Bundles
- Internal testing track
- Production rollout through Google Play Console

Required readiness:
- Application ID
- Adaptive icon
- Notification permissions
- Data safety disclosures
- Signed release configuration

## Phase-Based Roadmap
### Phase 1
- Monorepo foundation
- Expo shell
- Shared domain and UI packages
- Supabase schema and AI function scaffolding
- Firebase and EAS config

### Phase 2
- Bills, appointments, renewals, dates, lists, and documents modules
- Dashboard feed
- Quick-capture inbox
- Search and settings

### Phase 3
- Live Supabase CRUD
- Document upload pipeline
- AI extraction and digest flows
- Notifications and reminder jobs

### Phase 4
- QA hardening
- Store metadata and compliance work
- Release automation
- Production launch

## Non-Goals For MVP
- Travel booking and live itinerary integrations
- Shared family permissions and collaboration models
- Silent AI-driven task execution
- Complex banking, autopay, or payment processing features
- Full offline-first sync architecture

## Operational Notes
Before production release, complete:
- Privacy Policy
- Terms of Service
- Account deletion flow
- Data export/delete support
- Apple privacy disclosures
- Google Play data safety form
- Error monitoring and analytics setup

This architecture intentionally favors fast cross-platform delivery, strong privacy defaults, and workflow cohesion over broad v1 feature sprawl.
