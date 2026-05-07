---
story_id: "1.1"
story_key: "1-1-initialize-react-vite-project"
epic: 1
title: "Initialize React + Vite Project"
status: "ready-for-dev"
created_at: "2026-05-07"
project: "PinDrop"
scope: "Frontend - Project Foundation"
time_estimate: "~30-45 minutes"
---

# Story 1.1: Initialize React + Vite Project

## User Story

As a developer,
I want to bootstrap a React + Vite + TypeScript project with all required dependencies installed,
So that I have a working foundation to build PinDrop features.

---

## Acceptance Criteria

**Given** no project exists yet  
**When** I run `npm create vite@latest pindrop -- --template react-ts` and install dependencies  
**Then** a new React 18+ project is created with TypeScript in strict mode

**And** Vite is configured with SWC for fast HMR and ESBuild production bundling

**And** the following dependencies are installed:
- `react-router-dom@6`
- `react-leaflet` + `leaflet`
- `exifr`
- `@supabase/supabase-js`
- `@types/leaflet`

**And** `npm run dev` starts a local dev server at `http://localhost:5173` with HMR working

**And** `npm run build` produces a `dist/` folder ready for Vercel deployment

**And** `.env.example` is created (but not `.env` in git) with placeholders for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Technical Requirements

### Project Setup Command

```bash
npm create vite@latest pindrop -- --template react-ts
cd pindrop
npm install
```

### Dependencies to Install

**Core React & Build:**
```bash
npm install react@latest react-dom@latest
```

**Routing:**
```bash
npm install react-router-dom@6
```

**Map Library:**
```bash
npm install react-leaflet@latest leaflet@latest
npm install -D @types/leaflet
```

**EXIF Parsing:**
```bash
npm install exifr@latest
```

**Supabase Client:**
```bash
npm install @supabase/supabase-js@latest
```

**TypeScript Types:**
```bash
npm install -D @types/react@latest @types/react-dom@latest
```

### Environment Setup

Create `.env.example` file in project root:

```
# Supabase Configuration (get values from Supabase dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Development
VITE_ENV=development
```

Create `.env` in project root (DO NOT COMMIT):
```
VITE_SUPABASE_URL=<actual-url>
VITE_SUPABASE_ANON_KEY=<actual-key>
VITE_ENV=development
```

Update `.gitignore` to exclude:
```
.env
.env.local
.DS_Store
node_modules/
dist/
```

### Project Structure

After initialization, the project structure should be:

```
pindrop/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component (to be implemented in 1.2)
│   ├── index.css             # Global styles
│   └── vite-env.d.ts         # Vite env types
├── public/                    # Static assets
├── index.html                # HTML template
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
└── README.md                 # Project docs
```

### TypeScript Configuration

The generated `tsconfig.json` should have:
- `strict: true` (strict type checking)
- `moduleResolution: "bundler"` (Vite-compatible)
- `jsx: "react-jsx"` (modern React 18 JSX transform)

### Vite Configuration

The generated `vite.config.ts` includes:
- `@vitejs/plugin-react` for React HMR
- SWC compiler (fast rebuilds)
- ESBuild for production bundling
- Source maps for development

---

## Development Checklist

### Phase 1: Project Creation (5-10 min)
- [ ] Run `npm create vite@latest pindrop -- --template react-ts`
- [ ] Navigate into project directory: `cd pindrop`
- [ ] Run `npm install` (install base dependencies)

### Phase 2: Install Frontend Dependencies (10-15 min)
- [ ] Install React Router: `npm install react-router-dom@6`
- [ ] Install map libraries: `npm install react-leaflet@latest leaflet@latest && npm install -D @types/leaflet`
- [ ] Install EXIF parser: `npm install exifr@latest`
- [ ] Install Supabase client: `npm install @supabase/supabase-js@latest`
- [ ] Verify `npm list` shows all dependencies without conflicts

### Phase 3: Environment Configuration (5 min)
- [ ] Create `.env.example` with Supabase placeholders
- [ ] Create `.env` with actual Supabase credentials (ask backend dev)
- [ ] Verify `.gitignore` excludes `.env`
- [ ] Verify `VITE_*` env vars will work with Vite (test with `import.meta.env.VITE_*`)

### Phase 4: Verify Setup (5-10 min)
- [ ] Run `npm run dev` and verify dev server starts at `http://localhost:5173`
- [ ] Check HMR works (edit `src/App.tsx`, verify page reloads automatically)
- [ ] Run `npm run build` and verify `dist/` folder is created
- [ ] Verify build output has `.js` and `.css` files
- [ ] Check `dist/index.html` references built JS/CSS correctly

### Phase 5: Commit (2 min)
- [ ] `git init` (if not already a git repo)
- [ ] `git add .` (stage all files except .env and node_modules)
- [ ] `git commit -m "Initial project setup: React + Vite + TypeScript with core dependencies"`

---

## Success Criteria

✅ **Project is initialized and ready for next story:**
- React 18+ with TypeScript strict mode
- All required npm dependencies installed and compatible
- Dev server starts and HMR works
- Production build creates optimized `dist/` folder
- Environment variables configured for Supabase
- Git repository initialized with proper .gitignore

✅ **Next story (1.2) can start immediately** - it will add React Router setup on top of this foundation

---

## Dependencies & Versions

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.0 | Core React library |
| `react-dom` | ^18.3.0 | React DOM rendering |
| `react-router-dom` | ^6.x | Client-side routing |
| `react-leaflet` | ^4.x | React bindings for Leaflet map |
| `leaflet` | ^1.9.x | Interactive map library |
| `exifr` | ^7.x | EXIF/GPS metadata parser |
| `@supabase/supabase-js` | ^2.x | Supabase client library |
| `typescript` | ^5.x | TypeScript compiler |
| `vite` | ^5.x | Build tool and dev server |

---

## Architecture Alignment

✅ **Starter Template:** Matches architecture spec exactly (`create-vite` react-ts template)  
✅ **Build System:** Vite with SWC for fast HMR and production bundling  
✅ **Language:** TypeScript strict mode as specified  
✅ **Environment:** Vite `.env` support with `VITE_*` prefix for Supabase config  
✅ **Styling:** CSS modules default (no opinionated framework)  
✅ **Entry Point:** `src/main.tsx` → `src/App.tsx` pattern  

---

## Potential Blockers

⚠️ **Backend Dependency:** Supabase credentials needed from backend dev
- Get `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from backend
- Store in `.env` (DO NOT COMMIT)
- Create `.env.example` for reference

⚠️ **Node.js Version:** Ensure Node.js 18+ installed
- Check: `node --version` (expect v18.0.0 or higher)
- If needed, update Node.js before starting

⚠️ **Conflicting Global Installs:** If `create-vite` or dependencies were previously installed globally, use `npm@latest` to ensure fresh install
- Try: `npm create vite@latest ...` (uses npx automatically)

---

## Implementation Notes

**Why Vite over Create React App?**
- Faster dev server (HMR in <100ms vs CRA's seconds)
- Smaller build output
- ESBuild for production (10x faster than Webpack)
- Direct ES module support

**Why TypeScript Strict Mode?**
- Catches type errors at dev time before runtime
- Better IDE autocomplete and refactoring
- Required by architecture spec

**Why React Router v6?**
- Modern hooks-based routing
- Nested routes support
- Required for `/` and `/unlocated` paths in Story 1.2

**Next Story (1.2):**
- Will import `react-router-dom` from this project
- Will create `src/App.tsx` with Router setup
- Will add navigation between map and unlocated pages

---

## Dev Agent Notes

This story is a **pure setup task** with no complex logic:
1. Follow the exact npm commands (copy-paste friendly)
2. Verify each checkpoint works before moving forward
3. Get Supabase credentials from backend dev ASAP (don't block on this)
4. Commit clean project structure for next developer

**Time estimate:** 30-45 minutes total  
**Complexity:** Low (straightforward initialization)  
**Risk:** None — bootstrapping is risk-free, can restart if needed  
**Blocked by:** Nothing  
**Blocks:** Epic 1, Story 1.2 (Router setup)

---

**Status:** ✅ Ready for Development

Begin with Phase 1 above. Reach out if npm install fails or dev server won't start.
