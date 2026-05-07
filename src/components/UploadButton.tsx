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

export default function UploadButton({ onFilesSelected }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Filter to valid image types
    const validImages = selectedFiles.filter((file) =>
      ALLOWED_IMAGE_TYPES.includes(file.type)
    );

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
