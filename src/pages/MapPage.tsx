import { useState } from 'react';
import MapView from '../components/MapView';
import DropZone from '../components/DropZone';
import UploadButton from '../components/UploadButton';
import LocationDisclosureModal from '../components/LocationDisclosureModal';
import { extractGPSFromPhotos, type PhotoWithLocation, type PhotoWithoutLocation } from '../lib/exif';
import '../styles/MapPage.css';

export default function MapPage() {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [geotaggedPhotos, setGeotaggedPhotos] = useState<PhotoWithLocation[]>([]);
  const [unlocatedPhotos, setUnlocatedPhotos] = useState<PhotoWithoutLocation[]>([]);

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
      setUploadStatus(`Error: ${message}`);
      console.error('EXIF extraction error:', error);

      // Clear status after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setPendingFiles([]);
      }, 3000);
    }
  };

  const handlePhotoUpload = async (photos: PhotoWithLocation[]) => {
    const { uploadPhoto } = await import('../lib/supabase');

    try {
      let successCount = 0;
      let errorCount = 0;

      // Upload each photo sequentially
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setUploadStatus(`Uploading ${i + 1} of ${photos.length}...`);

        try {
          await uploadPhoto({
            file: photo.file,
            lat: photo.lat,
            lng: photo.lng,
            title: photo.title,
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to upload ${photo.title}:`, error);
        }
      }

      // Show final results
      if (successCount > 0) {
        setUploadStatus(
          `✓ ${successCount} photo(s) uploaded! Pin${successCount > 1 ? 's' : ''} added to map. ${errorCount > 0 ? `${errorCount} photo(s) failed.` : ''}`
        );
      } else {
        setUploadStatus(`Failed to upload photos. Please try again.`);
      }

      // Clear status after 4 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setPendingFiles([]);
        setGeotaggedPhotos([]);
      }, 4000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setUploadStatus(`Error: ${message}`);

      // Clear status after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setPendingFiles([]);
      }, 3000);
    }
  };

  const handleDisclosureCancel = () => {
    // User cancelled - discard files and close modal
    setShowDisclosure(false);
    setPendingFiles([]);
    setUploadStatus(null);
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

        {/* Upload status message */}
        {uploadStatus && (
          <div className="upload-status">
            <p>{uploadStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}
