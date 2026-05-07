import { useState } from 'react';
import { useUnlocatedPhotos } from '../hooks/useUnlocatedPhotos';
import ManualPinPicker from '../components/ManualPinPicker';
import '../styles/UnlocatedPage.css';

export default function UnlocatedPage() {
  const { photos, loading } = useUnlocatedPhotos();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId);

  const handlePinManually = (photoId: string) => {
    // Open map picker for this photo
    setSelectedPhotoId(photoId);
    setShowPicker(true);
  };

  const handlePickerCancel = () => {
    setShowPicker(false);
  };

  const handlePickerConfirm = (lat: number, lng: number) => {
    // TODO: Story 3.4 & 3.5 - Save coordinates to database and update map
    console.log(`Pin assigned for ${selectedPhoto?.title}:`, { lat, lng });
    setShowPicker(false);
    // Show confirmation
    alert(`Location pinned at ${lat.toFixed(4)}°, ${lng.toFixed(4)}°\n\nStory 3.5 will save this to the map.`);
  };

  if (loading) {
    return (
      <div className="unlocated-page">
        <div className="unlocated-container">
          <p className="loading">Loading unlocated photos...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="unlocated-page">
        <div className="unlocated-container">
          <div className="empty-state">
            <p className="empty-icon">🎉</p>
            <h2>No unlocated photos</h2>
            <p className="empty-message">All your uploads are on the map!</p>
            <p className="empty-subtext">
              Any photos you upload without GPS data will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="unlocated-page">
      <div className="unlocated-container">
        {/* Header */}
        <div className="unlocated-header">
          <h1>📍 Unlocated Photos</h1>
          <p className="unlocated-subheader">
            {photos.length} photo{photos.length > 1 ? 's' : ''} without GPS data
          </p>
        </div>

        {/* Photos grid */}
        <div className="unlocated-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="unlocated-card">
              {/* Photo thumbnail placeholder */}
              <div className="photo-thumbnail">
                <div className="thumbnail-placeholder">
                  <p>📷</p>
                </div>
              </div>

              {/* Photo info */}
              <div className="photo-info">
                <h3 className="photo-title">{photo.title}</h3>
                <p className="photo-explanation">
                  This photo doesn't have GPS data — likely shared via a messaging app which
                  removes location info.
                </p>
                <button
                  className="btn-pin-manually"
                  onClick={() => handlePinManually(photo.id)}
                  title="Assign a location to this photo manually"
                >
                  📌 Pin Manually
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Manual pin picker modal */}
      <ManualPinPicker
        isOpen={showPicker}
        photoTitle={selectedPhoto?.title || ''}
        onCancel={handlePickerCancel}
        onConfirm={handlePickerConfirm}
      />
    </div>
  );
}
