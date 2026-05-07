---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
status: complete
completedAt: "2026-05-07"
inputDocuments: ["_bmad-output/planning-artifacts/prd.md", "_bmad-output/planning-artifacts/architecture.md"]
---

# PinDrop - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for PinDrop, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can upload one or more photo files via drag-and-drop
FR2: Users can upload photo files via a file browser selection dialog
FR3: The system displays a location visibility disclosure before completing the upload
FR4: The system accepts photo files up to 10MB per file
FR5: The system extracts GPS coordinates from a photo's EXIF metadata entirely within the browser, without transmitting the file to a server for coordinate parsing
FR6: Photos with valid GPS coordinates are routed to the map pin creation flow
FR7: Photos without GPS coordinates are routed to the Unlocated Photos collection
FR8: When multiple files are uploaded together, each file is processed and routed independently based on GPS presence
FR9: Any visitor can view a global shared map showing pins for all uploaded geotagged photos
FR10: Each pin is rendered at the precise GPS coordinates extracted from its photo
FR11: The map refreshes automatically at a regular interval to show newly uploaded pins without a page reload
FR12: The map limits simultaneously rendered pins to the most recently uploaded (performance cap — 500)
FR13: Users can navigate the map by zooming and panning
FR14: Users can click any map pin to open a gallery showing all photos uploaded from that location
FR15: Users can select a photo from the pin gallery to open a photo detail view
FR16: The photo detail view displays the selected photo at readable size
FR17: Users can dismiss the photo detail view and return to the pin gallery
FR18: Users can dismiss the pin gallery and return to the map
FR19: Users can navigate to a dedicated page listing all photos uploaded without GPS data
FR20: The Unlocated Photos page displays each photo with an explanation of why it has no map pin
FR21: Users can initiate manual location assignment for any photo on the Unlocated Photos page
FR22: Users can select a location on an interactive map picker to assign GPS coordinates to an unlocated photo
FR23: Manually pinned photos are saved with user-provided coordinates and appear on the global map alongside GPS-extracted pins
FR24: Any visitor can browse the map and view photo galleries without creating an account
FR25: Any visitor can upload photos without creating an account
FR26: The system persistently stores each uploaded photo and its metadata (file URL, coordinates, upload timestamp)
FR27: The system provides navigable routes to the map view (/) and the Unlocated Photos page (/unlocated)

### NonFunctional Requirements

NFR1: End-to-end upload-to-pin time (file selected → pin visible on map) ≤ 10 seconds on standard broadband
NFR2: Client-side EXIF GPS extraction completes within 1 second for files up to 10MB
NFR3: Photo file upload to Supabase Storage completes within 5 seconds for files up to 10MB
NFR4: Initial map load with all pins completes within 3 seconds on standard broadband
NFR5: Map polling does not cause visible UI jank or block user interaction during the refresh cycle
NFR6: The application remains interactive during photo upload (non-blocking upload flow)
NFR7: Supabase URL and anon key are stored as environment variables and never committed to source control
NFR8: Supabase Storage bucket is publicly readable; write access restricted to Supabase service calls only
NFR9: No personally identifiable information is collected or stored; uploads are anonymous
NFR10: Photo files are not transmitted to any server for GPS/EXIF extraction; processing occurs entirely client-side
NFR11: The application functions correctly for the full duration of the demo session without restart
NFR12: On upload failure (network error, Supabase timeout), the system displays a user-facing error message — no silent failure
NFR13: On EXIF extraction failure, the system routes the photo to Unlocated Photos page rather than throwing an unhandled error
NFR14: exifr successfully parses GPS coordinates from JPEG and HEIC files from iOS and Android camera apps
NFR15: OpenStreetMap tile loading is best-effort; map renders base layer within acceptable time under demo conditions
NFR16: Supabase free tier limits (storage, bandwidth, DB rows) are not breached during the demo session

### Additional Requirements

- **Starter template:** `npm create vite@latest pindrop -- --template react-ts` — This is Epic 1, Story 1. All subsequent stories build on this scaffold.
- **Supabase DB schema (single table):** `photos` table with columns: `id` (uuid PK), `file_url` (text not null), `lat` (double precision, nullable), `lng` (double precision, nullable), `is_manually_pinned` (boolean default false), `created_at` (timestamptz default now())
- **RLS policies:** SELECT open to anon; INSERT open to anon; UPDATE/DELETE blocked (no policy = denied)
- **Storage bucket:** `photos`, public read, 10MB file size limit enforced client-side
- **lib/* boundary:** `lib/supabase.ts` is the sole Supabase interface; `lib/exif.ts` is the sole exifr interface — components never import either library directly
- **State management:** React `useState` + `useEffect` only — no Redux or Zustand
- **Routing:** react-router-dom v6, two routes: `/` → MapPage, `/unlocated` → UnlocatedPage
- **Polling:** `setInterval` in `useEffect` with `clearInterval` on unmount; 30-second interval
- **TypeScript interface:** `Photo { id, fileUrl, lat, lng, isManuallyPinned, createdAt }` — camelCase in TS, mapped from snake_case DB at service boundary in `lib/supabase.ts`
- **Env vars:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (never committed); `.env.example` committed with placeholder values
- **SPA fallback:** `vercel.json` with rewrite: all routes → `index.html`
- **CORS:** Vercel production domain must be added to Supabase allowed origins before Hour 1 ends
- **Leaflet CSS:** Must be imported in `main.tsx` (`import 'leaflet/dist/leaflet.css'`) — required for React-Leaflet to render correctly
- **Null for unlocated:** `lat: null, lng: null` used for GPS-absent photos — never `0, 0`
- **Two-level gallery state:** In MapView: `selectedPin: Photo[] | null` (cluster) → `selectedPhoto: Photo | null` (detail)
- **Error handling — three explicit paths:** (1) EXIF failure → graceful route to /unlocated, no error shown; (2) Upload network error → inline message in UploadZone; (3) Supabase timeout → inline message in UploadZone

### UX Design Requirements

No UX Design document exists for this project. Frontend layout follows the architecture specification: map fills viewport; UploadZone overlaid on map; modal overlays for PinGallery and PhotoDetail; ManualPinPicker rendered within UnlocatedPage.

### FR Coverage Map

FR5: Frontend scope - Client-side GPS extraction (lib/exif.ts — Dev 1, not backend)
FR6: Epic 2 - GPS-present routing in upload flow
FR7: Epics 2 & 3 - GPS-absent routing; unlocated query
FR8: Epic 2 - Multi-file independent processing
FR11: Epic 2 - 30s polling in usePhotos hook
FR12: Epic 2 - 500-pin cap in fetchPhotos query
FR19: Epic 3 - fetchUnlocatedPhotos query
FR22: Epic 3 - updatePhotoCoordinates function
FR23: Epic 3 - manually pinned record saved with lat/lng
FR26: Epics 1 & 2 - Supabase Storage + DB record persistence
FR24, FR25: Epic 1 - Anonymous access via RLS policies
FR27: (frontend routing — out of backend scope)
FR1–FR4: (frontend upload UI — out of backend scope)
FR9–FR10, FR13: (frontend map render — out of backend scope)
FR14–FR18: (frontend gallery/detail — out of backend scope)
FR20–FR21: (frontend unlocated page UI — out of backend scope)

## Epic List

### Epic 1: Supabase Infrastructure
All Supabase infrastructure is provisioned and secured — the database, storage bucket, RLS policies, CORS, and environment variables are ready for application code to connect.
**FRs covered:** FR24, FR25, FR26 (infrastructure foundation)
**NFRs covered:** NFR7, NFR8, NFR9, NFR16

### Epic 2: Data Service Layer — Upload, Fetch & Polling
Application code can upload files to Supabase Storage (with pre-extracted lat/lng from the client), write records to the database, and serve the latest 500 pins with 30s polling.
**FRs covered:** FR6, FR7, FR8, FR11, FR12, FR26
**NFRs covered:** NFR3, NFR5, NFR12, NFR13
**Note:** FR5 (client-side GPS extraction) and NFR2/NFR10 are frontend scope (lib/exif.ts — Dev 1).

### Epic 3: Unlocated Photos Backend
Unlocated photos can be queried from the database and assigned manual GPS coordinates, persisting them to the global map.
**FRs covered:** FR7, FR19, FR22, FR23

## Epic 2: Data Service Layer — Upload, Fetch & Polling

Application code can upload files to Supabase Storage (receiving pre-extracted lat/lng from the client), write records to the database, and serve the latest 500 pins with 30s polling.
**Note:** GPS extraction (lib/exif.ts) is frontend scope — Dev 1.

### Story 2.1: Supabase Client Initialization

As a developer,
I want a typed Supabase client exported from a single module,
So that all application code imports one pre-configured instance and never instantiates the client directly.

**Acceptance Criteria:**

**Given** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env`
**When** `lib/supabase.ts` is imported
**Then** a configured `SupabaseClient` instance is the default export

**Given** the client module
**When** any other file needs Supabase access
**Then** it imports from `lib/supabase.ts` only — never from `@supabase/supabase-js` directly

**Given** missing env vars at runtime
**When** the client is imported
**Then** a clear console error identifies the missing variable name

### Story 2.2: Photo Upload & Database Insert

As a developer,
I want `uploadPhoto` and `insertPhoto` functions in `lib/supabase.ts`,
So that a photo file can be stored in Supabase Storage and its metadata written to the database in a coordinated flow.

**Acceptance Criteria:**

**Given** a `File` object and GPS coordinates
**When** `uploadPhoto(file, lat, lng)` is called
**Then** the file is stored in the `photos` bucket and a record is inserted with `file_url`, `lat`, `lng`, `created_at`

**Given** a `File` object with no GPS (`lat: null, lng: null`)
**When** `uploadPhoto(file, null, null)` is called
**Then** the file uploads and the record inserts with `lat: null, lng: null, is_manually_pinned: false`

**Given** a file larger than 10MB
**When** `uploadPhoto` is called
**Then** the upload is rejected before any network call with a user-readable error message (FR4)

**Given** a network failure during upload
**When** `uploadPhoto` is called
**Then** an error object with a user-readable `message` is returned — not thrown (NFR12)

**Given** a successful upload
**When** the function resolves
**Then** it returns the inserted `Photo` record with camelCase fields mapped from DB snake_case (`fileUrl`, `isManuallyPinned`, `createdAt`)

### Story 2.3: Photo Fetch & 30s Polling Hook

As a developer,
I want a `usePhotos` hook that fetches the latest 500 pins and polls every 30 seconds,
So that the map always reflects the most recent uploads without a page reload.

**Acceptance Criteria:**

**Given** photos exist with non-null `lat`/`lng`
**When** the hook mounts
**Then** it returns `{ photos: Photo[], loading: true }` immediately, then `{ photos, loading: false }` once the fetch resolves (NFR4)

**Given** 30 seconds have elapsed since last fetch
**When** the interval fires
**Then** `fetchPhotos()` is called again and `photos` state is updated silently — no loading spinner shown (NFR5)

**Given** the hook unmounts
**When** the interval fires
**Then** `clearInterval` has already run — no state update, no memory leak

**Given** a Supabase query failure
**When** `fetchPhotos()` is called
**Then** the hook returns `{ photos: [], loading: false, error: string }` — no silent failure (NFR12)

**Given** query results
**When** they resolve
**Then** DB `snake_case` fields are mapped to camelCase `Photo` interface (`fileUrl`, `isManuallyPinned`, `createdAt`)

## Epic 1: Supabase Infrastructure

All Supabase infrastructure is provisioned and secured — the database, storage bucket, RLS policies, CORS, and environment variables are ready for application code to connect.

### Story 1.1: Database Schema Setup

As a developer,
I want the `photos` table created in Supabase with the correct schema,
So that the application can persist photo records with GPS coordinates and file references.

**Acceptance Criteria:**

**Given** the Supabase project is created
**When** the SQL migration is executed
**Then** a `photos` table exists with: `id` (uuid PK, gen_random_uuid()), `file_url` (text not null), `lat` (double precision, nullable), `lng` (double precision, nullable), `is_manually_pinned` (boolean default false), `created_at` (timestamptz default now())

**Given** the table exists
**When** an INSERT is submitted without lat/lng
**Then** the record saves with `lat: null, lng: null` — never `0, 0`

**Given** the table exists
**When** `SELECT * WHERE lat IS NOT NULL ORDER BY created_at DESC LIMIT 500` is run
**Then** only GPS-tagged records are returned, newest first, capped at 500

### Story 1.2: Storage Bucket & RLS Policies

As a developer,
I want the `photos` storage bucket created and RLS policies configured,
So that anonymous users can read and upload photos but cannot modify or delete any records.

**Acceptance Criteria:**

**Given** the `photos` storage bucket is public
**When** a file URL is accessed directly
**Then** the file is readable without authentication

**Given** RLS is enabled on the `photos` table
**When** an anonymous user runs SELECT
**Then** all records are returned

**Given** RLS is enabled
**When** an anonymous user runs INSERT with valid data
**Then** the record is created successfully

**Given** RLS is enabled
**When** an anonymous user attempts UPDATE or DELETE
**Then** the operation is rejected (no policy = denied by default)

### Story 1.3: Environment Variables & CORS Configuration

As a developer,
I want `.env.example` committed and CORS configured in Supabase,
So that credentials are never in source control and the Vercel deployment can connect without CORS errors.

**Acceptance Criteria:**

**Given** `.env.example` is committed to the repo
**When** it is opened
**Then** it contains `VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=` with placeholder values only — no real credentials

**Given** `.env` exists with real credentials
**When** git status is checked
**Then** `.env` is listed in `.gitignore` and never staged

**Given** the Vercel deployment domain
**When** it is added to Supabase allowed origins
**Then** frontend requests succeed without CORS errors

## Epic 3: Unlocated Photos Backend

Unlocated photos can be queried from the database and assigned manual GPS coordinates, persisting them to the global map.

### Story 3.1: Unlocated Photos Query

As a developer,
I want a `fetchUnlocatedPhotos` function in `lib/supabase.ts`,
So that the application can retrieve all photos stored without GPS coordinates.

**Acceptance Criteria:**

**Given** photo records exist with `lat: null`
**When** `fetchUnlocatedPhotos()` is called
**Then** all records where `lat IS NULL` are returned, mapped to the `Photo` interface

**Given** photo records exist with non-null `lat`
**When** `fetchUnlocatedPhotos()` is called
**Then** those records are excluded from results

**Given** no unlocated photos exist
**When** `fetchUnlocatedPhotos()` is called
**Then** an empty array is returned — not an error

**Given** a query failure
**When** `fetchUnlocatedPhotos()` is called
**Then** an error object with a user-readable `message` is returned — not thrown

### Story 3.2: Manual GPS Coordinate Assignment

As a developer,
I want an `updatePhotoCoordinates` function in `lib/supabase.ts`,
So that an unlocated photo can be assigned user-provided GPS coordinates and appear on the global map.

**Acceptance Criteria:**

**Given** a valid photo `id` and non-null `lat`/`lng` values
**When** `updatePhotoCoordinates(id, lat, lng)` is called
**Then** the record is updated with the provided coordinates and `is_manually_pinned: true`

**Given** a successful update
**When** `fetchPhotos()` is next called
**Then** the manually pinned photo appears in results (lat is no longer null)

**Given** `lat: 0` or `lng: 0` is passed
**When** `updatePhotoCoordinates` is called
**Then** the update is rejected — `0, 0` is not a valid location sentinel

**Given** an invalid or non-existent photo `id`
**When** `updatePhotoCoordinates` is called
**Then** an error object with a user-readable `message` is returned — not thrown
