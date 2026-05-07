import { useState } from 'react';
import MapView from '../components/MapView';
import DropZone from '../components/DropZone';
import UploadButton from '../components/UploadButton';
import LocationDisclosureModal from '../components/LocationDisclosureModal';
import '../styles/MapPage.css';

export default function MapPage() {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    // Show location disclosure modal before any upload
    setPendingFiles(files);
    setShowDisclosure(true);
  };

  const handleDisclosureConfirm = () => {
    // User confirmed - proceed to EXIF extraction (Story 2.4)
    setShowDisclosure(false);
    setUploadStatus(`Processing ${pendingFiles.length} file(s)...`);
    console.log('User confirmed location sharing. Proceeding with:', pendingFiles);

    // TODO: Story 2.4 - Extract EXIF GPS coordinates
    // For now, simulate processing
    setTimeout(() => {
      setUploadStatus(`${pendingFiles.length} file(s) processed. Ready for upload.`);
      setTimeout(() => {
        setUploadStatus(null);
        setPendingFiles([]);
      }, 3000);
    }, 1000);
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
