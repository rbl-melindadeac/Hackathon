import { useState } from 'react';
import MapView from '../components/MapView';
import DropZone from '../components/DropZone';
import '../styles/MapPage.css';

export default function MapPage() {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    // Files passed to upload flow (Story 2.5 implements actual upload)
    // For now, show confirmation message
    setUploadStatus(`Received ${files.length} file(s) for upload. Processing...`);
    console.log('Files selected for upload:', files);

    // Clear status after 3 seconds
    setTimeout(() => setUploadStatus(null), 3000);
  };

  return (
    <div className="map-page">
      <div className="map-wrapper">
        <DropZone onFilesSelected={handleFilesSelected}>
          <MapView />
        </DropZone>

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
