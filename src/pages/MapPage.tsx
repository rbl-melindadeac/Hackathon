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

      // Show results
      if (geotagged.length > 0 && unlocated.length > 0) {
        setUploadStatus(
          `✓ ${geotagged.length} photo(s) with GPS data ready to upload. ${unlocated.length} photo(s) without GPS data saved.`
        );
      } else if (geotagged.length > 0) {
        setUploadStatus(`✓ ${geotagged.length} photo(s) with GPS data ready to upload.`);
      } else if (unlocated.length > 0) {
        setUploadStatus(
          `No GPS data found in photos. ${unlocated.length} photo(s) saved to Unlocated Photos.`
        );
      }

      console.log('GPS Extraction Results:', { geotagged, unlocated });

      // Clear status after 4 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setPendingFiles([]);
      }, 4000);
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
