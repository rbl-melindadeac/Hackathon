import '../styles/LocationDisclosureModal.css';

interface LocationDisclosureModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  fileCount: number;
}

export default function LocationDisclosureModal({
  isOpen,
  onConfirm,
  onCancel,
  fileCount,
}: LocationDisclosureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Location Sharing</h2>
        </div>

        <div className="modal-body">
          <p className="disclosure-text">
            This photo{fileCount > 1 ? 's' : ''} GPS location will be visible to everyone on the map.
          </p>
          <p className="disclosure-subtext">
            Make sure you're comfortable sharing your location before uploading.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
