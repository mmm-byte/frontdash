import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ValidationErrorModal = ({ show, onHide, errorCount }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>
          <i className="fas fa-exclamation-triangle me-2"></i>
          Required Fields Missing
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <div className="display-1 text-danger mb-3">⚠️</div>
          <h5 className="mb-3">Please fill in all required fields!</h5>
          <p className="text-muted">
            We found <strong>{errorCount}</strong> required field{errorCount > 1 ? 's' : ''} that need{errorCount === 1 ? 's' : ''} to be completed.
          </p>
          <p className="text-muted small">
            Required fields are marked with red asterisks (*) and will show warning icons when incomplete.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          Got it, let me fix them
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ValidationErrorModal;
