import { MapContainer, TileLayer, Marker, ZoomControl, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
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
 * Center marker that shows the selected coordinate (draggable)
 */
function CenterMarker({
  lat,
  lng,
  onDragEnd,
}: {
  lat: number;
  lng: number;
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng]);

  const handleDragEnd = () => {
    if (markerRef.current) {
      const { lat: newLat, lng: newLng } = markerRef.current.getLatLng();
      onDragEnd(newLat, newLng);
    }
  };

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      draggable={true}
      eventHandlers={{
        dragend: handleDragEnd,
      }}
      title="Drag to adjust location"
    >
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Selected Location</p>
          <p style={{ margin: '0', fontSize: '12px' }}>
            {lat.toFixed(4)}°, {lng.toFixed(4)}°
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666' }}>
            Drag to reposition
          </p>
        </div>
      </Popup>
    </Marker>
  );
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

  // Selected coordinate state
  const [selectedLat, setSelectedLat] = useState(defaultCenter[0]);
  const [selectedLng, setSelectedLng] = useState(defaultCenter[1]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
  };

  const handleConfirm = () => {
    onConfirm(selectedLat, selectedLng);
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
            <CenterMarker
              lat={selectedLat}
              lng={selectedLng}
              onDragEnd={handleMarkerDragEnd}
            />

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
            <span className="picker-coord-label">📍 Selected:</span>
            <span className="picker-coord-value">
              {selectedLat.toFixed(4)}°, {selectedLng.toFixed(4)}°
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
