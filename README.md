# ExpoDiaries — React Native Mobile Clone

> A mobile-first trade show companion and on-floor lead qualification application built with **Expo SDK 57**, **React Native 0.86**, **Expo Router**, **NativeWind**, and **TypeScript**.

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/NativeWind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://nativewind.dev)
[![Status](https://img.shields.io/badge/Phase%205-In_Progress-f59e0b?style=for-the-badge)]()

---

## 1. Project Title
**ExpoDiaries — React Native Mobile Clone**

## 2. Short Project Description
ExpoDiaries is an enterprise mobile application concept designed for trade show attendees, exhibitors, and on-floor sales representatives. It streamlines personal event planning, interactive expo hall floor navigation, business-card scanning, multi-modal lead capture (voice memos and booth collateral photos), fast qualification workflows, team management, event ROI analytics, CRM connections, multi-format export, and a comprehensive digital attendee profile ecosystem.

## 3. Project Goal
Trade-show exhibition floors are high-pressure, noisy, and fast-paced environments where sales representatives and executives have mere seconds to engage, evaluate, and log prospects. The primary goal of this application is to deliver an ultra-responsive, mobile-optimized experience where:
- Sales professionals can scan a business card, review extracted data, qualify intent, attach voice memos, assign reps, and log leads in seconds.
- Attendees can browse hall layouts, pin booths, search exhibitors, and build conflict-free schedules with real-time overlap warnings.
- Exhibitor teams can monitor capture volume, compute event ROI, connect CRM pipelines, export structured datasets (CSV, XLSX, JSON), and exchange digital NFC business cards and QR passes.
- The UI maintains fluid animations, instant feedback, and accessible interactions on iOS and Android.

---

## 4. Current Development Status

> **Development State**:  
> “Phase 0 through Phase 4 have been implemented. The project is now in Phase 5, focused on production readiness, UI/UX refinement, performance, cross-platform QA, and final engineering polish. The application is not yet considered fully complete or production-ready.”

- **Overall Progress**: **5 / 6 phases completed or actively in final production phase**
- **Core Implementation**: Phases 0, 1, 2, 3, and 4 are implemented and functional.
- **Phase 5 Status**: **🛠️ In Progress**. Currently addressing production-readiness, visual polish, accessibility compliance, performance profiling, responsive edge cases, and build readiness.
- **Visual & UI Refinement**: Active visual polish is ongoing. Spacing, typography scales, contrast, card contours, animations, and micro-interactions are being tuned across all modules.
- **Production Status**: The application is **not yet production-ready** and is **not 100% complete**. Remote backend services and live cloud endpoints remain abstracted through clean service interfaces and mock providers.

---

## 5. Phase Progress Table & Roadmap

### Summary Roadmap

```text
Phase 0 — Foundation & Architecture            ✅ Complete
Phase 1 — Auth + App Shell + Dashboard         ✅ Complete
Phase 2 — Events + Exhibitors + Floor Experience ✅ Complete
Phase 3 — Leads + Capture + OCR + Notes         ✅ Core Implementation Complete
Phase 4 — Team + Analytics + CRM + Profile      ✅ Complete
Phase 5 — Production Readiness + Final QA       🛠️ In Progress
```

### Phase Progress Breakdown

| Phase | Module Name | Scope & Focus | Status |
| :--- | :--- | :--- | :---: |
| **Phase 0** | **Foundation & Architecture** | Project setup, design system tokens, atomic UI library, mock data layer, strict Zod contracts | ✅ **Complete** |
| **Phase 1** | **Auth + App Shell + Dashboard** | Auth flow, onboarding, tab navigation, executive KPI summary, active event tracking | ✅ **Complete** |
| **Phase 2** | **Events + Exhibitors + Floor Experience** | Event discovery, exhibitor profiles, interactive floor visualizer, personal itinerary timeline | ✅ **Complete** |
| **Phase 3** | **Leads + Capture + OCR + Notes** | Camera scanner, simulated OCR, editable lead review, qualification, audio notes, attachments | ✅ **Core Implementation Complete** |
| **Phase 4** | **Team + Analytics + CRM + Profile** | Team roster, lead routing, event ROI analytics, CRM cards, multi-format export, digital badge ecosystem | ✅ **Complete** |
| **Phase 5** | **Production Readiness + Final QA** | UI/UX polish, responsive refinement, A11y, performance, error/empty states, cross-platform QA, EAS | 🛠️ **In Progress** |

---

## 6. Current Refinement

While functionality across **Phases 0 through 4** has been implemented, the application is **undergoing active Phase 5 refinement** before being considered release-ready:

- **UI refinement is actively ongoing**: Comprehensive design audit and visual enhancements across all app modules.
- **Existing screens are being polished**: Standardizing card styling, elevation, padding, borders, and color harmony across all 9 profile screens, CRM cards, ROI calculator, and export sheets.
- **Spacing, typography, visual hierarchy and responsiveness are being refined**: Fine-tuning typography scales, contrast, touch targets, and responsive layout behavior across diverse phone aspect ratios, notches, and tablet views.
- **Animations and interactions are being improved**: Tuning transition curves, spring physics, sheet drag gestures, scan reticle feedback, and 3D card perspective flips for fluid performance.
- **Final QA is still in progress**: Rigorous cross-platform testing, accessibility audits, performance profiling, and edge-case error/empty state validation.

---

## 7. Completed Features

### ✅ Phase 0 — Foundation & Architecture
- **Design System Tokens**: Tailored light & dark palette, radius scales, spacing systems, semantic color states (`src/theme/`).
- **Accessible UI Component Library**: Reusable UI components including `Button`, `Input`, `Badge`, `Card`, `Avatar`, `Chip`, `BottomSheet`, `Modal`, `Toast`, `Skeleton`, `Divider`, and `Icon` (`src/components/ui/`).
- **Typed Service & Repository Pattern**: Strict separation of concerns via TypeScript contracts (`ILeadsRepository`, `IEventsRepository`, `IAnalyticsRepository`, `ITeamRepository`, `ICrmIntegrationService`, `IExportService`).
- **Data Validation**: Strict runtime schema validation powered by **Zod** (`src/types/`).
- **State Management**: Scalable global stores powered by **Zustand** (`useAppStore`, `useAuthStore`, `useCaptureStore`, `useFilterStore`, `useCrmStore`, `useSettingsStore`).
- **Server State & Caching**: Custom query and mutation hooks using **TanStack React Query**.

### ✅ Phase 1 — Authentication, App Shell & Dashboard
- **Authentication Experience**: Mock sign-in, token storage simulation, session persistence, and logout flow (`src/services/auth.service.ts`).
- **Onboarding Carousel**: Multi-step onboarding guide (`app/onboarding/index.tsx`).
- **App Shell & Navigation**: Fluid bottom tabs with dynamic badge indicators and platform-specific adaptations (`app/(tabs)/_layout.tsx`).
- **Executive Dashboard**:
  - Metric KPI counters: Total Leads, Qualified Leads, Goal Progress, Conversion Rates (`src/repositories/analytics.repository.ts`).
  - Active and upcoming event spotlight with countdowns and venue summaries.
  - Quick action launcher for instant scanning, manual entry, and itinerary lookup.
  - Pull-to-refresh and empty-state error boundaries.

### ✅ Phase 2 — Events, Exhibitors & Floor Experience
- **Event Discovery**: Filterable event directory by industry, city, date, and attendance tier (`app/(tabs)/events.tsx`).
- **Exhibitor Directory & Details**: Full exhibitor catalog with category tags, booth coordinates, team lists, and bookmarking (`app/events/[id].tsx`).
- **Interactive Expo Floor Experience**:
  - Hall switcher and structured SVG-based trade-show grid layout (`src/components/events/expo-floor-visualizer.tsx`).
  - Interactive booth selection with instant bottom sheet modal showing booth number, exhibitor profile, captured leads count, and direct actions.
- **Personal Event Itinerary System**:
  - Day-by-day itinerary timeline with time-slot management (`src/components/events/personal-itinerary-timeline.tsx`).
  - Automatic **conflict detection** highlighting overlapping meetings and speaker sessions.
  - Add, edit, delete, and reorder itinerary items with local repository persistence.

### ✅ Phase 3 — Leads, Card Capture, OCR & Qualification
- **Leads Directory & Search**:
  - Lead filtering by temperature (`Hot`, `Warm`, `Cold`), intent (`Buying`, `Partnership`, `Information`, `Follow-up`), company, and follow-up status (`src/components/leads/lead-filter-sheet.tsx`).
  - Lead cards with composite scoring badges, attendee avatars, and status badges (`src/components/leads/lead-card.tsx`).
  - Lead profile screen with audit activity logs and note streams (`app/leads/[id].tsx`).
- **Business Card Capture Experience**:
  - Camera view with frame reticle, flash toggle, and capture controls using **Expo Camera** (`src/components/leads/business-card-camera.tsx`).
  - Processing overlay with scan animations.
- **OCR Engine (Simulated Interface)**:
  - Mocked cloud vision OCR interface returning structured `LeadDraft` models (`src/services/ocr/ocr.types.ts`).
  - Designed with clean adapter boundaries ready to plug into Google Cloud Vision, AWS Textract, or an AI vision model.
- **Final Lead Qualification & Review Screen**:
  - **`CONTACT`**: Editable name, job title, company, email, phone, address, website, and raw OCR text stream toggle.
  - **`QUALIFICATION`**: Single-tap Temperature selector, Intent tags, Priority selection, and live composite score computation.
  - **`EVENT`**: Event name, hall quick-chips, booth number, assigned sales rep carousel, and follow-up due date presets.
  - **`NOTES`**: Rapid note tag shortcuts (`+ Active RFP`, `+ Decision Maker`, etc.) and multiline takeaways.
  - **`ATTACHMENTS`**: Front card scan preview with zoom modal, voice notes, and photo attachments.
  - **`SAVE LEAD`**: Repository commit, activity audit creation, and dashboard KPI synchronization.
  - **Lead Confirmation State**: Post-save verification summary card with direct routes to view lead or scan next.
- **Audio & Media Attachments**:
  - Voice memo recording and playback with duration tracking and waveform visualization powered by **Expo Audio** (`src/components/leads/voice-note-player.tsx`, `src/hooks/use-audio-recorder.ts`).
  - Additional photo attachments captured via camera or selected from photo library using **Expo Image Picker** (`src/components/leads/lead-photo-attachment-manager.tsx`).

### ✅ Phase 4 — Team, Analytics, CRM & Profile
- **Team Management & Routing**:
  - Team roster screen with member roles, active statuses, captured leads count, hot leads, and meeting metrics (`app/profile/team.tsx`).
  - Team Member Detail screen with profile details, role permissions, activity history, assigned leads, and event telemetry (`app/profile/team-detail.tsx`).
  - **Assign Lead Flow**: Reusable bottom-sheet modal with member search, instant selection, lead update commit, and audit activity event generation (`src/components/leads/lead-assignment-modal.tsx`).
- **Analytics & Event Intelligence**:
  - Analytics Overview, Event Analytics, Team Performance, and Lead Performance views with time filters (`Today`, `7 Days`, `Event`, `All Events`) (`app/(tabs)/analytics.tsx`).
  - KPIs: Total Leads, Hot Leads, Warm Leads, Cold Leads, Meetings, Follow-ups, Conversion Rate.
  - Native React Native SVG chart visualizers: Lead volume over time, temperature distribution, industry breakdown, booth traffic, and team activity. All calculations execute in a dedicated analytics service (`src/services/analytics.service.ts`).
- **Event ROI Analytics**:
  - Dedicated financial ROI calculator with testable pure service calculations (`app/analytics/roi.tsx`).
  - Cost inputs: Event cost, travel cost, booth cost, marketing cost, staff cost, and other expenses.
  - Metrics: Total event cost, leads, qualified leads, hot leads, meetings, Cost Per Lead (CPL), Cost Per Qualified Lead (CPQL), estimated revenue, and estimated ROI.
  - Funnel analysis, revenue summary, and strict visual separation between actual costs and estimated projections.
- **CRM Integration Interface**:
  - **CRM Cards**: **Salesforce**, **HubSpot**, **Microsoft Dynamics**, and **Custom API** (`app/profile/crm.tsx`).
  - Lifecycle: Mock connection, connect action, connected state display, and disconnect action.
  - No real API credentials requested; operates with an explicit mock sandbox notice.
  - Real-time sync simulation with progress bar, log streams, handshake verification ("Test Link"), and field mapping preview.
- **Data Export Service & Hub**:
  - Export actions supporting **CSV** (RFC 4180), **XLSX** (XML SpreadsheetML), and **JSON** (`app/leads/export.tsx`).
  - Implements typed `IExportService` (`src/services/export/export.service.ts`).
  - Scope selection: Operates on all event leads or selected leads with an interactive search/checkbox selector.
  - Telemetry: Real-time progress bar (0%–100%), success state with file metadata and monospace preview, clipboard copying, sharing, and failure state with retry handling and QA failure simulation toggle.
- **Complete Profile Ecosystem**:
  - **My Profile** (`app/profile/me.tsx`): Attendee credentials, avatar, bio, contact channels, booth accreditation, and public profile link.
  - **Company** (`app/profile/company.tsx`): Exhibitor profile, booth location, team seats (18 seats), brand links, and editing modal.
  - **Digital Business Card** (`app/profile/card.tsx` & `src/components/profile/digital-business-card.tsx`): Interactive 3D flip card with photo, name, title, company, phone, email, website, social links (LinkedIn, X, GitHub), NFC badge, and 4 theme styles.
  - **QR Profile** (`app/profile/qr.tsx` & `src/utils/qr-generator.ts`): Real 25×25 SVG QR matrix generator encoding public profile URL (`https://expodiaries.app/p/{slug}`) with vCard 3.0 toggle.
  - **Notifications** (`app/profile/notifications.tsx`): Lead capture alerts, hot lead priority alerts, team assignment pings, sync reports, and quiet hours.
  - **Privacy** (`app/profile/privacy.tsx`): Public discovery, biometric export verification, and token revocation dialogs.
  - **Appearance** (`app/profile/appearance.tsx`): Theme mode (system/light/dark), density (comfortable/compact), accent colors, and typography controls.
  - **Data & Storage** (`app/profile/data.tsx`): Storage footprint breakdown, SQLite backup export, and cache purge controls.
  - **Account** (`app/profile/account.tsx`): Identity, change password modal, active device sessions, sign out, and two-step account deletion confirmation.
  - **Edit Profile** (`app/profile/edit.tsx`): Full editing of attendee and contact fields.

---

## 8. Current Phase 5 Work & Remaining Tasks

### 🛠️ Phase 5 — Production Readiness + Final QA (In Progress)

#### Completed Phase 5 Items
- [x] **Strict TypeScript Compilation**: Clean typecheck with zero errors across the entire codebase (`npx tsc --noEmit`).
- [x] **ESLint Code Quality**: Clean lint checks with zero errors and zero warnings (`npx expo lint`).
- [x] **Clean Architecture & Separation of Concerns**: UI, global stores, repositories, services, and integration boundaries strictly separated.
- [x] **Controlled Service Layer**: All network and data transactions pass through typed facades without client-side hardcoded production secrets.
- [x] **Zod Schema Contracts**: Comprehensive runtime validation across all entities, inputs, and integration payloads.
- [x] **Destructive Action Safety**: Standardized confirmation dialogs for high-risk actions (account deletion, session revocation, database purge, CRM disconnect).
- [x] **Core Feedback States**: Error banners, retry handlers, loading skeletons, and empty state fallbacks implemented.
- [x] **Interactive Micro-Animations**: Reanimated 4 transitions, 3D flip cards, and progress bar indicators.

#### Currently In Progress Items
- [ ] **UI/UX refinement and final visual polish**: Spacing scales, typography hierarchies, card elevations, color contrast, and design harmony across all views.
- [ ] **Responsive layout refinement**: Layout adaptations across diverse phone dimensions, notches/islands, foldables, and tablet split-views.
- [ ] **Animations and micro-interactions refinement**: Tuning transition curves, spring physics, sheet drag gestures, scan reticles, and 3D card perspective flips.
- [ ] **Accessibility improvements**: Full audit for `aria-label`, `accessibilityRole`, tap target sizing (&ge;44pt), and high-contrast compliance.
- [ ] **Performance optimization**: Virtualization profiling for large lead/exhibitor lists, memory hygiene, and re-render prevention.
- [ ] **Error/loading/empty state improvements**: Unifying placeholder skeletons, retry buttons, and contextual empty illustrations across all views.
- [ ] **Cross-device QA**: Systematic testing across Android and iOS emulators and physical devices.
- [ ] **Android/iOS testing**: Platform-specific verification for hardware back navigation, native safe areas, and platform gestures.
- [ ] **Production API preparation/integration**: Refining API adapters, endpoints, and interceptors for live backend hookup.
- [ ] **Secure authentication/token handling**: Preparing hardware-backed session persistence and token refresh lifecycle.
- [ ] **Offline/local persistence improvements**: Planning background sync queue with conflict resolution for low-connectivity expo halls.
- [ ] **EAS/build configuration**: Preparing `eas.json` build profiles, native config plugins, and Continuous Native Generation (CNG) pipeline.
- [ ] **Final release preparation**: App store metadata, permissions descriptions, app icons, and splash screens.

#### Remaining Phase 5 Items
- [ ] **Live Backend Deployment**: Connecting live production REST/GraphQL services and persistent cloud database.
- [ ] **Production OAuth Credentials**: Provisioning production developer keys for Salesforce, HubSpot, and cloud OCR APIs.
- [ ] **Final Physical Device QA**: Comprehensive end-to-end regression testing on physical iOS and Android test devices.
- [ ] **Store Submissions**: Generating distribution builds, signing certificates, and submitting to Apple App Store & Google Play Store.

---

## 9. Tech Stack

| Technology | Purpose | Version |
| :--- | :--- | :--- |
| **Expo** | Mobile Application Framework & Native Tooling | `~57.0.26` (SDK 57) |
| **React Native** | Core Mobile Runtime | `0.86.3` |
| **React** | Component Engine | `19.2.3` (React Compiler enabled) |
| **Expo Router** | Type-Safe File-Based Routing | `~57.0.24` |
| **TypeScript** | Static Typing & Interface Contracts | `~6.0.3` |
| **NativeWind & Tailwind** | Utility-First Styling System | NativeWind `4.2.7`, Tailwind `3.4.17` |
| **Zustand** | Client State Management | `^5.0.15` |
| **TanStack React Query** | Asynchronous Server State & Cache Management | `^5.104.1` |
| **Zod** | Schema Definition & Runtime Validation | `^4.6.5` |
| **React Native Reanimated** | Micro-Animations & Gestures | `4.5.1` |
| **React Native SVG** | Native Vector Floor Plans, Charts & QR Code Rendering | `15.15.4` |
| **Expo Camera** | Native Camera Hardware & Card Scanning Reticle | `~57.0.6` |
| **Expo Audio** | Native Audio Recording & Playback | `~57.0.5` |
| **Expo Image Picker** | Collateral & Photo Attachment Selection | `~57.0.20` |
| **Lucide React Native** | Clean, Consistent Iconography | `^1.51.0` |

---

## 10. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Expo Router Screens                           │
│  app/(tabs)/*  •  app/leads/*  •  app/events/*  •  app/profile/*       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                      Domain & UI Components Layer                      │
│   Leads UI • Floor Visualizer • Itinerary • Digital Card • SVG Charts  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                     Hooks & State Management Layer                     │
│   useLeads • useEvents • useAnalytics • useTeam • Zustand Stores       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                         Service Layer (Facade)                         │
│   LeadsService • EventsService • AnalyticsService • Crm • Export       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Repository Contracts & Adapters                     │
│   ILeadsRepo • IEventsRepo • IAnalyticsRepo • ITeamRepo • ICrmService  │
└─────────────────────┬────────────────────────────────────┬─────────────┘
                      │ (Current Mock Engine)              │ (Future API)
┌─────────────────────▼──────────────┐  ┌──────────────────▼─────────────┐
│  In-Memory Mock Data & Latency Sim │  │ Production REST / GraphQL API  │
│  Zod Validated Entity Collections  │  │ PostgreSQL / Supabase Backend  │
└────────────────────────────────────┘  └────────────────────────────────┘
```

The application adheres to clean architecture principles:
1. **Separation of Concerns**: Screens in `app/` are lightweight containers that delegate presentation to `src/components/` and business logic to `src/services/`.
2. **Interface Contracts**: Repositories and integration services expose explicit TypeScript interfaces (`ILeadsRepository`, `ITeamRepository`, `ICrmIntegrationService`, `IExportService`), ensuring zero-friction backend hookup.
3. **No Hardcoded Client Secrets**: All CRM and authentication flows operate through controlled interfaces; production secrets are never placed in the client bundle.
4. **Optimistic Updates**: Global stores and React Query mutations update local UI state immediately to feel instantaneous on the show floor.

---

## 11. Folder Structure

```text
expo-diaries/
├── app/                              # Expo Router file-based screens
│   ├── (auth)/                       # Sign-in & authentication routes
│   ├── (tabs)/                       # Main bottom-tab navigators
│   │   ├── _layout.tsx               # Tab bar layout & icons
│   │   ├── index.tsx                 # Dashboard screen
│   │   ├── leads.tsx                 # Leads directory screen
│   │   ├── events.tsx                # Events exploration screen
│   │   ├── capture.tsx               # Tab capture launcher screen
│   │   ├── analytics.tsx             # Analytics & KPI overview screen
│   │   └── profile.tsx               # Profile ecosystem hub
│   ├── analytics/                    # Advanced reports & ROI calculator
│   │   ├── reports.tsx               # Detailed analytics reports
│   │   └── roi.tsx                   # Event ROI analytics calculator
│   ├── capture/                      # Full-bleed business card scanner
│   ├── events/                       # Event details, itinerary, & floor map
│   ├── leads/                        # Lead profile details & multi-format export
│   │   ├── [id].tsx                  # Lead detail & audit history
│   │   └── export.tsx                # CSV, XLSX, JSON export hub
│   ├── profile/                      # Complete profile ecosystem screens
│   │   ├── me.tsx                    # Personal profile details
│   │   ├── company.tsx               # Company & exhibitor profile
│   │   ├── card.tsx                  # Digital business card preview
│   │   ├── qr.tsx                    # Public profile QR pass
│   │   ├── notifications.tsx         # Notification preferences
│   │   ├── privacy.tsx               # Privacy & security controls
│   │   ├── appearance.tsx            # Theme & visual density
│   │   ├── data.tsx                  # Storage & backup management
│   │   ├── account.tsx               # Account & danger zone actions
│   │   ├── edit.tsx                  # Profile information editor
│   │   ├── team.tsx                  # Team roster & member status
│   │   ├── team-detail.tsx           # Team member detail & assignments
│   │   ├── crm.tsx                   # Salesforce, HubSpot, Dynamics, Custom API
│   │   ├── settings.tsx              # Hardware & capture defaults
│   │   └── security.tsx              # Offline vault & encryption
│   └── _layout.tsx                   # Root layout, theme, and query providers
├── assets/                           # Static assets, fonts, and app icons
├── src/
│   ├── api/                          # HTTP client and interceptors
│   ├── components/
│   │   ├── charts/                   # Native SVG chart visualizers
│   │   ├── events/                   # Floor visualizer, itinerary timeline
│   │   ├── layout/                   # ScreenContainer, AppHeader, ResponsiveGrid
│   │   ├── leads/                    # Camera scanner, lead review, filters, assign modal
│   │   ├── profile/                  # Digital business card, QR modal
│   │   └── ui/                       # Atomic design system components
│   ├── constants/                    # Application routes, keys, and configurations
│   ├── hooks/                        # Custom hooks (useLeads, useEvents, useAnalytics, useTeam)
│   ├── lib/                          # API client abstraction with latency simulation
│   ├── repositories/                 # Data access layer & mock implementations
│   │   ├── mocks/                    # Mock fixtures (leads, events, team, analytics)
│   │   ├── analytics.repository.ts   # Metric tracking & KPI repository
│   │   ├── events.repository.ts      # Events, exhibitors, and itinerary repository
│   │   ├── leads.repository.ts       # Lead capture & attachment repository
│   │   └── team.repository.ts        # Team roster & lead routing repository
│   ├── services/                     # Domain services (analytics, CRM, export, OCR, team)
│   ├── stores/                       # Zustand stores (app, auth, capture, CRM, settings)
│   ├── theme/                        # Colors, typography, spacing, radius tokens
│   ├── types/                        # Zod schemas and TypeScript models
│   └── utils/                        # QR matrix generator and calculation utilities
├── app.json                          # Expo project configuration
├── package.json                      # Dependencies and scripts
├── tailwind.config.js                # Tailwind CSS / NativeWind styling tokens
└── tsconfig.json                     # TypeScript strict configuration
```

---

## 12. Installation

### Prerequisites
- **Node.js**: `v18.x` or later (LTS recommended)
- **Package Manager**: `npm` or `bun`
- **Expo CLI**: Installed automatically via `npx expo`
- **Expo Go App** (optional): Installed on your iOS or Android physical device for live testing

### Step-by-Step Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/AyaanAli73/ExpoDiaries-React-Native-Clone.git
   cd ExpoDiaries-React-Native-Clone
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify project dependencies**:
   ```bash
   npx expo-doctor
   ```

---

## 13. Running Locally

Start the Expo development server:

```bash
npx expo start
```

### Options & Emulators
- **Web**: Press `w` in your terminal, or run `npm run web` (runs on `http://localhost:8081`).
- **iOS Simulator**: Press `i` in your terminal, or run `npm run ios` (macOS with Xcode required).
- **Android Emulator**: Press `a` in your terminal, or run `npm run android` (Android Studio required).
- **Physical Device**: Open the **Expo Go** app on iOS or Android and scan the terminal QR code.

---

## 14. Development Workflow

Maintain code quality and type safety before committing any changes:

```bash
# Typecheck all TypeScript files
npx tsc --noEmit

# Run ESLint rules
npx expo lint

# Diagnose dependency compatibility
npx expo-doctor
```

---

## 15. Current Limitations

To maintain complete transparency regarding current implementation status:
1. **OCR Engine**: Business card OCR currently uses a deterministic simulation engine (`src/services/ocr/ocr.types.ts`). While it mimics real recognition confidence, field parsing, and network delays, it is not connected to a live cloud vision API.
2. **Persistence**: Leads, itinerary items, and attachments are persisted in memory and local repository state with simulated latency. They reset upon full app bundle reload.
3. **Backend & Live APIs**: Remote server integration, live CRM OAuth exchanges, and persistent cloud databases are mocked through client-side service contracts.
4. **Production Readiness**: The application is **not yet production-ready** and is **not 100% complete**. Phase 5 production-readiness work (UI polish, cross-device QA, accessibility compliance, performance profiling, build configuration) is actively in progress.

---

## 16. Future Integrations

- **Cloud Vision APIs**: Direct integration with Google Cloud Vision, AWS Textract, or OpenAI GPT-4o Vision for real-time multilingual card extraction.
- **Enterprise CRM Connectors**: Direct two-way sync pipelines into Salesforce, HubSpot, Microsoft Dynamics, and custom webhooks.
- **Speech-to-Text Transcription**: Automatic audio-to-text transcription of voice memos using OpenAI Whisper or Google Cloud Speech-to-Text.
- **Backend Infrastructure**: Production backend integration with Supabase, PostgreSQL, or GraphQL with real-time WebSocket event updates.

---

## 17. GitHub Contribution & Development Notes

- **Branching Strategy**: Use feature branches (`feature/team-routing`, `fix/audio-waveform`) branching off `main`.
- **Commit Convention**: Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- **Native Directories**: `ios/` and `android/` directories are intentionally excluded from version control under **Continuous Native Generation (CNG)**. Do not manually edit native folders; configure native capabilities via `app.json` plugins.
- **Pre-Commit Checks**: Ensure `npx tsc --noEmit` and `npx expo lint` return zero errors before opening a pull request.

---

## 18. Disclaimer

> This project is a UI and functionality demonstration created for learning, development practice, and portfolio purposes. It is an independent project inspired by trade-show companion applications and ExpoDiaries workflows. It is not the official ExpoDiaries application and is not affiliated with, endorsed by, or sponsored by ExpoDiaries or any related organization.
