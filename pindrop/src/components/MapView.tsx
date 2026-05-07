import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { usePolling } from '../hooks/usePolling';
import PinGallery, { type GalleryPhoto } from './PinGallery';
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

/**
 * Component that handles bounds fitting when photos change
 * Must be inside MapContainer to access useMap hook
 */
function BoundsFitter({
  markers,
}: {
  markers: Array<{ id: string; lat: number; lng: number; title: string }>;
}) {
  const map = useMap();
  const previousMarkersRef = useRef<number>(0);

  useEffect(() => {
    // Only fit bounds if markers have changed and we have markers
    if (markers.length > 0 && markers.length !== previousMarkersRef.current) {
      previousMarkersRef.current = markers.length;

      // Create bounds from all marker positions
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));

      // Fit map to bounds with padding
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [markers, map]);

  return null;
}

export default function MapView({ photos: propPhotos }: MapViewProps) {
  // Use polling hook to fetch photos every 30 seconds
  const { photos: polledPhotos, loading } = usePolling();

  // Gallery state
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);

  // Default map center (Earth view)
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;
  const minZoom = 1;
  const maxZoom = 18;

  // Use polled photos, fallback to prop photos or empty array
  const markers = polledPhotos.length > 0 ? polledPhotos : propPhotos || [];
  const pinCount = markers.length;

  const handleMarkerClick = (lat: number, lng: number) => {
    // Find all photos at this exact location (same lat/lng)
    const photosAtLocation = markers.filter(
      (photo) =>
        Math.abs(photo.lat - lat) < 0.00001 && Math.abs(photo.lng - lng) < 0.00001
    );

    if (photosAtLocation.length > 0) {
      setSelectedLocation({ lat, lng });
      setGalleryPhotos(
        photosAtLocation.map((photo) => ({
          id: photo.id,
          title: photo.title,
          lat: photo.lat,
          lng: photo.lng,
          file_url: (photo as any).file_url,
        }))
      );
    }
  };

  const handleGalleryClose = () => {
    setSelectedLocation(null);
    setGalleryPhotos([]);
  };

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

        {/* Auto-fit bounds when markers change */}
        <BoundsFitter markers={markers} />

        {/* Render markers for each photo at correct GPS coordinates */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            title={marker.title}
            eventHandlers={{
              click: () => handleMarkerClick(marker.lat, marker.lng),
            }}
          >
            <Popup maxWidth={300}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>
                  {marker.title}
                </p>
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                  {marker.lat.toFixed(4)}°, {marker.lng.toFixed(4)}°
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#27ae60' }}>
                  Click to view gallery →
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pin count indicator */}
        {pinCount > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              backgroundColor: 'rgba(44, 62, 80, 0.9)',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '4px',
              zIndex: 500,
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            📍 {pinCount} photo{pinCount > 1 ? 's' : ''} on map
          </div>
        )}

        {/* Loading indicator overlay */}
        {loading && pinCount === 0 && (
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

      {/* Photo gallery modal */}
      <PinGallery
        isOpen={selectedLocation !== null}
        photos={galleryPhotos}
        location={selectedLocation}
        onClose={handleGalleryClose}
      />
    </div>
  );
}
