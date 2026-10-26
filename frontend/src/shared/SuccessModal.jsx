// src/components/SuccessModal.jsx
import React from "react";
import { Modal } from "react-bootstrap";

const SuccessModal = ({ show, message }) => {
  return (
    <Modal show={show} centered>
      <Modal.Header>
        <Modal.Title>Success!</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <div style={{ fontSize: "1.2rem" }}>{message}</div>
      </Modal.Body>
    </Modal>
  );
};

export default SuccessModal;
