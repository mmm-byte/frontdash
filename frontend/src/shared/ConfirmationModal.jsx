import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger" // danger, warning, primary, etc.
}) => {
  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header
        closeButton
        style={{
          backgroundColor: variant === 'danger' ? '#fef2f2' : '#fff7ed',
          borderBottom: `2px solid ${variant === 'danger' ? '#fee2e2' : '#fed7aa'}`
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: variant === 'danger' ? '#fee2e2' : '#fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}
          >
            <AlertTriangle
              size={20}
              color={variant === 'danger' ? '#dc2626' : '#f59e0b'}
            />
          </div>
          <span style={{ color: '#1f2937', fontWeight: '600' }}>{title}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '1.5rem 1.5rem' }}>
        <p style={{
          color: '#4b5563',
          fontSize: '1rem',
          lineHeight: '1.6',
          margin: 0
        }}>
          {message}
        </p>
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <Button
          variant="outline-secondary"
          onClick={onHide}
          style={{
            borderRadius: '8px',
            padding: '0.5rem 1.25rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          style={{
            borderRadius: '8px',
            padding: '0.5rem 1.25rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
