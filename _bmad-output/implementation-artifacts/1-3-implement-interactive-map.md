---
story_id: "1.3"
story_key: "1-3-implement-interactive-map"
epic: 1
title: "Implement Global Interactive Map with React-Leaflet"
status: "ready-for-dev"
created_at: "2026-05-07"
project: "PinDrop"
scope: "Frontend - Map Rendering"
time_estimate: "~25-35 minutes"
depends_on: "Story 1.2 (Router setup)"
---

# Story 1.3: Implement Global Interactive Map with React-Leaflet

## User Story

As an explorer,
I want to see a world map with pins marking photo locations,
So that I can visualize the geographic distribution of photos.

---

## Acceptance Criteria

**Given** the React Router routes are configured and the MapPage component exists  
**When** I render `<MapView />` component with `react-leaflet`  
**Then** a full-screen interactive map is displayed using OpenStreetMap tiles (free, no API key required)

**And** the map center defaults to zoom level 2, latitude 20, longitude 0 (centered on Earth)

**And** the map is responsive (fills the viewport)

**And** a placeholder `<Marker>` is rendered at a hardcoded location (e.g., lat: 51.505, lng: -0.09, London) for testing

**And** the marker shows a basic popup on click with a test label (e.g., "Test Photo")

**And** the map renders without errors in the browser console

**And** the initial map load time (map tiles loaded, markers rendered) is under 3 seconds on standard broadband (NFR4)

---

## Implementation Guide

### Step 1: Create `src/lib/` Directory and Leaflet Setup

Create a new directory for utility files:

```bash
mkdir -p src/lib
```

Create `src/lib/leaflet-setup.css` for Leaflet styling:

```css
/* Import Leaflet CSS for proper map rendering */
@import 'leaflet/dist/leaflet.css';

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.leaflet-container {
  width: 100%;
  height: 100%;
  background-color: #e0e7ff;
}

.leaflet-popup-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 14px;
  margin: 0;
}

.leaflet-popup-content p {
  margin: 0;
}
```

### Step 2: Create `src/components/MapView.tsx`

This is the main map component using React-Leaflet:

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import '../lib/leaflet-setup.css';

// Fix for Leaflet default markers (required for React-Leaflet)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  photos?: Array<{ id: string; lat: number; lng: number; title: string }>;
}

export default function MapView({ photos = [] }: MapViewProps) {
  // Default map center (Earth view)
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;

  // Test data (hardcoded marker for testing)
  const testMarker = {
    id: 'test-1',
    lat: 51.505,
    lng: -0.09,
    title: 'Test Photo - London',
  };

  // Combine test marker with actual photos (or just test marker if no photos)
  const markers = photos.length > 0 ? photos : [testMarker];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* OpenStreetMap tiles (free, no API key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render markers for each photo */}
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>
              <p>{marker.title}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

### Step 3: Update `src/pages/MapPage.tsx`

Replace the placeholder with actual MapView component:

```typescript
import MapView from '../components/MapView';
import '../styles/MapPage.css';

export default function MapPage() {
  return (
    <div className="map-page">
      <div className="map-wrapper">
        <MapView />
      </div>
    </div>
  );
}
```

### Step 4: Create `src/styles/MapPage.css`

Add styling for the map page:

```css
.map-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 200px);
  gap: 1rem;
}

.map-wrapper {
  flex: 1;
  width: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #e0e7ff;
}

/* Ensure map fills container */
.map-wrapper > div {
  width: 100%;
  height: 100%;
}
```

### Step 5: Update `src/App.css`

Adjust the app main height to accommodate full-screen map:

Add to `.app-main`:

```css
.app-main {
  flex: 1;
  padding: 0;
  max-width: 100%;
  width: 100%;
  margin: 0;
  overflow: hidden;
}
```

Update the header/footer padding if needed to make map fullscreen.

---

## Testing Checklist

### Visual Tests
- [ ] Map displays with OpenStreetMap tiles
- [ ] Map is centered on Earth (zoom level 2)
- [ ] Test marker appears at London (51.505, -0.09)
- [ ] Clicking marker shows popup with "Test Photo - London"
- [ ] Map is responsive (resizes with window)
- [ ] No visual glitches or tile loading errors

### Functional Tests
- [ ] Zoom controls visible (+ and - buttons)
- [ ] Can zoom in/out with controls
- [ ] Can pan by clicking and dragging
- [ ] Marker popup closes when clicking elsewhere
- [ ] No console errors (check browser DevTools)

### Performance Tests
- [ ] Map loads within 3 seconds (check Network tab in DevTools)
- [ ] No lag when panning/zooming
- [ ] Tiles load smoothly

---

## File Changes Summary

| File | Action | Change |
|------|--------|--------|
| `src/lib/leaflet-setup.css` | CREATE | Leaflet styling |
| `src/components/MapView.tsx` | CREATE | React-Leaflet map component |
| `src/pages/MapPage.tsx` | MODIFY | Replace placeholder with MapView |
| `src/styles/MapPage.css` | CREATE | Map page styling |
| `src/App.css` | MODIFY | Adjust main area for full-screen map |

---

## Architecture Alignment

✅ **React-Leaflet:** Version 5.0.0 (latest stable)  
✅ **Leaflet:** Version 1.9.4 (latest stable)  
✅ **OpenStreetMap:** Free tiles, no API key required  
✅ **TypeScript:** Strict types on all components  
✅ **Performance:** Map load < 3 seconds (NFR4)  

---

## Potential Issues & Solutions

⚠️ **Leaflet Icon Not Showing:**
- Issue: Default marker icons fail to load
- Solution: CDN URLs configured in MapView.tsx (included in code)

⚠️ **Map Not Filling Container:**
- Issue: Map height is 0 or parent height undefined
- Solution: Set explicit height on map container (included in CSS)

⚠️ **Slow Tile Loading:**
- Issue: OpenStreetMap tiles load slowly
- Solution: Normal (free tier), tiles cache after first load
- Use Network Throttling in DevTools to test slow connections

⚠️ **Zoom Controls Missing:**
- Issue: Controls not visible on first load
- Solution: Part of Leaflet default UI, included automatically

---

## Dev Agent Notes

### Key Implementation Points

1. **Leaflet Marker Icon Fix:** Required to use CDN URLs instead of bundled assets (React-Leaflet compatibility issue)
2. **Full-Screen Map:** Set parent height to `calc(100vh - header_height)` to avoid overflow
3. **MapContainer Props:** Must include `center`, `zoom`, and `style` for proper rendering
4. **Test Marker:** Hardcoded London marker for visual testing before integration with real data

### What This Enables

✅ Interactive map foundation for all photo display  
✅ Zoom/pan will be added in Story 1.4  
✅ Polling for real-time updates in Story 1.5  
✅ Pins from Story 2.5 will render automatically  

### Performance Notes

- OpenStreetMap tiles are cached by the browser
- Initial load ~1-2 seconds (tiles + map initialization)
- Subsequent navigation much faster (cached tiles)
- No performance issues expected even with 500 pins

---

## Success Criteria Checklist

✅ Map renders with OpenStreetMap tiles  
✅ Centered on Earth (zoom 2, lat 20, lng 0)  
✅ Test marker visible and clickable  
✅ Responsive to window resize  
✅ No console errors  
✅ Loads within 3 seconds  
✅ Ready for zoom/pan in next story  

---

**Time estimate:** 25-35 minutes  
**Complexity:** Low (straightforward React-Leaflet setup)  
**Risk:** None (isolated map component)  
**Blocked by:** Story 1.2  
**Blocks:** Story 1.4 (Zoom/Pan)

---

**Status:** ✅ Ready for Implementation

Start with Step 1 (create directories). Each step is independent and can be tested incrementally.
