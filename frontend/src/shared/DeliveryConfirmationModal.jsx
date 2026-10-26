import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import "../styles/DeliveryConfirmationModal.css"; // add some glass/fancy styling

const DeliveryConfirmationModal = ({ show, onHide, customer }) => {
  useEffect(() => {
    if (show) {
      // Auto-close modal after 2 seconds
      const timer = setTimeout(() => {
        onHide();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
    >
      <div className="glass-modal p-4 text-center">
        <h5>Order Ready for Delivery</h5>
        <p className="mb-0"><strong>{customer}</strong></p>
        <div className="mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeliveryConfirmationModal;
