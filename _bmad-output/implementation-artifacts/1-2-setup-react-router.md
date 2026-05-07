---
story_id: "1.2"
story_key: "1-2-setup-react-router"
epic: 1
title: "Set Up React Router with `/` and `/unlocated` Routes"
status: "ready-for-dev"
created_at: "2026-05-07"
project: "PinDrop"
scope: "Frontend - Routing Foundation"
time_estimate: "~20-30 minutes"
depends_on: "Story 1.1 (Project initialization)"
---

# Story 1.2: Set Up React Router with `/` and `/unlocated` Routes

## User Story

As a user,
I want to navigate between the map view and unlocated photos page,
So that I can discover photos either on the global map or manage photos without GPS.

---

## Acceptance Criteria

**Given** the Vite project is initialized with `react-router-dom@6` installed  
**When** I define routes in `src/App.tsx` using `<Routes>`  
**Then** `/` renders `MapPage` component

**And** `/unlocated` renders `UnlocatedPage` component

**And** both routes are accessible via navigation links in an app header or footer

**And** the browser back/forward buttons work correctly (e.g., clicking "back" from `/unlocated` returns to `/`)

**And** direct URL navigation works (e.g., visiting `http://localhost:5173/unlocated` loads the unlocated page directly)

---

## Implementation Guide

### Step 1: Update `src/App.tsx` with Router Setup

Replace the entire `src/App.tsx` with:

```typescript
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MapPage from './pages/MapPage';
import UnlocatedPage from './pages/UnlocatedPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1>🗺️ PinDrop</h1>
          <nav>
            <Link to="/">Map</Link>
            <Link to="/unlocated">Unlocated Photos</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/unlocated" element={<UnlocatedPage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>PinDrop - Transform geotagged photos into a shared world map</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
```

**What this does:**
- Wraps app in `<BrowserRouter>` to enable routing
- Defines two routes: `/` (MapPage) and `/unlocated` (UnlocatedPage)
- Adds header with navigation links
- Routes will render in `<main>`

### Step 2: Create `src/pages/` Directory

Create a new folder to hold page components:

```bash
mkdir -p src/pages
```

### Step 3: Create `src/pages/MapPage.tsx`

This is a placeholder for the global map view (will be fully implemented in Epic 2).

```typescript
export default function MapPage() {
  return (
    <div className="map-page">
      <h2>Global Photo Map</h2>
      <p>Map will render here in Story 1.3</p>
      <div className="map-placeholder" style={{
        width: '100%',
        height: '600px',
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        borderRadius: '8px',
      }}>
        🗺️ Interactive map placeholder
      </div>
    </div>
  );
}
```

### Step 4: Create `src/pages/UnlocatedPage.tsx`

This is a placeholder for the unlocated photos page (will be fully implemented in Epic 3).

```typescript
export default function UnlocatedPage() {
  return (
    <div className="unlocated-page">
      <h2>Unlocated Photos</h2>
      <p>Photos without GPS data will appear here in Epic 3</p>
      <div className="photos-placeholder" style={{
        width: '100%',
        height: '400px',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        borderRadius: '8px',
      }}>
        📸 Photos grid placeholder
      </div>
    </div>
  );
}
```

### Step 5: Update `src/App.css` with Basic Styling

Replace the entire `src/App.css` with:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafafa;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 28px;
  margin-bottom: 1rem;
}

.app-header nav {
  display: flex;
  gap: 2rem;
}

.app-header a {
  color: white;
  text-decoration: none;
  font-size: 16px;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.app-header a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.app-main h2 {
  font-size: 24px;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.app-main p {
  color: #666;
  margin-bottom: 1rem;
}

.app-footer {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  text-align: center;
  border-top: 1px solid #ccc;
}

.app-footer p {
  color: #aaa;
  font-size: 14px;
}
```

### Step 6: Test Routes

After making changes, verify:

1. **Dev server still running?**
   ```bash
   npm run dev
   ```
   Should show: `Local: http://localhost:5173/`

2. **Navigate to home:**
   - Open `http://localhost:5173/`
   - Should see "Global Photo Map" heading

3. **Navigate to unlocated:**
   - Click "Unlocated Photos" link in header
   - Should see "Unlocated Photos" heading at `http://localhost:5173/unlocated`

4. **Test browser back/forward:**
   - Click "Map" link → see map page
   - Click "Unlocated Photos" → see unlocated page
   - Click browser back button → returns to map page
   - Click browser forward button → returns to unlocated page

5. **Test direct URL navigation:**
   - Manually type `http://localhost:5173/unlocated` in address bar
   - Should load unlocated page directly (no error)

---

## File Changes Summary

| File | Action | Change |
|------|--------|--------|
| `src/App.tsx` | MODIFY | Add BrowserRouter and Routes |
| `src/App.css` | MODIFY | Add routing-aware styling |
| `src/pages/MapPage.tsx` | CREATE | Placeholder map page |
| `src/pages/UnlocatedPage.tsx` | CREATE | Placeholder unlocated page |

---

## Dev Agent Notes

### Key Points

1. **`<BrowserRouter>` must wrap everything** - Routes won't work without it
2. **`<Routes>` matches routes in order** - First matching route renders
3. **`<Link>` prevents full page reload** - Uses client-side navigation (fast!)
4. **Dynamic imports optional** - Can add later for code splitting if needed

### What This Enables

✅ Navigation between two main views  
✅ Browser history (back/forward buttons work)  
✅ URL-based routing (direct URL access works)  
✅ Foundation for all future pages and features  

### Potential Issues

⚠️ **If routes don't work:**
- Verify `react-router-dom@6` is installed: `npm list react-router-dom`
- Check that `<BrowserRouter>` wraps the whole app
- Make sure page components are imported correctly

⚠️ **If styles look wrong:**
- Check that CSS is applying to `.app`, `.app-header`, `.app-main`
- Dev server should auto-reload when CSS changes (HMR)

### Next Stories

- **Story 1.3:** Add map rendering to MapPage using React-Leaflet
- **Story 1.4:** Add zoom/pan to map
- **Story 1.5:** Add polling for real-time updates
- **Epic 2:** Upload and gallery features will be added to MapPage

---

## Success Criteria Checklist

✅ Routes defined and rendering  
✅ Navigation links working  
✅ Browser history working  
✅ Direct URL access working  
✅ No console errors  
✅ Dev server HMR working  

---

**Time estimate:** 20-30 minutes  
**Complexity:** Low (straightforward routing setup)  
**Risk:** None (routing is isolated)  
**Blocked by:** Story 1.1  
**Blocks:** Story 1.3 (map rendering)

---

**Status:** ✅ Ready for Implementation

Start with Step 1 (update App.tsx). Deploy changes incrementally and test at each step.
