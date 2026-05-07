import { useState } from 'react';
import '../styles/DropZone.css';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  children: React.ReactNode;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export default function DropZone({ onFilesSelected, children }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
    setDragError(null);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to inactive if leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);

    // Validate files
    const validImages: File[] = [];
    let hasInvalidType = false;
    let hasOversizeFile = false;
    let oversizeFileName = '';

    for (const file of droppedFiles) {
      // Check file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        hasInvalidType = true;
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        hasOversizeFile = true;
        oversizeFileName = file.name;
        continue;
      }

      validImages.push(file);
    }

    // Show appropriate error
    if (hasOversizeFile) {
      setDragError(
        `File "${oversizeFileName}" is too large (max 10MB). Please choose a smaller photo.`
      );
      setTimeout(() => setDragError(null), 4000);
    } else if (hasInvalidType) {
      setDragError('Only image files are accepted (JPG, PNG, HEIC, WebP)');
      setTimeout(() => setDragError(null), 3000);
    }

    // Pass valid files to parent handler
    if (validImages.length > 0) {
      onFilesSelected(validImages);
    }
  };

  return (
    <div
      className="drop-zone"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {/* Drop zone overlay */}
      {isDragActive && (
        <div className="drop-zone-overlay">
          <div className="drop-zone-content">
            <p className="drop-zone-text">Drop your photos here</p>
            {dragError && (
              <p className="drop-zone-error">{dragError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
