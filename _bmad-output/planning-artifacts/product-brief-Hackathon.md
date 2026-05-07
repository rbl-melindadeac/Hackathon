---
title: "Product Brief: PinDrop"
status: "draft"
created: "2026-05-07"
updated: "2026-05-07"
inputs: ["user discovery session", "web research - competitive landscape"]
---

# Product Brief: PinDrop

## Executive Summary

Every smartphone photo quietly carries a secret: the exact GPS coordinates of where it was taken. Most apps strip this data or ignore it entirely. PinDrop does the opposite — it reads it, maps it, and turns a collection of photos into a living visual story of the world.

Users upload photos, and within seconds those images appear as pins on a shared global map, placed precisely where they were captured. Click a pin and the photo opens alongside an AI-generated description of what's in the scene — the mountain range, the street market, the quiet café. No manual tagging. No form filling. The location intelligence is already there, and it never leaves the user's device to get it.

The hackathon goal is a working proof-of-concept that demonstrates all three core moments: upload → pin on map → photo with AI description. Built in 6 hours by a team of two developers, one project manager, and one content contributor sourcing real-world photos for the demo.

## The Problem

Geotagged photos are everywhere — most smartphones capture GPS coordinates in every shot by default. Yet this location data is almost universally wasted:

- Photo apps (Google Photos, Apple Photos) organize by date, not place — the spatial story is buried
- Social platforms strip or ignore EXIF metadata on upload
- Dedicated geo-photo tools either died (Panoramio, shut down by Google in 2016, leaving over 100 million photos without a home) or serve niche mapping professionals (Mapillary, KartaView)

The result: a photographer returns from a trip with 300 photos and has no simple way to share *where* those moments happened on a map, let alone what the photos actually show.

## The Solution

PinDrop is a web app with one core flow:

1. **Upload** — drag and drop one or more photos; a one-line disclosure confirms: *"This photo's GPS location will be visible to everyone"*
2. **Extract** — GPS coordinates are read from the photo's EXIF metadata **entirely in the browser** — the photo never leaves the device for location extraction
3. **Pin** — the photo appears as a clickable marker on the shared world map, placed at its exact capture location
4. **Describe** — clicking the pin opens the photo with an AI-generated caption; the image is sent to Claude's vision model (claude-haiku-4-5) which analyzes the actual scene contents and returns a natural-language description
5. **Discover** — the global map shows all uploaded photos from all users, auto-refreshing every 30 seconds so new pins appear without a page reload

Photos without GPS data are collected on a dedicated **Unlocated Photos** page rather than silently discarded.

## What Makes This Different

**The AI description layer.** Existing geo-photo tools show you *where* — PinDrop also tells you *what*. The combination of precise location + AI scene analysis creates richer context than either alone.

**Privacy-first extraction.** EXIF GPS data is parsed client-side in the browser. No server sees the coordinates until the user consciously chooses to publish the pin. This is a concrete, verifiable privacy guarantee — not a policy.

**Zero friction.** No account required. No manual tagging. If the GPS data is in the photo, the pin appears automatically. The barrier to participation is as low as it can be.

**The Panoramio gap.** Google shut down Panoramio in 2016. Its community of millions of photographers has never found a replacement. PinDrop enters an open market with a transparent, opt-in approach — and a direct appeal to the users who lost their most dedicated platform.

## Who This Serves

**Primary: Visual travelers and explorers.** Hikers, travel photographers, urban explorers — people who intentionally capture places and want to share the *where* as much as the *what*. Many are former Panoramio users still looking for a home.

**Secondary: Casual curious users.** Anyone who discovers the app and wants to see what the world looks like through others' cameras. The global map is inherently engaging — every pin is someone's real moment in a real place.

## Success Criteria

**Hackathon POC (6-hour target):**
- A photo with GPS metadata can be uploaded and appears as a pin on the map within 10 seconds
- Clicking the pin opens the photo with an AI-generated scene description that reflects actual image content
- The map auto-refreshes and shows newly uploaded pins without a page reload
- Photos without GPS data appear on the Unlocated Photos page

**Demo "wow moment":** Upload a photo taken somewhere recognizable → watch the pin land precisely on the map → click it → read the AI description that correctly identifies the scene.

## Scope

**In (MVP):**
- Photo upload with client-side EXIF GPS extraction (`exifr`)
- Global shared map with photo pins, capped at 500 most recent (performance)
- Photo popup: image + AI-generated description via Claude vision API
- Map auto-refresh every 30 seconds
- Unlocated Photos page for GPS-less uploads
- Anonymous, no auth required
- Upload disclosure: one-line location visibility warning

**Out (post-hackathon):**
- User accounts / personal galleries
- Content moderation / reporting tools
- Comments, likes, social features
- Pin clustering for dense areas
- Mobile app
- EXIF stripping / granular privacy controls
- Real-time WebSocket sync (polling is sufficient for POC)

## Recommended Tech Stack

Chosen for maximum build speed with minimal configuration overhead:

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | React + Vite | Fast dev server, zero config, excellent Claude Code support |
| Map | React-Leaflet + OpenStreetMap | Free, no API key, working map in ~20 minutes |
| EXIF parsing | `exifr` (JS library) | Browser-native GPS extraction in ~2 lines of code |
| Backend / Storage | Supabase | Postgres + file storage + REST API out of the box, generous free tier |
| AI descriptions | Claude API (`claude-haiku-4-5`) | Multimodal vision model — receives base64 image, returns scene description |
| Deployment | Vercel (frontend) + Supabase (backend) | Both deploy in minutes with zero DevOps |

> **Important for AI integration:** `claude-haiku-4-5` is used as a **vision model**. The uploaded image must be base64-encoded and sent as an image content block in the API request — not just the filename or metadata. This is what enables real scene descriptions rather than generic captions.

**Alternative if Supabase is unfamiliar:** Firebase (Storage + Firestore) achieves the same outcome — pick whichever the devs know.

## Work Split (2 Devs + 1 PM + 1 Content Contributor, 6 Hours)

### Dev 1 — Frontend (Map & Upload)
| Hour | Task |
|------|------|
| 0–1 | Scaffold React+Vite app, install React-Leaflet, render basic world map with a test pin |
| 1–2 | Build photo upload component with upload disclosure; integrate `exifr` to extract GPS from file |
| 2–3 | Connect upload to Supabase storage; on success, create DB record and drop pin on map |
| 3–4 | Build pin popup (photo + description placeholder); Unlocated Photos page; 500-pin cap |
| 4–5 | Wire AI description into popup once Dev 2's endpoint is ready; add 30-second map auto-refresh |
| 5–6 | Bug fixes, demo polish, end-to-end test with Content Contributor's real photos |

### Dev 2 — Backend & AI (Supabase + Claude API)
| Hour | Task |
|------|------|
| 0–1 | Set up Supabase project: `photos` table (id, url, lat, lng, description, created_at), storage bucket, CORS config |
| 1–2 | Write upload endpoint: receive file → store in Supabase → return URL + record ID |
| 2–3 | Integrate Claude Vision API: base64-encode image → send to `claude-haiku-4-5` with vision payload → store description |
| 3–4 | Write map data endpoint: return 500 most recent photos with lat/lng/description |
| 4–5 | Handle edge cases: no GPS → route to unlocated table; Claude API timeout fallback (store "Description unavailable") |
| 5–6 | End-to-end testing with Dev 1, fix integration bugs |

### PM
| Hour | Task |
|------|------|
| 0–1 | Finalize scope; set up shared repo and Supabase project; acquire and distribute Claude API key and all env vars |
| 0–1 | **Pre-flight:** confirm all Content Contributor photos have valid GPS using [exifinfo.org](https://exifinfo.org) before clock starts |
| 1–3 | Track progress, coordinate between devs and Content Contributor, unblock blockers |
| 3–5 | Write demo script and talking points; coordinate upload sequence with Content Contributor |
| 5–6 | Run rehearsal demo, identify polish priorities, prepare presentation |

### Content Contributor — Demo Photographer
| Hour | Task |
|------|------|
| Pre-hackathon | Verify all photos have GPS metadata — use original camera roll files; test at least one at [exifinfo.org](https://exifinfo.org) |
| Pre-hackathon | **Do not** share photos via WhatsApp, iMessage, Slack, or email — GPS is stripped by all of these |
| 0–2 | Curate 15–25 diverse photos from different locations, countries, or landmark types for maximum map spread |
| 2–4 | Deliver photos directly (USB, AirDrop, shared drive) to PM; confirm GPS data is present in each |
| 4–5 | Upload photos to the live app as a real user; report any UX issues or failures |
| 5–6 | Be the "real user" in the live demo — upload a fresh photo during the presentation |

## Vision

The hackathon POC validates the core loop: upload → pin → describe. From there, the natural evolution is:

- **Clusters and journey playback** — EXIF timestamps + GPS enable animated route tracing; group nearby pins into clusters
- **Privacy controls** — opt-in location display, EXIF stripping before upload (addressing the Instagram Maps lesson directly)
- **Richer AI layer** — landmark identification, semantic search ("show me photos near rivers at sunset"), auto-tagging
- **Community features** — curated map collections, trip galleries, embed widgets for travel blogs
- **The Panoramio migration path** — a bulk import tool for photographers who lost their work in 2016, targeting a warm, pre-qualified audience of millions

In two to three years, PinDrop could become the default way curious people share *where they've been* — a collectively built, open photo atlas of the world, one EXIF tag at a time.
