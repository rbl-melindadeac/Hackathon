import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { usePolling } from '../hooks/usePolling';
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

export default function MapView({ photos: propPhotos }: MapViewProps) {
  // Use polling hook to fetch photos every 30 seconds
  const { photos: polledPhotos, loading } = usePolling();

  // Default map center (Earth view)
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;
  const minZoom = 1;
  const maxZoom = 18;

  // Use polled photos, fallback to prop photos or empty array
  const markers = polledPhotos.length > 0 ? polledPhotos : propPhotos || [];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        zoomControl={false}
        dragging={true}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap tiles (free, no API key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Zoom controls (top-left corner) */}
        <ZoomControl position="topleft" />

        {/* Render markers for each photo */}
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>
              <p>{marker.title}</p>
            </Popup>
          </Marker>
        ))}

        {/* Loading indicator overlay */}
        {loading && markers.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '4px',
              zIndex: 1000,
              fontSize: '12px',
            }}
          >
            Loading photos...
          </div>
        )}
      </MapContainer>
    </div>
  );
}
