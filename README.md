# ExpoDiaries — React Native Mobile Clone

> A high-performance, mobile-first trade show companion and on-floor lead management application built with **Expo SDK 57**, **React Native 0.86**, **Expo Router**, **NativeWind**, and **TypeScript**.

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/NativeWind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://nativewind.dev)
[![Build Status](https://img.shields.io/badge/TypeScript-Passing-22c55e?style=for-the-badge)]()
[![Lint Status](https://img.shields.io/badge/Lint-Clean-22c55e?style=for-the-badge)]()

---

## 1. Project Title
**ExpoDiaries — React Native Mobile Clone**

## 2. Short Project Description
ExpoDiaries is an enterprise-grade mobile application designed for trade show attendees, exhibitors, and on-floor sales representatives. It streamlines personal event planning, interactive expo hall floor navigation, instant business-card optical character recognition (OCR), multi-modal lead capture (voice memos and booth collateral photos), qualification workflows, and real-time booth analytics.

## 3. Project Goal
Trade-show exhibition floors are high-pressure, noisy, and fast-paced environments where sales representatives and executives have mere seconds to engage, evaluate, and log prospects. The primary goal of this application is to deliver an ultra-responsive, mobile-optimized experience where:
- Sales professionals can scan a business card, review extracted data, qualify intent, attach voice memos, and log a lead in seconds.
- Attendees can browse hall layouts, pin booths, search exhibitors, and build conflict-free schedules with real-time overlap warnings.
- The UI maintains 60+ FPS fluid animations, instant feedback, and accessible interactions on iOS and Android.

---

## 4. Current Status

```
Overall Progress: [████████████████░░░░░░░░] 67% (4 / 6 Phases Completed)
```

- **Phases Completed**: **Phase 0**, **Phase 1**, **Phase 2**, and **Phase 3**
- **Upcoming Phases**: **Phase 4** (Team & Analytics) and **Phase 5** (Production Readiness & Native Builds)
- **Current Data Layer**: Fully decoupled Repository & Service architecture with realistic mock data simulation, ready for REST/GraphQL/Supabase backend connection.

---

## 5. Phase Progress Table

| Phase | Module Name | Scope & Focus | Status |
| :--- | :--- | :--- | :---: |
| **Phase 0** | **Foundation & Architecture** | Project setup, design system tokens, atomic UI library, mock data layer, type contracts | ✅ **Complete** |
| **Phase 1** | **Auth + App Shell + Dashboard** | Auth flow, onboarding, tab navigation, executive KPI summary, active event tracking | ✅ **Complete** |
| **Phase 2** | **Events + Exhibitors + Floor Experience** | Event discovery, exhibitor profiles, interactive floor visualizer, personal itinerary timeline | ✅ **Complete** |
| **Phase 3** | **Leads + Capture + OCR + Notes** | Camera scanner, simulated OCR, editable lead review, qualification, audio notes, attachments | ✅ **Complete** |
| **Phase 4** | **Team + Analytics + CRM + Profile** | Team roles, lead routing, advanced event ROI analytics, CRM export, vCard digital badge | ⏳ *Remaining* |
| **Phase 5** | **Production Readiness & QA** | Production API sync, SQLite local cache, accessibility compliance, EAS cloud builds | ⏳ *Remaining* |

---

## 6. Completed Features

### ✅ Phase 0 — Foundation & Architecture
- **Enterprise Design System**: Tailored light & dark palette, radius scales, spacing systems, semantic color states (`src/theme/`).
- **Accessible UI Component Library**: 25+ accessible components including `Button`, `Input`, `Badge`, `Card`, `Avatar`, `Chip`, `BottomSheet`, `Modal`, `Toast`, `Skeleton`, and `Divider` (`src/components/ui/`).
- **Typed Service & Repository Pattern**: Complete separation of concerns via TypeScript interfaces (`ILeadsRepository`, `IEventsRepository`, `IAnalyticsRepository`, `ITeamRepository`).
- **Data Validation**: Strict runtime schema validation powered by **Zod** (`src/types/`).
- **State Management**: Scalable global stores powered by **Zustand** (`useAppStore`, `useAuthStore`, `useCaptureStore`, `useFilterStore`).
- **Server State & Caching**: Custom query and mutation hooks using **TanStack React Query**.

### ✅ Phase 1 — Authentication, App Shell & Dashboard
- **Authentication Experience**: Mock sign-in, token storage simulation, session persistence, and logout flow (`src/services/auth.service.ts`).
- **Onboarding Carousel**: Interactive multi-step onboarding guide (`app/onboarding/index.tsx`).
- **App Shell & Responsive Navigation**: Fluid bottom tabs with dynamic badge indicators, platform-specific adaptations (`app/(tabs)/_layout.tsx`).
- **Executive Dashboard**:
  - Live metric KPI counters: Total Leads, Qualified Leads, Goal Progress, Conversion Rates (`src/repositories/analytics.repository.ts`).
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
  - Interactive day-by-day itinerary timeline with time-slot management (`src/components/events/personal-itinerary-timeline.tsx`).
  - Automatic **conflict detection** highlighting overlapping meetings and speaker sessions.
  - Add, edit, delete, and reorder itinerary items with local repository persistence.

### ✅ Phase 3 — Leads, Card Capture, OCR & Qualification
- **Leads Directory & Search**:
  - Lead filtering by temperature (`Hot`, `Warm`, `Cold`), intent (`Buying`, `Partnership`, `Information`, `Follow-up`), company, and follow-up status (`src/components/leads/lead-filter-sheet.tsx`).
  - Lead cards with composite scoring badges, attendee avatars, and status badges (`src/components/leads/lead-card.tsx`).
  - Lead profile screen with audit activity logs and note streams (`app/leads/[id].tsx`).
- **Business Card Capture Experience**:
  - Production-grade camera view with frame reticle, flash toggle, and capture controls using **Expo Camera** (`src/components/leads/business-card-camera.tsx`).
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
  - **`SAVE LEAD`**: Instant repository commit, activity audit creation, and dashboard KPI synchronization.
  - **Lead Confirmation State**: Post-save verification summary card with direct routes to view lead or scan next.
- **Audio & Media Attachments**:
  - Voice memo recording and playback with duration tracking and waveform visualization powered by **Expo Audio** (`src/components/leads/voice-note-player.tsx`, `src/hooks/use-audio-recorder.ts`).
  - Additional photo attachments captured via camera or selected from photo library using **Expo Image Picker** (`src/components/leads/lead-photo-attachment-manager.tsx`).

---

## 7. Remaining Roadmap

### ⏳ Phase 4 — Team, Analytics, CRM & Profile
- [ ] **Team Management & Routing**: Assign leads to specific booth team members with workload balancing (`src/components/leads/lead-assignment-modal.tsx`).
- [ ] **Advanced Event Analytics**:
  - Comprehensive event ROI calculators, cost-per-lead (CPL) benchmarks, and booth visitor footfall charts (`app/(tabs)/analytics.tsx`).
  - Team performance leaderboard and individual capture statistics.
- [ ] **CRM Integrations**: Webhook and REST API sync triggers for HubSpot, Salesforce, and Zapier.
- [ ] **Data Export Hub**: Export filtered leads into structured CSV, XLSX, and JSON formats (`app/leads/export.tsx`).
- [ ] **Digital Business Card (vCard)**: Personal exhibitor profile with a generated QR code for two-way badge sharing (`app/(tabs)/profile.tsx`).
- [ ] **Settings & Data Privacy**: Configurable notifications, GDPR contact consent toggles, and data purge controls.

### ⏳ Phase 5 — Production Readiness & QA
- [ ] **Production API Integration**: Replace mock simulation clients with production REST / GraphQL backend.
- [ ] **Offline Sync & SQLite Storage**: Background sync engine with conflict resolution for unreliable venue Wi-Fi networks.
- [ ] **Security & Credentials**: Secure hardware key storage via `expo-secure-store` for JWT access and refresh tokens.
- [ ] **Device & Accessibility Testing**: Full audit against Vercel Web Interface Guidelines and Mobile Accessibility (A11y) standards.
- [ ] **EAS Cloud Builds**: Continuous native generation (`CNG`) configuration, signing credentials, and App Store / Google Play distribution via EAS Build.

---

## 8. Tech Stack

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
| **React Native Reanimated** | Smooth 60 FPS Micro-Animations | `4.5.1` |
| **Expo Camera** | Native Camera Hardware & Card Scanning Reticle | `~57.0.6` |
| **Expo Audio** | Native Audio Recording & Playback | `~57.0.5` |
| **Expo Image Picker** | Collateral & Photo Attachment Selection | `~57.0.20` |
| **Lucide React Native** | Clean, Consistent Iconography | `^1.51.0` |

---

## 9. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   Expo Router Screens                  │
│       app/(tabs)/*  •  app/leads/*  •  app/events/*     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              Domain & UI Components Layer               │
│   Leads UI  •  Floor Visualizer  •  Itinerary Timeline │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│             Hooks & State Management Layer              │
│    useLeads • useEvents • useAppStore • React Query    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Service Layer (Facade)                │
│    LeadsService • EventsService • AnalyticsService     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│             Repository Contracts & Adapters             │
│   ILeadsRepository • IEventsRepository • IAnalyticsRepo│
└─────────────┬────────────────────────────┬─────────────┘
              │ (Current)                  │ (Future)
┌─────────────▼──────────────┐  ┌──────────▼─────────────┐
│  Mock Data & Latency Engine│  │ Production REST/GraphQL│
│   In-Memory Synchronized   │  │ PostgreSQL / Supabase  │
└────────────────────────────┘  └────────────────────────┘
```

The application adheres to clean architecture principles:
1. **Separation of Concerns**: Screens in `app/` are lightweight containers that delegate presentation to `src/components/` and business logic to `src/services/`.
2. **Interface Contracts**: Repositories expose explicit TypeScript interfaces (`ILeadsRepository`, `IEventsRepository`), making swapping the mock data layer for a live backend zero-friction.
3. **Optimistic Updates**: React Query mutations update local UI state immediately to feel instantaneous on the show floor.

---

## 10. Folder Structure

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
│   │   ├── analytics.tsx             # Analytics & KPI screen
│   │   └── profile.tsx               # User profile screen
│   ├── capture/                      # Full-bleed business card scanner
│   ├── events/                       # Event details, itinerary, & floor map
│   ├── leads/                        # Lead profile details & export routes
│   └── _layout.tsx                   # Root layout, theme, and query providers
├── assets/                           # Fonts, static images, and app icons
├── src/
│   ├── api/                          # HTTP client and interceptors
│   ├── components/
│   │   ├── events/                   # Floor visualizer, itinerary timeline
│   │   ├── layout/                   # ScreenContainer, AppHeader
│   │   ├── leads/                    # Camera scanner, lead review, filters
│   │   └── ui/                       # Atomic design system components
│   ├── constants/                    # Application routes, keys, and configurations
│   ├── hooks/                        # Custom hooks (useLeads, useEvents, useAudio)
│   ├── lib/                          # API client abstraction with latency simulation
│   ├── repositories/                 # Data access layer & mock implementations
│   │   ├── mocks/                    # Mock trade show fixtures (leads, events, team)
│   │   ├── analytics.repository.ts   # Metric tracking & KPI repository
│   │   ├── events.repository.ts      # Events, exhibitors, and itinerary repository
│   │   └── leads.repository.ts       # Lead capture & attachment repository
│   ├── services/                     # Domain services and OCR facades
│   ├── stores/                       # Zustand store definitions
│   ├── theme/                        # Colors, typography, spacing, radius tokens
│   └── types/                        # Zod schemas and TypeScript models
├── app.json                          # Expo project configuration
├── package.json                      # Dependencies and scripts
├── tailwind.config.js                # Tailwind CSS / NativeWind styling tokens
└── tsconfig.json                     # TypeScript strict configuration
```

---

## 11. Installation

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

## 12. Running Locally

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

## 13. Development Workflow

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

## 14. Current Limitations

To maintain complete transparency regarding current implementation status:
1. **OCR Engine**: Business card OCR currently uses a deterministic, realistic simulation engine (`src/services/ocr/ocr.types.ts`). While it mimics real recognition confidence, field parsing, and network delays, it is not connected to a live cloud vision API.
2. **Persistence**: Leads, itinerary items, and attachments are persisted in memory and local repository state with simulated latency. They reset upon full app bundle reload.
3. **Analytics**: Dashboard KPI counters, progress bars, and conversion rates calculate metrics based on in-memory mock repository transactions.
4. **Export**: The lead export feature produces RFC-4180 compliant CSV text client-side, rather than streaming to a remote cloud file storage bucket.

---

## 15. Future Integrations

- **Cloud Vision APIs**: Direct integration with Google Cloud Vision, AWS Textract, or OpenAI GPT-4o Vision for real-time multilingual card extraction.
- **Enterprise CRM Connectors**: Direct two-way sync pipelines into Salesforce, HubSpot, Zoho CRM, and Pipedrive.
- **Speech-to-Text Transcription**: Automatic audio-to-text transcription of voice memos using OpenAI Whisper or Google Cloud Speech-to-Text.
- **Backend Infrastructure**: Production backend integration with Supabase, PostgreSQL, or GraphQL with real-time WebSocket event updates.

---

## 16. Production Roadmap

```mermaid
gantt
    title ExpoDiaries Roadmap
    dateFormat  YYYY-MM-DD
    section Foundation
    Phase 0: Architecture & Tokens      :done, 2026-09-01, 2026-09-10
    Phase 1: Auth & Shell & Dashboard   :done, 2026-09-11, 2026-09-20
    section Floor Experience
    Phase 2: Events & Floor Visualizer  :done, 2026-09-21, 2026-09-30
    Phase 3: Leads, Camera & OCR Capture:done, 2026-10-01, 2026-10-06
    section Enterprise Polish
    Phase 4: Team, Analytics & CRM Sync :active, 2026-10-07, 2026-10-20
    Phase 5: Production QA & EAS Builds : 2026-10-21, 2026-11-05
```

---

## 17. GitHub Contribution & Development Notes

- **Branching Strategy**: Use feature branches (`feature/team-routing`, `fix/audio-waveform`) branching off `main`.
- **Commit Convention**: Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- **Native Directories**: `ios/` and `android/` directories are intentionally excluded from version control under **Continuous Native Generation (CNG)**. Do not manually edit native folders; configure native capabilities via `app.json` plugins.
- **Pre-Commit Checks**: Ensure `npx tsc --noEmit` and `npx expo lint` return zero errors before opening a pull request.

---

## 18. Disclaimer

> **Notice**: This project is an independent open-source mobile application clone inspired by modern trade show companion apps and ExpoDiaries workflows. It is developed solely for educational, architectural demonstration, and engineering portfolio purposes. It is **not** the official ExpoDiaries application, nor is it affiliated with, endorsed by, or sponsored by any proprietary entity associated with ExpoDiaries.
