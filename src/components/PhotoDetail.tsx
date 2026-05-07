import { useEffect } from 'react';
import '../styles/PhotoDetail.css';

export interface DetailPhoto {
  id: string;
  title: string;
  file_url?: string;
}

interface PhotoDetailProps {
  isOpen: boolean;
  photo: DetailPhoto | null;
  allPhotos: DetailPhoto[];
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

export default function PhotoDetail({
  isOpen,
  photo,
  allPhotos,
  onClose,
  onNavigate,
}: PhotoDetailProps) {
  const currentIndex = allPhotos.findIndex((p) => p.id === photo?.id) ?? -1;
  const hasMultiple = allPhotos.length > 1;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasMultiple && onNavigate) {
        onNavigate(currentIndex > 0 ? currentIndex - 1 : allPhotos.length - 1);
      } else if (e.key === 'ArrowRight' && hasMultiple && onNavigate) {
        onNavigate(currentIndex < allPhotos.length - 1 ? currentIndex + 1 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasMultiple, currentIndex, allPhotos.length, onClose, onNavigate]);

  if (!isOpen || !photo) return null;

  const handlePrevious = () => {
    if (onNavigate && hasMultiple) {
      onNavigate(currentIndex > 0 ? currentIndex - 1 : allPhotos.length - 1);
    }
  };

  const handleNext = () => {
    if (onNavigate && hasMultiple) {
      onNavigate(currentIndex < allPhotos.length - 1 ? currentIndex + 1 : 0);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="detail-backdrop" onClick={handleBackdropClick}>
      <div className="detail-container">
        {/* Header */}
        <div className="detail-header">
          <h3>{photo.title}</h3>
          <button className="detail-close-btn" onClick={onClose} title="Close detail view (ESC)">
            ✕
          </button>
        </div>

        {/* Main photo display */}
        <div className="detail-content">
          {photo.file_url ? (
            <img
              src={photo.file_url}
              alt={photo.title}
              className="detail-image"
              loading="lazy"
            />
          ) : (
            <div className="detail-placeholder">
              <p>No image available</p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        {hasMultiple && (
          <>
            <button
              className="detail-nav-btn detail-nav-prev"
              onClick={handlePrevious}
              title="Previous photo (← or ESC + ←)"
            >
              ←
            </button>
            <button
              className="detail-nav-btn detail-nav-next"
              onClick={handleNext}
              title="Next photo (→)"
            >
              →
            </button>
          </>
        )}

        {/* Counter and info */}
        <div className="detail-info">
          {hasMultiple && (
            <span className="detail-counter">
              {currentIndex + 1} / {allPhotos.length}
            </span>
          )}
        </div>

        {/* Footer actions */}
        <div className="detail-footer">
          <button className="detail-back-btn" onClick={onClose}>
            ← Back to Gallery
          </button>
          {hasMultiple && (
            <div className="detail-keyboard-hint">
              💡 Use arrow keys to navigate
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
