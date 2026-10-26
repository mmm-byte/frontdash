import React, { useState } from 'react';
import { Modal, Button, Row, Col, Alert } from 'react-bootstrap';
import { User, Mail, Key, Shield, Calendar, CheckCircle } from 'lucide-react';
import { generateTempPassword } from "../utils/security";

const StaffDetailModal = ({ show, onHide, staff, onUpdateStaff, onCreateCredentials }) => {
  const [newCredentialsNotice, setNewCredentialsNotice] = useState(false);

  const handleCreateNewCredentials = async () => {
    // Regenerate username remains the same; only reset password
    const tempPassword = generateTempPassword(8);
    setNewCredentialsNotice(true);

    // Update staff with new plaintext password per requirement
    onUpdateStaff({ ...staff, password: tempPassword });
    if (onCreateCredentials) onCreateCredentials();
  };

  const resetCredentials = () => {
    setNewCredentialsNotice(false);
  };

  if (!staff) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <User className="me-2" size={24} />
          Staff Member Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row>
          <Col md={4} className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#e2e8f0',
                borderRadius: '50%',
                fontSize: '48px',
                color: '#64748b'
              }}
            >
              <User size={60} />
            </div>
            <h5 className="fw-bold text-dark">{staff.fullName}</h5>
            <p className="text-muted mb-0">Staff Member</p>
            <span className="badge bg-success mt-2">
              <CheckCircle size={14} className="me-1" />
              Active
            </span>
          </Col>

          <Col md={8}>
            <div className="mb-4">
              <h6 className="text-muted mb-3">Contact Information</h6>
              <div className="d-flex align-items-center mb-3">
                <Mail size={16} className="text-primary me-2" />
                <strong className="me-2">Email:</strong>
                <span>{staff.email}</span>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-3">Login Credentials</h6>
              <div className="d-flex align-items-center mb-3">
                <User size={16} className="text-primary me-2" />
                <strong className="me-2">Username:</strong>
                <code className="bg-light p-2 rounded">{staff.username || 'Not assigned'}</code>
              </div>
              <div className="d-flex align-items-center mb-3">
                <Key size={16} className="text-primary me-2" />
                <strong className="me-2">Password:</strong>
                <span className="text-muted">Password is hidden for security. You can reset it below.</span>
              </div>
            </div>

            {newCredentialsNotice && (
              <Alert variant="success" className="mb-4">
                <h6 className="alert-heading d-flex align-items-center">
                  <CheckCircle size={16} className="me-2" />
                  Password Reset Successful
                </h6>
                <p className="mb-2">
                  A new temporary password has been generated and saved securely. The staff member will receive it via email.
                </p>
                <small className="text-muted">
                  For security reasons, passwords are never displayed.
                </small>
              </Alert>
            )}

            <div className="mb-4">
              <h6 className="text-muted mb-3">Account Management</h6>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleCreateNewCredentials}
                  disabled={!!newCredentialsNotice}
                >
                  <Shield size={16} className="me-2" />
                  {staff.username ? 'Reset Password' : 'Create Login Credentials'}
                </Button>
                {newCredentialsNotice && (
                  <Button variant="outline-secondary" onClick={resetCredentials}>
                    Reset
                  </Button>
                )}
              </div>
              <small className="text-muted d-block mt-2">
                {staff.username
                  ? 'Reset the password for this staff member. The new password will be emailed.'
                  : 'Create login credentials so this staff member can access the system'
                }
              </small>
            </div>

            <div>
              <h6 className="text-muted mb-3">Additional Information</h6>
              <div className="d-flex align-items-center">
                <Calendar size={16} className="text-primary me-2" />
                <strong className="me-2">Added:</strong>
                <span>{staff.addedDate || new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={onHide}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StaffDetailModal;
