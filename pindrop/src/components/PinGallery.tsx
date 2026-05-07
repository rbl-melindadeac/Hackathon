import { useState } from 'react';
import PhotoDetail from './PhotoDetail';
import '../styles/PinGallery.css';

export interface GalleryPhoto {
  id: string;
  title: string;
  lat: number;
  lng: number;
  file_url?: string;
}

interface PinGalleryProps {
  isOpen: boolean;
  photos: GalleryPhoto[];
  location: { lat: number; lng: number; name?: string } | null;
  onClose: () => void;
  onPhotoSelect?: (photo: GalleryPhoto) => void;
}

export default function PinGallery({
  isOpen,
  photos,
  location,
  onClose,
  onPhotoSelect: _onPhotoSelect,
}: PinGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  if (!isOpen || !location) return null;

  const selectedPhoto = photos[selectedIndex];

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setShowDetail(true);
  };

  const handleDetailClose = () => {
    setShowDetail(false);
  };

  const handleDetailNavigate = (index: number) => {
    setSelectedIndex(index);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only if clicking the backdrop itself, not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="gallery-backdrop" onClick={handleBackdropClick}>
      <div className="gallery-modal">
        {/* Header */}
        <div className="gallery-header">
          <h2>
            📍 {location.name || `${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°`}
          </h2>
          <button className="gallery-close-btn" onClick={onClose} title="Close gallery">
            ✕
          </button>
        </div>

        {/* Main content - Grid of thumbnails */}
        <div className="gallery-content">
          <div className="gallery-grid">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="gallery-grid-item"
                onClick={() => handleThumbnailClick(index)}
                title={photo.title}
              >
                {photo.file_url ? (
                  <img src={photo.file_url} alt={photo.title} />
                ) : (
                  <div className="gallery-grid-placeholder">
                    <span>{index + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="gallery-footer">
          <p className="gallery-count">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </p>
          <button className="gallery-dismiss-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Photo detail view (full-size) */}
      <PhotoDetail
        isOpen={showDetail}
        photo={selectedPhoto || null}
        allPhotos={photos}
        onClose={handleDetailClose}
        onNavigate={handleDetailNavigate}
      />
    </div>
  );
}
