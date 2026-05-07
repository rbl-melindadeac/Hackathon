---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
status: complete
completedAt: "2026-05-07"
releaseMode: phased
inputDocuments: ["_bmad-output/planning-artifacts/product-brief-Hackathon.md"]
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
workflowType: 'prd'
classification:
  projectType: web_app
  domain: general
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document — PinDrop

**Author:** Melinda.deac
**Date:** 2026-05-07

## Executive Summary

PinDrop is a browser-based web application that transforms geotagged photos into a shared, interactive world map. Users upload photos containing EXIF GPS metadata; the app extracts coordinates client-side, stores the photo, and places a clickable pin at the exact capture location on a global shared map. Any visitor can browse the map, click a pin to view a gallery of photos from that location, and open individual photo detail views. Photos lacking GPS data are routed to a dedicated Unlocated Photos page where users can assign a location manually.

The hackathon deliverable is a working POC demonstrating the core loop end-to-end: upload → client-side GPS extraction → pin on map → gallery → photo detail. Built by two developers in 6 hours using React + Vite, React-Leaflet with OpenStreetMap, Supabase (storage + database), and the `exifr` JS library for in-browser EXIF parsing. No authentication required.

**Demo audience:** Fellow developers and business judges evaluating technical execution and product concept viability.

### What Makes This Special

**Client-side EXIF extraction** — GPS coordinates are parsed in the browser before anything is transmitted. The photo never leaves the device for location extraction; this is a verifiable privacy guarantee, not a policy statement.

**Zero friction** — no account, no manual tagging, no form filling. If GPS data exists in the file, the pin appears automatically.

**The Panoramio gap** — Google shut down the last dominant "photos on a world map" product in 2016. No mainstream consumer replacement exists. PinDrop enters an open, proven market.

**Phase 2 roadmap** — AI-powered scene descriptions via Claude Vision API (`claude-haiku-4-5`), adding a *what* layer to the *where*. Not in scope for the hackathon POC.

### Project Classification

| Attribute | Value |
|-----------|-------|
| Project Type | Web App (SPA, React) |
| Domain | General — consumer photo-mapping |
| Complexity | Medium — multi-layer integration (browser EXIF, file storage, real-time map), no regulatory constraints |
| Project Context | Greenfield |
| Delivery | Hackathon POC — 6-hour build, 2 developers |

## Success Criteria

### User Success

- A user uploads a photo with GPS metadata and sees a pin appear on the map within 10 seconds, with no errors or manual steps
- A user clicks a map pin and views a gallery of all photos from that location; selecting a photo opens its detail view
- A user who uploads a photo without GPS data sees it on the Unlocated Photos page with a clear explanation — no silent failure
- A first-time visitor understands what the app does from the map alone, without reading instructions

### Business Success

- **Demo verdict:** Business judges articulate the product concept and differentiator after a 3-minute demo — the pitch lands without explanation
- **Technical credibility:** Developer judges verify client-side EXIF extraction is real (no server round-trip for coordinates) — demonstrable via DevTools, not asserted
- **POC completeness:** All core demo moments work end-to-end without fallback: upload → pin → gallery → photo detail

### Technical Success

- Client-side EXIF GPS extraction works on JPEG and HEIC files from iOS and Android camera apps (original files, not re-shared via messaging)
- Photo upload to Supabase completes within 5 seconds for files up to 10MB
- Map renders all pins at correct GPS coordinates with no offset
- App functions on Chrome 120+ and Safari 17+
- Map auto-refreshes every 30 seconds; new pins appear without page reload

### Measurable Outcomes

| Outcome | Target |
|---------|--------|
| Upload-to-pin time | ≤ 10 seconds |
| File size support | Up to 10MB per photo |
| GPS extraction success rate (original camera files) | ≥ 95% |
| Demo completion (all core moments) | 100% — no fallback needed |
| Browser support | Chrome 120+, Safari 17+ |

## Product Scope

### MVP — Hackathon POC (6 hours)

**Must-have capabilities:**
- Photo upload via drag-and-drop with location disclosure
- Client-side EXIF GPS extraction (`exifr`)
- Supabase photo storage + `photos` DB table
- Global shared map with pins at GPS coordinates (React-Leaflet + OSM)
- Pin click → gallery of photos from that location → individual photo detail view
- 30-second map polling for new pins; 500-pin cap (performance safeguard)
- Unlocated Photos page with "Pin manually" action and inline map picker
- Anonymous access — no authentication
- Two-route SPA: `/` (map) and `/unlocated`

**Nice-to-have (add only if time permits):**
- Upload progress indicator
- Photo thumbnail on pin hover
- Pin click counter

**MVP approach:** Problem-solving POC — prove the core technical loop works end-to-end and is demonstrable live. Goal is proof of concept credibility, not feature completeness.

**Resource requirements:** 2 developers (frontend + backend), 1 PM, 1 content contributor (demo only). 6-hour build window.

### Phase 2 — Post-Hackathon

- AI scene descriptions via Claude Vision API (`claude-haiku-4-5`) — base64 image → stored description displayed in photo detail view
- Pin clustering for dense geographic areas
- URL-based photo upload
- Basic location name search/filter

### Phase 3 — Vision

- User accounts, personal galleries, trip collections
- Privacy controls: opt-in GPS display, client-side EXIF stripping before upload
- Landmark and object identification in AI descriptions
- Travel blog embed widget
- Bulk import from Google Takeout / Apple Photos (Panoramio migration path)
- Community curation: named collections, curated map layers

### Risk Mitigation

**Technical:**
- `exifr` GPS reliability on real-world files → pre-hackathon testing with Content Contributor's actual photos before clock starts
- CORS misconfiguration between Vercel and Supabase → Dev 2 configures CORS in Hour 0–1 before any frontend calls
- Integration handoff delay → Dev 1 uses hardcoded test data for map rendering until Dev 2's endpoint is ready

**Market:**
- Audience without geotagged photos → Content Contributor pre-verifies 15–25 photos with GPS intact; demo uses their uploads
- Privacy concern from judges → client-side extraction story answers it; DevTools shows zero server requests during GPS parsing

**Resource:**
- One dev blocked → PM can absorb Supabase setup (Hour 0–1); manual pinning is the first feature cut if time runs short

## User Journeys

### Journey 1: The Traveler — Photo Contributor (Happy Path)

**Meet Sara.** She just returned from a week hiking in the Dolomites. Her camera roll has 200 photos, all stamped with GPS coordinates. She's used to apps that sort by date — she's never seen her trip laid out *as a map*.

**Opening Scene:** Sara opens PinDrop and sees a world map dotted with pins from other users. She immediately understands the concept — no tutorial needed.

**Rising Action:** She drags three Dolomites photos onto the upload area. A disclosure reads: *"This photo's GPS location will be visible to everyone."* She uploads. A loading indicator appears briefly.

**Climax:** Three pins materialize in northeastern Italy — exactly where she was standing. She zooms in, clicks a pin, sees a gallery of her photos from that spot, selects one, and her photo fills the detail view. The map is her story, not a chronological list.

**Resolution:** Sara shares the URL with her hiking group. Each member uploads photos from the same trip. By the end of the day, a dozen pins trace their route — a collectively built record of the journey.

**Requirements revealed:** File upload UI, client-side EXIF extraction, Supabase storage, pin at GPS coordinates, pin gallery, photo detail view, upload disclosure, map auto-refresh.

---

### Journey 2: The Uploader — Edge Case (GPS Missing, Manual Pin)

**Meet Marco.** He wants to contribute photos but grabs files from his WhatsApp chat — forwarded images with GPS stripped by the messaging app.

**Opening Scene:** Marco drags three photos onto the upload area, expecting pins on the map.

**Rising Action:** The app detects no GPS in the EXIF data. Instead of dropping pins, it routes his photos to the Unlocated Photos page.

**Climax:** Marco sees his photos listed with the message: *"These photos don't have GPS data — likely shared via a messaging app which removes location info."* Next to each photo: a **"Pin manually"** button. He clicks it, a compact map picker opens, he drops a pin on the right city. The photo is saved with his coordinates and appears on the global map.

**Resolution:** One photo is manually pinned and on the map. For the other two, Marco re-uploads originals from his camera roll — those land automatically via EXIF.

**Requirements revealed:** EXIF GPS detection, Unlocated Photos routing, user-facing explanation, "Pin manually" CTA, inline map picker, manually-pinned photos saved to same `photos` table with user-provided lat/lng.

---

### Journey 3: The Explorer — Map Browser

**Meet Lena.** She found the app linked from a travel blog. No photos to share today — she's here to explore.

**Opening Scene:** Lena opens PinDrop and sees pins scattered across multiple continents. She zooms into Japan.

**Rising Action:** She clicks a pin near Kyoto. A gallery opens — two photos from that location. She selects the first: a bamboo forest, golden hour. She closes it, selects the second: a street market at dawn.

**Climax:** Lena spends 10 minutes clicking pins across Japan, Southeast Asia, and Patagonia. Every click is someone's real moment in a real place.

**Resolution:** Lena bookmarks the app. Next week, she uploads photos from her own city — contributing to the atlas she spent the afternoon browsing.

**Requirements revealed:** Map loads with all pins, pin click opens gallery, gallery → photo detail, map is navigable (zoom, pan), anonymous access to browse and upload.

---

### Journey Requirements Summary

| Capability | Source |
|------------|--------|
| File upload UI with drag-and-drop | Journey 1 |
| Client-side EXIF GPS extraction | Journeys 1 & 2 |
| GPS-present routing → map pin | Journey 1 |
| GPS-absent routing → Unlocated Photos page | Journey 2 |
| Explanation on Unlocated Photos page | Journey 2 |
| "Pin manually" + inline map picker | Journey 2 |
| Manually-pinned photos on global map | Journey 2 |
| Map renders all pins on load | Journeys 1 & 3 |
| Pin click → gallery of photos at location | Journeys 1 & 3 |
| Gallery → photo detail view | Journeys 1 & 3 |
| Map auto-refresh (new pins without reload) | Journey 1 |
| Anonymous access — no login required | Journey 3 |
| Upload disclosure notice | Journey 1 |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Client-Side Privacy-Preserving GPS Extraction**
GPS coordinates are extracted from EXIF metadata entirely in the browser via `exifr`. The photo never leaves the device for location processing; only after the user consciously uploads does any data reach the server. This inverts the standard server-processes-metadata approach and makes the privacy guarantee concrete and verifiable by any developer in the audience.

**2. Zero-Friction Shared Photo Atlas**
Anonymous upload + EXIF-automatic pinning + global shared map creates a collectively built atlas with no coordination overhead. No account, no tagging, no curation step — the intelligence is in the file. This is a distinct interaction pattern from social photo apps (identity required) and mapping tools (manual contribution required).

**3. Phase 2: Where + What (AI Layer)**
Claude Vision API integration adds an AI-generated scene description to each pin — answering not just *where* the photo was taken but *what* it shows. No existing photo-map product combines precise geolocation with AI scene understanding.

### Market Context

| Competitor | Approach | Gap |
|------------|----------|-----|
| Panoramio (Google, 2016†) | Shared photo map | Shut down; no replacement emerged |
| Instagram Maps (2024–25) | Location-tagged posts on map | Opt-out privacy backlash; not EXIF-native |
| Mapillary / KartaView | Geotagged photos for mapping professionals | Niche audience; no AI; no consumer UX |
| EXIF utility tools | Metadata viewer | No map, no sharing, no AI layer |

The gap is proven by prior demand (Panoramio's 100M+ photos) and unoccupied by any current mainstream product.

### Validation Approach

- **Client-side extraction:** Open DevTools during demo — zero network requests during EXIF parsing phase
- **Zero-friction atlas:** Content Contributor uploads live during demo — judges see pin appear on shared map in real time
- **Phase 2 AI layer:** Validated in Phase 2 by confirming `claude-haiku-4-5` scene accuracy on test photos before shipping

## Web App Specific Requirements

### Architecture Overview

PinDrop is a Single Page Application (SPA) built with React + Vite. All routing and state are client-side. No server-rendered pages, no SEO requirements, no native device API dependencies. Primary interaction surface: map canvas with overlaid upload component.

### Browser Matrix

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | 120+ | Primary — full support required |
| Safari | 17+ | Primary — full support required |
| Firefox | 120+ | Best-effort |
| Edge | 120+ | Best-effort (Chromium-based) |

### Responsive Design

- Desktop-first — map fills viewport, upload control overlaid or docked
- Tablet: functional, not polished
- Mobile: out of scope for POC

### SEO & Accessibility

Both out of scope for hackathon POC. Semantic HTML used by default; no WCAG target, no screen reader testing, no meta tags or sitemaps.

### Implementation Notes

- **State:** React local state + Supabase client SDK — no Redux or Zustand needed
- **Map:** React-Leaflet + Leaflet.js; OpenStreetMap tiles (free, no API key)
- **EXIF:** `exifr` runs synchronously in the main thread; no Web Worker needed at POC file sizes
- **Upload flow:** File selected → EXIF extracted client-side → file uploaded to Supabase Storage → DB record created with lat/lng → map re-renders pin
- **Polling:** `setInterval` at 30s; fetch latest 500 pins from Supabase, replace map markers
- **Routing:** `/` (map view), `/unlocated` (unlocated photos page)
- **Env vars:** Supabase URL and anon key via Vite `.env` file, never committed to source control

## Functional Requirements

### Photo Upload

- **FR1:** Users can upload one or more photo files via drag-and-drop
- **FR2:** Users can upload photo files via a file browser selection dialog
- **FR3:** The system displays a location visibility disclosure before completing the upload
- **FR4:** The system accepts photo files up to 10MB per file

### Location Extraction

- **FR5:** The system extracts GPS coordinates from a photo's EXIF metadata entirely within the browser, without transmitting the file to a server for coordinate parsing
- **FR6:** Photos with valid GPS coordinates are routed to the map pin creation flow
- **FR7:** Photos without GPS coordinates are routed to the Unlocated Photos collection
- **FR8:** When multiple files are uploaded together, each file is processed and routed independently based on GPS presence

### Map Display

- **FR9:** Any visitor can view a global shared map showing pins for all uploaded geotagged photos
- **FR10:** Each pin is rendered at the precise GPS coordinates extracted from its photo
- **FR11:** The map refreshes automatically at a regular interval to show newly uploaded pins without a page reload
- **FR12:** The map limits simultaneously rendered pins to the most recently uploaded (performance cap)
- **FR13:** Users can navigate the map by zooming and panning

### Photo Discovery

- **FR14:** Users can click any map pin to open a gallery showing all photos uploaded from that location
- **FR15:** Users can select a photo from the pin gallery to open a photo detail view
- **FR16:** The photo detail view displays the selected photo at readable size
- **FR17:** Users can dismiss the photo detail view and return to the pin gallery
- **FR18:** Users can dismiss the pin gallery and return to the map

### Unlocated Photos

- **FR19:** Users can navigate to a dedicated page listing all photos uploaded without GPS data
- **FR20:** The Unlocated Photos page displays each photo with an explanation of why it has no map pin
- **FR21:** Users can initiate manual location assignment for any photo on the Unlocated Photos page
- **FR22:** Users can select a location on an interactive map picker to assign GPS coordinates to an unlocated photo
- **FR23:** Manually pinned photos are saved with user-provided coordinates and appear on the global map alongside GPS-extracted pins

### Data & Access

- **FR24:** Any visitor can browse the map and view photo galleries without creating an account
- **FR25:** Any visitor can upload photos without creating an account
- **FR26:** The system persistently stores each uploaded photo and its metadata (file URL, coordinates, upload timestamp)
- **FR27:** The system provides navigable routes to the map view (`/`) and the Unlocated Photos page (`/unlocated`)

## Non-Functional Requirements

### Performance

- **NFR1:** End-to-end upload-to-pin time (file selected → pin visible on map) ≤ 10 seconds on standard broadband
- **NFR2:** Client-side EXIF GPS extraction completes within 1 second for files up to 10MB
- **NFR3:** Photo file upload to Supabase Storage completes within 5 seconds for files up to 10MB
- **NFR4:** Initial map load with all pins completes within 3 seconds on standard broadband
- **NFR5:** Map polling does not cause visible UI jank or block user interaction during the refresh cycle
- **NFR6:** The application remains interactive during photo upload (non-blocking upload flow)

### Security

- **NFR7:** Supabase URL and anon key are stored as environment variables and never committed to source control
- **NFR8:** Supabase Storage bucket is publicly readable by design (public atlas); write access is restricted to authenticated Supabase service calls only
- **NFR9:** No personally identifiable information is collected or stored; uploads are anonymous with no user identity associated with any photo record
- **NFR10:** Photo files are not transmitted to any server for GPS/EXIF extraction; this processing occurs entirely client-side

### Reliability

- **NFR11:** The application functions correctly for the full duration of the demo session without restart or manual intervention
- **NFR12:** On upload failure (network error, Supabase timeout), the system displays a user-facing error message — no silent failure
- **NFR13:** On EXIF extraction failure for any file format, the system routes the photo to the Unlocated Photos page rather than throwing an unhandled error

### Integration

- **NFR14:** `exifr` successfully parses GPS coordinates from JPEG and HEIC files produced by iOS and Android camera apps (original files, not re-shared via messaging)
- **NFR15:** OpenStreetMap tile loading is treated as best-effort; the map renders the base layer within acceptable time under demo network conditions
- **NFR16:** Supabase free tier limits (storage, bandwidth, DB rows) are not breached during the demo session; team verifies headroom before starting
