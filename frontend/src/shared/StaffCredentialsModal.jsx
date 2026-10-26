import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { CheckCircle, Mail, User, Key, Copy } from 'lucide-react';

const StaffCredentialsModal = ({
  show,
  onHide,
  staffName,
  username,
  password,
  email,
  triggerToast
}) => {
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    if (triggerToast) {
      triggerToast(`${label} copied to clipboard!`, "success");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header
        closeButton
        style={{
          backgroundColor: '#ecfdf5',
          borderBottom: '2px solid #86efac'
        }}
      >
        <Modal.Title className="d-flex align-items-center w-100">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}
          >
            <CheckCircle size={24} color="#16a34a" />
          </div>
          <div>
            <div style={{ color: '#1f2937', fontWeight: '600', fontSize: '1.25rem' }}>
              Staff Member Created Successfully
            </div>
            <small style={{ color: '#6b7280', fontWeight: 'normal' }}>
              Login credentials have been generated
            </small>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '2rem' }}>
        {/* Success Message */}
        <div
          className="alert d-flex align-items-start mb-4"
          style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '8px'
          }}
        >
          <Mail size={20} color="#2563eb" className="me-3 mt-1" />
          <div>
            <div style={{ color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
              Credentials Sent via Email
            </div>
            <div style={{ color: '#3b82f6', fontSize: '0.9rem' }}>
              The login credentials below have been sent to <strong>{email}</strong>
            </div>
          </div>
        </div>

        {/* Staff Name */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            STAFF MEMBER
          </label>
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#1f2937'
          }}>
            {staffName}
          </div>
        </div>

        {/* Username */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            <User size={14} className="me-1" />
            USERNAME
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <code style={{
              flex: 1,
              padding: '0.75rem 1rem',
              backgroundColor: '#f1f5f9',
              border: '2px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontFamily: 'monospace',
              fontWeight: '600',
              color: '#0f172a'
            }}>
              {username}
            </code>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => copyToClipboard(username, 'Username')}
              style={{
                borderRadius: '8px',
                padding: '0.5rem 0.75rem'
              }}
              title="Copy username"
            >
              <Copy size={16} />
            </Button>
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            <Key size={14} className="me-1" />
            PASSWORD
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <code style={{
              flex: 1,
              padding: '0.75rem 1rem',
              backgroundColor: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontFamily: 'monospace',
              fontWeight: '600',
              color: '#78350f'
            }}>
              *********
            </code>
          </div>
        </div>

        {/* Important Notice */}
        <div
          className="alert mb-0"
          style={{
            backgroundColor: '#fef9c3',
            border: '1px solid #fde047',
            borderRadius: '8px'
          }}
        >
          <div style={{ color: '#854d0e', fontSize: '0.9rem' }}>
            <strong>Important:</strong> Credentials have been sent to the staff member's email address.
            For security purposes, passwords are not displayed to administrators.
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <Button
          variant="primary"
          onClick={onHide}
          style={{
            borderRadius: '8px',
            padding: '0.5rem 2rem',
            fontWeight: '500',
            backgroundColor: '#16a34a',
            borderColor: '#16a34a'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
        >
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StaffCredentialsModal;
