import { useState, useEffect } from 'react';
import { useUnlocatedPhotos } from '../hooks/useUnlocatedPhotos';
import { triggerPhotosRefetch } from '../hooks/usePolling';
import ManualPinPicker from '../components/ManualPinPicker';
import { uploadPhoto } from '../lib/supabase';
import '../styles/UnlocatedPage.css';

export default function UnlocatedPage() {
  const { photos, loading, removePhoto } = useUnlocatedPhotos();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId);

  useEffect(() => {
    const urls: Record<string, string> = {};
    photos.forEach((photo) => {
      urls[photo.id] = URL.createObjectURL(photo.file);
    });
    setPhotoUrls(urls);

    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const handlePinManually = (photoId: string) => {
    // Open map picker for this photo
    setSelectedPhotoId(photoId);
    setShowPicker(true);
    setStatus(null);
  };

  const handlePickerCancel = () => {
    setShowPicker(false);
  };

  const handlePickerConfirm = async (lat: number, lng: number) => {
    if (!selectedPhoto) return;

    setStatus(`Pinning ${selectedPhoto.title}...`);

    try {
      // Upload the photo with the manually selected coordinates
      await uploadPhoto({
        file: selectedPhoto.file,
        lat,
        lng,
      });

      // Remove from unlocated photos
      removePhoto(selectedPhoto.id);

      // Refetch photos to update the map immediately
      triggerPhotosRefetch();

      // Show success message
      setStatus(
        `✓ Photo pinned! Check the map to see it. (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`
      );

      // Close picker
      setShowPicker(false);

      // Clear status after 3 seconds
      setTimeout(() => {
        setStatus(null);
        setSelectedPhotoId(null);
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save coordinates';
      setStatus(`Error: ${message}`);
      console.error('Failed to save coordinates:', error);

      // Clear error after 4 seconds
      setTimeout(() => {
        setStatus(null);
      }, 4000);
    }
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
              {/* Photo thumbnail */}
              <div className="photo-thumbnail">
                {photoUrls[photo.id] ? (
                  <img
                    src={photoUrls[photo.id]}
                    alt={photo.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="thumbnail-placeholder">
                    <p>📷</p>
                  </div>
                )}
              </div>

              {/* Photo info */}
              <div className="photo-info">
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

      {/* Status message (modal) */}
      {status && (
        <div className={`status-message ${status.startsWith('✓') ? 'success' : status.startsWith('Error') ? 'error' : 'info'}`}>
          <div className="status-message-content">
            <div className="status-message-header">
              <h2>
                {status.startsWith('✓') ? 'Success' : status.startsWith('Error') ? 'Error' : 'Info'}
              </h2>
            </div>
            <div className="status-message-body">
              <p>{status.replace(/^[✓Error:]*\s*/, '')}</p>
            </div>
          </div>
        </div>
      )}

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
