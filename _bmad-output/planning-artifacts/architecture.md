---
stepsCompleted: ["step-01-init", "step-02-context", "step-03-starter", "step-04-decisions", "step-05-patterns", "step-06-structure", "step-07-validation", "step-08-complete"]
status: complete
completedAt: "2026-05-07"
inputDocuments: ["_bmad-output/planning-artifacts/prd.md", "_bmad-output/planning-artifacts/product-brief-Hackathon.md"]
workflowType: 'architecture'
project_name: 'PinDrop'
user_name: 'Melinda.deac'
date: '2026-05-07'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
27 FRs across 6 capability areas: Photo Upload (FR1–FR4), Location Extraction (FR5–FR8), Map Display (FR9–FR13), Photo Discovery (FR14–FR18), Unlocated Photos (FR19–FR23), Data & Access (FR24–FR27). The critical path is: file input → client-side EXIF → branch (GPS: upload + pin | no GPS: unlocated queue). Secondary flow: manual pin via inline map picker on the unlocated page.

**Non-Functional Requirements:**
16 NFRs governing: upload-to-pin ≤10s (NFR1), EXIF parse ≤1s (NFR2), upload ≤5s (NFR3), map load ≤3s (NFR4), non-blocking upload (NFR6), client-side-only GPS processing (NFR10), anonymous/no PII (NFR9), Supabase free tier headroom (NFR16).

**Scale & Complexity:**
- Primary domain: Full-stack web SPA + BaaS (no custom API server)
- Complexity level: Medium — multi-layer integration, no auth, no SSR, no regulatory constraints
- Estimated architectural components: ~10 (map, upload, EXIF service, Supabase client, gallery modal, unlocated page + inline map picker, polling service, DB schema, storage config)

### Technical Constraints & Dependencies

- Client-side GPS extraction is non-negotiable (NFR10) — `exifr` must run before any network call
- Supabase free tier must not be breached during demo (NFR16) — pre-demo quota check required
- CORS between Vercel (frontend) and Supabase (backend) must be configured before Hour 1 ends
- No custom backend server — all data operations via Supabase JS client
- 500-pin cap is a hard performance safeguard (FR12)
- Env vars (Supabase URL + anon key) must never be in source control (NFR7)

### Cross-Cutting Concerns Identified

1. **Error handling** — three distinct failure paths: EXIF parse failure, upload network error, Supabase timeout; each must surface a user-facing message (NFR12, NFR13)
2. **Async state management** — upload progress, 30s polling cycle, optimistic pin addition after upload; risk of race condition between local state and polling refresh
3. **RLS policy design** — anonymous inserts allowed, but arbitrary updates/deletes blocked; Supabase Row Level Security must be configured intentionally
4. **File validation** — 10MB cap (FR4) and format detection must happen before EXIF attempt
5. **CORS configuration** — Vercel production domain must be in Supabase allowed origins

## Starter Template

### Selected Starter: create-vite (react-ts template)

**Rationale:** Canonical React + TypeScript Vite scaffold. Zero-config SPA, fast dev server, no SSR overhead, Vercel-compatible build output. Matches all PRD technical constraints.

**Initialization Command:**

```bash
npm create vite@latest pindrop -- --template react-ts
cd pindrop
npm install
npm install react-leaflet leaflet exifr @supabase/supabase-js react-router-dom
npm install -D @types/leaflet
```

**Architectural Decisions Provided by Starter:**

- Language: TypeScript strict mode
- Build: Vite + SWC (fast HMR, ESBuild production bundle)
- Styling: CSS modules (no opinionated UI framework)
- Linting: ESLint with React + TypeScript rules
- Env vars: `VITE_*` prefix pattern — aligns with NFR7
- Entry: `src/main.tsx` → `src/App.tsx`

**Note:** Project initialization is the first implementation story.

## Core Architectural Decisions

### Data Architecture

**Database:** Supabase Postgres, single `photos` table. No ORM — direct Supabase JS client queries.

**Schema:**

```sql
create table photos (
  id uuid default gen_random_uuid() primary key,
  file_url text not null,
  lat double precision,           -- null = unlocated (no GPS)
  lng double precision,           -- null = unlocated (no GPS)
  is_manually_pinned boolean default false,
  created_at timestamptz default now()
);
```

**Storage:** Supabase Storage, bucket `photos`, public read, 10MB file size limit enforced client-side before upload.

### Authentication & Security

- No authentication. Anonymous access for all read and write operations.
- **RLS policies:**
  - `SELECT`: open to `anon` role
  - `INSERT`: open to `anon` role
  - `UPDATE` / `DELETE`: blocked (no policy = denied)
- Env vars: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env` (never committed — covered by `.gitignore`)

### API & Communication

- No custom backend server. All data operations via `@supabase/supabase-js` client.
- Supabase Storage SDK for file upload; Supabase DB SDK for record insert and query.
- **Upload flow:** `File` → `exifr.gps()` → branch:
  - GPS present → `supabase.storage.upload()` → `supabase.from('photos').insert()` → trigger map refresh
  - GPS absent → route to `/unlocated` (no upload at this stage)
- **Map data fetch:** `supabase.from('photos').select().not('lat','is',null).order('created_at',{ascending:false}).limit(500)`

### Frontend Architecture

- **State:** React `useState` + `useEffect` only. No Redux or Zustand (PRD explicitly excludes them).
- **Routing:** `react-router-dom` v6, declarative `<Routes>`: `/` → `MapPage`, `/unlocated` → `UnlocatedPage`
- **Map:** `react-leaflet` with OpenStreetMap tiles; pins as `<Marker>` components; `<Popup>` not used — gallery modal used instead
- **Polling:** `setInterval` in `useEffect` with `clearInterval` cleanup on unmount; 30s interval
- **Gallery/detail state:** Controlled in `MapView` — `selectedPin: Photo[] | null` → `selectedPhoto: Photo | null` two-level drill-down
- **Modal pattern:** `PinGallery` and `PhotoDetail` are conditionally rendered overlays; `ManualPinPicker` is conditionally rendered within `UnlocatedPage`

### Infrastructure & Deployment

- **Frontend:** Vercel — auto-detects Vite build (`dist/`); add `vercel.json` for SPA route fallback
- **Backend:** Supabase — managed BaaS, no DevOps required
- **`vercel.json`:**
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **Pre-flight checklist:** CORS config in Supabase dashboard (add Vercel domain), Supabase free tier quota check, env vars distributed to both devs before Hour 1

## Implementation Patterns & Consistency Rules

### Naming Conventions

| Context | Convention | Example |
|---|---|---|
| DB tables | `snake_case` plural | `photos` |
| DB columns | `snake_case` | `file_url`, `is_manually_pinned`, `created_at` |
| React components | `PascalCase.tsx` | `MapView.tsx`, `PinGallery.tsx` |
| Utility / lib files | `camelCase.ts` | `supabase.ts`, `exif.ts` |
| React hooks | `use` prefix, `camelCase` | `usePhotos.ts` |
| CSS module classes | `camelCase` | `styles.mapContainer` |
| Env vars | `VITE_` prefix, `SCREAMING_SNAKE_CASE` | `VITE_SUPABASE_URL` |
| TypeScript interfaces | `PascalCase`, no `I` prefix | `Photo`, `UploadResult` |

**Frontend ↔ DB field mapping:** DB uses `snake_case`; TypeScript interfaces use `camelCase`. Map at the service boundary in `lib/supabase.ts` — no component accesses raw DB field names.

### Error Handling Patterns

Three distinct failure paths — each surfaces a user-facing inline message, never silent:

1. **EXIF parse failure** → graceful fallback: route photo to `/unlocated` (NFR13). No error shown to user.
2. **Upload network error** → inline error message in `UploadZone` (NFR12). Retry CTA optional.
3. **Supabase timeout** → inline error message in `UploadZone` (NFR12).

No global error boundary needed for POC scope. No `console.error` without a paired user-visible message.

### Async & Loading State Patterns

- Each component owns its loading state: `const [loading, setLoading] = useState(false)`
- Upload is non-blocking — fire upload, immediately re-enable UI (NFR6). Show subtle progress indicator, not a blocking spinner.
- Polling refresh replaces map state silently — no loading spinner during the 30s poll cycle (NFR5).
- `usePhotos` hook returns `{ photos, loading, error }` — consumers decide how to render each state.

### Data Format Patterns

- Null `lat`/`lng` = unlocated. Never use sentinel values (e.g. `0, 0`).
- Booleans: `true`/`false` (never `1`/`0`).
- Timestamps: ISO 8601 strings from Supabase (`timestamptz`) — display using `Date` constructor.
- File URLs: full public Supabase Storage URL stored in `file_url` — no path reconstruction at read time.

### All AI Agents MUST

- Import Supabase only from `lib/supabase.ts` — never `createClient` directly in a component
- Import exifr only through `lib/exif.ts` — never raw `exifr` import in a component
- Use `usePhotos` hook for all pin data fetching — never query `photos` table directly from a component
- Check file size (≤10MB) before any EXIF extraction or upload attempt
- Never store `lat: 0, lng: 0` — use `null` for unlocated photos

## Project Structure & Boundaries

### Complete Project Directory Structure

```
pindrop/
├── .env                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (never committed)
├── .env.example                  # Placeholder values only — committed to repo
├── .gitignore                    # includes .env
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
├── vercel.json                   # SPA fallback: all routes → index.html
└── src/
    ├── main.tsx                  # ReactDOM.createRoot, BrowserRouter, Leaflet CSS import
    ├── App.tsx                   # <Routes>: / → MapPage, /unlocated → UnlocatedPage
    ├── types/
    │   └── photo.ts              # Photo interface: { id, fileUrl, lat, lng, isManuallyPinned, createdAt }
    ├── lib/
    │   ├── supabase.ts           # createClient(); export typed supabase instance
    │   └── exif.ts               # extractGPS(file: File): Promise<{lat: number, lng: number} | null>
    ├── hooks/
    │   └── usePhotos.ts          # fetchPhotos(); 30s polling; returns { photos: Photo[], loading, error }
    ├── components/
    │   ├── MapView.tsx           # Leaflet map + Marker pins + selectedPin/selectedPhoto state
    │   ├── UploadZone.tsx        # Drag-and-drop + file picker + disclosure notice + upload orchestration
    │   ├── PinGallery.tsx        # Modal: photo grid for a pin; props: photos, onSelect, onClose
    │   ├── PhotoDetail.tsx       # Modal: single photo full view; props: photo, onBack, onClose
    │   └── ManualPinPicker.tsx   # Leaflet click-to-place map; props: photo, onSave, onCancel
    └── pages/
        ├── MapPage.tsx           # Route /: composes MapView + UploadZone
        └── UnlocatedPage.tsx     # Route /unlocated: lists unlocated photos; triggers ManualPinPicker
```

### Requirements → Structure Mapping

| FR Group | Component / Module |
|---|---|
| FR1–FR4 Photo Upload | `components/UploadZone.tsx` |
| FR5–FR8 Location Extraction | `lib/exif.ts` + `UploadZone.tsx` |
| FR9–FR13 Map Display | `components/MapView.tsx` + `hooks/usePhotos.ts` |
| FR14–FR18 Photo Discovery | `components/PinGallery.tsx` + `components/PhotoDetail.tsx` (state in `MapView`) |
| FR19–FR23 Unlocated Photos | `pages/UnlocatedPage.tsx` + `components/ManualPinPicker.tsx` |
| FR24–FR27 Data & Access | `lib/supabase.ts` + `App.tsx` routes |

### Integration Boundaries

- `lib/supabase.ts` is the **sole interface** to Supabase — no component imports `supabase-js` directly
- `lib/exif.ts` is the **sole interface** to `exifr` — wraps and normalises the GPS result
- `hooks/usePhotos.ts` **owns all polling and photo-list state** — components receive `Photo[]` only
- `ManualPinPicker` is **self-contained** — receives a photo, emits a `{lat, lng}` on save, calls `supabase.ts` internally

### Data Flow

```
User selects file(s)
  → UploadZone: validate size (≤10MB)
  → lib/exif.ts: extractGPS(file)
    → GPS found: UploadZone → lib/supabase.ts: upload file → insert photo record → usePhotos refetch
    → GPS null:  UploadZone → navigate('/unlocated')

User on /unlocated clicks "Pin manually"
  → UnlocatedPage renders ManualPinPicker
  → User clicks map → ManualPinPicker emits {lat, lng}
  → lib/supabase.ts: upload file + insert photo with lat/lng + is_manually_pinned=true
  → navigate('/') → pin appears on map at next poll

usePhotos (30s setInterval)
  → lib/supabase.ts: SELECT * FROM photos WHERE lat IS NOT NULL ORDER BY created_at DESC LIMIT 500
  → MapView re-renders Marker components
```

## Architecture Validation Results

### Coherence Validation ✅

All technology choices are compatible. React-Leaflet requires Leaflet CSS to be imported in `main.tsx` (`import 'leaflet/dist/leaflet.css'`) — the only known setup requirement outside the scaffold. All versions interoperate: React 18, react-leaflet 4+, Supabase JS v2+, React Router v6+, exifr 7+.

### Requirements Coverage Validation ✅

All 27 FRs are mapped to specific components/modules. All 16 NFRs are addressed:
- Performance (NFR1–NFR6): 500-pin cap + polling interval + non-blocking upload flow
- Security (NFR7–NFR10): env vars pattern + RLS + client-side EXIF + anonymous-only
- Reliability (NFR11–NFR13): three distinct error paths, no silent failures
- Integration (NFR14–NFR16): exifr for JPEG/HEIC, OSM tiles best-effort, Supabase quota pre-check

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (medium, SPA + BaaS)
- [x] Technical constraints identified (client-side EXIF, no auth, free tier, CORS)
- [x] Cross-cutting concerns mapped (error handling, polling, RLS, file validation)

**Architectural Decisions**
- [x] Critical decisions documented (DB schema, RLS policies, no-backend-server, env vars)
- [x] Technology stack fully specified with initialization commands
- [x] Integration patterns defined (supabase.ts + exif.ts as sole interfaces)
- [x] Performance considerations addressed (500-pin cap, non-blocking upload, silent polling)

**Implementation Patterns**
- [x] Naming conventions established (DB, components, hooks, env vars, types)
- [x] Structure patterns defined (feature → file mapping, integration boundaries)
- [x] Communication patterns specified (data flow documented end-to-end)
- [x] Process patterns documented (error handling, loading state, async upload)

**Project Structure**
- [x] Complete directory structure defined (file-level detail)
- [x] Component boundaries established (lib/* as sole external interfaces)
- [x] Integration points mapped (Vercel ↔ Supabase CORS, env var flow, RLS)
- [x] Requirements to structure mapping complete (all 6 FR groups mapped)

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**
**Confidence Level: High**

**Key Strengths:**
- Single-table data model keeps Supabase setup to under 30 minutes
- lib/* boundary pattern prevents import sprawl as codebase grows
- All three error paths explicitly defined — no silent failures possible
- Data flow documented end-to-end — two devs can work in parallel without ambiguity

**First Implementation Priority:**
```bash
npm create vite@latest pindrop -- --template react-ts
```
