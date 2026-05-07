import { useState } from 'react';
import MapView from '../components/MapView';
import DropZone from '../components/DropZone';
import UploadButton from '../components/UploadButton';
import LocationDisclosureModal from '../components/LocationDisclosureModal';
import ErrorModal from '../components/ErrorModal';
import { extractGPSFromPhotos, type PhotoWithLocation, type PhotoWithoutLocation } from '../lib/exif';
import { useUnlocatedPhotos } from '../hooks/useUnlocatedPhotos';
import '../styles/MapPage.css';

export default function MapPage() {
  const { addPhotos: addUnlocatedPhotos } = useUnlocatedPhotos();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [geotaggedPhotos, setGeotaggedPhotos] = useState<PhotoWithLocation[]>([]);
  const [unlocatedPhotos, setUnlocatedPhotos] = useState<PhotoWithoutLocation[]>([]);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [retryFn, setRetryFn] = useState<(() => void) | null>(null);

  const handleFilesSelected = (files: File[]) => {
    // Show location disclosure modal before any upload
    setPendingFiles(files);
    setShowDisclosure(true);
  };

  const handleDisclosureConfirm = async () => {
    // User confirmed - proceed to EXIF extraction (Story 2.4)
    setShowDisclosure(false);
    setUploadStatus(`Extracting GPS data from ${pendingFiles.length} file(s)...`);

    try {
      // Extract GPS from all files
      const { geotagged, unlocated } = await extractGPSFromPhotos(pendingFiles);

      setGeotaggedPhotos(geotagged);
      setUnlocatedPhotos(unlocated);

      // Save unlocated photos to persistent storage
      if (unlocated.length > 0) {
        addUnlocatedPhotos(
          unlocated.map((p) => ({
            id: p.id,
            file: p.file,
            title: p.title,
            error: p.error,
          }))
        );
      }

      // If photos have GPS, proceed to upload
      if (geotagged.length > 0) {
        setUploadStatus(`Uploading ${geotagged.length} photo(s) to the map...`);
        await handlePhotoUpload(geotagged);
      } else if (unlocated.length > 0) {
        setUploadStatus(
          `No GPS data found in photos. ${unlocated.length} photo(s) saved to Unlocated Photos.`
        );

        // Clear status after 3 seconds
        setTimeout(() => {
          setUploadStatus(null);
          setPendingFiles([]);
        }, 3000);
      }

      console.log('GPS Extraction Results:', { geotagged, unlocated });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to extract GPS data';
      setError({
        title: 'GPS Extraction Failed',
        message,
      });
      setRetryFn(() => handleDisclosureConfirm);
      console.error('EXIF extraction error:', error);
    }
  };

  const handlePhotoUpload = async (photos: PhotoWithLocation[]) => {
    const { uploadPhoto } = await import('../lib/supabase');

    try {
      let successCount = 0;
      let errorCount = 0;
      let lastError: Error | null = null;

      // Upload each photo sequentially
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const progress = Math.round(((i + 1) / photos.length) * 100);
        setUploadStatus(`Uploading ${i + 1} of ${photos.length}...`);
        setUploadProgress(progress);

        try {
          await uploadPhoto({
            file: photo.file,
            lat: photo.lat,
            lng: photo.lng,
          });
          successCount++;
        } catch (error) {
          errorCount++;
          lastError = error instanceof Error ? error : new Error(String(error));
          console.error(`Failed to upload ${photo.title}:`, error);
        }
      }

      // Show final results
      if (successCount > 0) {
        setUploadStatus(
          `✓ ${successCount} photo(s) uploaded! Pin${successCount > 1 ? 's' : ''} added to map. ${errorCount > 0 ? `${errorCount} photo(s) failed.` : ''}`
        );
        setUploadProgress(100);
        // Clear status after 4 seconds
        setTimeout(() => {
          setUploadStatus(null);
          setUploadProgress(0);
          setPendingFiles([]);
          setGeotaggedPhotos([]);
        }, 4000);
      } else if (lastError) {
        // All uploads failed - show error modal
        setUploadProgress(0);
        setError({
          title: 'Upload Failed',
          message: `Could not upload photos: ${lastError.message}`,
        });
        setRetryFn(() => handlePhotoUpload(photos));
      }
    } catch (error) {
      setUploadProgress(0);
      const message = error instanceof Error ? error.message : 'Upload failed';
      setError({
        title: 'Upload Error',
        message,
      });
      setRetryFn(() => handlePhotoUpload(photos));
      console.error('Upload error:', error);
    }
  };

  const handleDisclosureCancel = () => {
    // User cancelled - discard files and close modal
    setShowDisclosure(false);
    setPendingFiles([]);
    setUploadStatus(null);
  };

  const handleErrorDismiss = () => {
    setError(null);
    setRetryFn(null);
    setUploadStatus(null);
    setPendingFiles([]);
  };

  const handleErrorRetry = () => {
    if (retryFn) {
      retryFn();
    }
    setError(null);
  };

  return (
    <div className="map-page">
      <div className="map-wrapper">
        <DropZone onFilesSelected={handleFilesSelected}>
          <MapView />
        </DropZone>

        {/* Upload button (always visible) */}
        <UploadButton onFilesSelected={handleFilesSelected} />

        {/* Location disclosure modal */}
        <LocationDisclosureModal
          isOpen={showDisclosure}
          fileCount={pendingFiles.length}
          onConfirm={handleDisclosureConfirm}
          onCancel={handleDisclosureCancel}
        />

        {/* Error modal */}
        <ErrorModal
          isOpen={error !== null}
          title={error?.title}
          message={error?.message || ''}
          onDismiss={handleErrorDismiss}
          onRetry={handleErrorRetry}
          showRetry={retryFn !== null}
        />

        {/* Upload status message */}
        {uploadStatus && (
          <div className="upload-status">
            <p>{uploadStatus}</p>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
