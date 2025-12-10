import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

/**
 * Delete Confirmation Modal Component
 */

const DeleteModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      contentClassName="border-0"
    >
      <div style={{ 
        background: 'rgba(26, 26, 46, 0.98)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Modal.Body className="text-center py-4">
          <div 
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ 
              width: 64, 
              height: 64, 
              background: 'rgba(220, 53, 69, 0.2)'
            }}
          >
            <AlertTriangle size={32} style={{ color: '#dc3545' }} />
          </div>
          
          <h5 className="text-white mb-2">{title}</h5>
          <p className="text-muted mb-4">{message}</p>
          
          <div className="d-flex justify-content-center gap-2">
            <Button 
              variant="secondary" 
              onClick={onHide}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button 
              variant={variant}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default DeleteModal;

