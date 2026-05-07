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
