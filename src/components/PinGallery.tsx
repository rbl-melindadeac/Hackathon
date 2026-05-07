import { useState } from 'react';
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
  onPhotoSelect,
}: PinGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!isOpen || !location) return null;

  const selectedPhoto = photos[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handlePhotoClick = () => {
    if (onPhotoSelect && selectedPhoto) {
      onPhotoSelect(selectedPhoto);
    }
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

        {/* Main content */}
        <div className="gallery-content">
          {/* Large photo preview */}
          <div className="gallery-preview">
            {selectedPhoto?.file_url ? (
              <img
                src={selectedPhoto.file_url}
                alt={selectedPhoto.title}
                onClick={handlePhotoClick}
                style={{ cursor: onPhotoSelect ? 'pointer' : 'default' }}
                title={onPhotoSelect ? 'Click to view full size' : selectedPhoto.title}
              />
            ) : (
              <div className="gallery-placeholder">
                <p>No image URL available</p>
              </div>
            )}
            <p className="gallery-photo-title">{selectedPhoto?.title}</p>
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="gallery-thumbnails">
              <button
                className="gallery-nav-btn gallery-nav-prev"
                onClick={handlePrevious}
                title="Previous photo"
              >
                ←
              </button>

              <div className="gallery-thumbnail-list">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className={`gallery-thumbnail ${index === selectedIndex ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(index)}
                    title={`${index + 1} of ${photos.length}`}
                  >
                    {photo.file_url ? (
                      <img src={photo.file_url} alt={`${index + 1}`} />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <span>{index + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                className="gallery-nav-btn gallery-nav-next"
                onClick={handleNext}
                title="Next photo"
              >
                →
              </button>
            </div>
          )}

          {/* Single photo indicator */}
          {photos.length === 1 && (
            <div className="gallery-single-indicator">
              <p>1 photo from this location</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="gallery-footer">
          <p className="gallery-count">
            {selectedIndex + 1} of {photos.length}
          </p>
          <button className="gallery-dismiss-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
