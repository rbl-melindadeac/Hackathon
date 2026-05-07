import '../styles/ErrorModal.css';

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
  showRetry?: boolean;
}

export default function ErrorModal({
  isOpen,
  title = 'Oops, something went wrong',
  message,
  onRetry,
  onDismiss,
  showRetry = true,
}: ErrorModalProps) {
  if (!isOpen) return null;

  const handleRetry = () => {
    onRetry?.();
  };

  return (
    <div className="error-backdrop" onClick={onDismiss}>
      <div className="error-modal" onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className="error-icon">⚠️</div>

        {/* Title */}
        <h2 className="error-title">{title}</h2>

        {/* Message */}
        <p className="error-message">{message}</p>

        {/* Actions */}
        <div className="error-actions">
          <button className="btn-dismiss" onClick={onDismiss}>
            Dismiss
          </button>
          {showRetry && onRetry && (
            <button className="btn-retry" onClick={handleRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
