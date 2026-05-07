import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import '../styles/ManualPinPicker.css';

// Fix for Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface ManualPinPickerProps {
  isOpen: boolean;
  photoTitle: string;
  onCancel: () => void;
  onConfirm: (lat: number, lng: number) => void;
}

/**
 * Center marker that shows the selected coordinate
 */
function CenterMarker({ lat, lng }: { lat: number; lng: number }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng]);

  return <Marker ref={markerRef} position={[lat, lng]} />;
}

/**
 * Map click handler component
 */
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onLocationSelect]);

  return null;
}

export default function ManualPinPicker({
  isOpen,
  photoTitle,
  onCancel,
  onConfirm,
}: ManualPinPickerProps) {
  // Default center: zoom level 3, centered on approximate world center
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 3;

  // Selected coordinate (starts at default center)
  const selectedLat = useRef(defaultCenter[0]);
  const selectedLng = useRef(defaultCenter[1]);

  const handleLocationSelect = (lat: number, lng: number) => {
    selectedLat.current = lat;
    selectedLng.current = lng;
  };

  const handleConfirm = () => {
    onConfirm(selectedLat.current, selectedLng.current);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only if clicking the backdrop itself, not the content
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="picker-backdrop" onClick={handleBackdropClick}>
      <div className="picker-modal">
        {/* Header */}
        <div className="picker-header">
          <h2>Assign Location</h2>
          <p className="picker-subtitle">📍 {photoTitle}</p>
          <button className="picker-close-btn" onClick={onCancel} title="Close picker">
            ✕
          </button>
        </div>

        {/* Map area */}
        <div className="picker-map-container">
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            minZoom={2}
            maxZoom={18}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            dragging={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ZoomControl position="topleft" />

            {/* Center marker */}
            <CenterMarker lat={selectedLat.current} lng={selectedLng.current} />

            {/* Click handler */}
            <MapClickHandler onLocationSelect={handleLocationSelect} />
          </MapContainer>

          {/* Instructions overlay */}
          <div className="picker-instructions">
            <p>👆 Click on the map to select a location</p>
          </div>
        </div>

        {/* Footer */}
        <div className="picker-footer">
          <div className="picker-coordinates">
            <span className="picker-coord-label">Coordinates:</span>
            <span className="picker-coord-value">
              {selectedLat.current.toFixed(4)}°, {selectedLng.current.toFixed(4)}°
            </span>
          </div>

          <div className="picker-actions">
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn-confirm" onClick={handleConfirm}>
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
