import { useRef } from 'react';
import '../styles/UploadButton.css';

interface UploadButtonProps {
  onFilesSelected: (files: File[]) => void;
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

export default function UploadButton({ onFilesSelected }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate files
    const validImages: File[] = [];
    let hasInvalidType = false;
    let hasOversizeFile = false;
    let oversizeFileName = '';

    for (const file of selectedFiles) {
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

    // Show errors via console or could be passed to parent if needed
    if (hasOversizeFile) {
      console.warn(
        `File "${oversizeFileName}" is too large (max 10MB). Please choose a smaller photo.`
      );
      alert(
        `File "${oversizeFileName}" is too large (max 10MB). Please choose a smaller photo.`
      );
    } else if (hasInvalidType) {
      console.warn('Only image files are accepted (JPG, PNG, HEIC, WebP)');
      alert('Only image files are accepted (JPG, PNG, HEIC, WebP)');
    }

    if (validImages.length > 0) {
      onFilesSelected(validImages);
    }

    // Reset input so selecting the same file again triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <button className="upload-button" onClick={handleButtonClick} title="Click to upload photos">
        <span className="upload-icon">📸</span>
        <span className="upload-label">Upload Photo</span>
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_IMAGE_TYPES.map((type) => {
          const ext = type.split('/')[1];
          return `.${ext}`;
        }).join(',')}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
}
