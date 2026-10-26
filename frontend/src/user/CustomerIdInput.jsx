import React from 'react';

const CustomerIdInput = ({ customerId, onCustomerIdChange, disabled = false, onVerify = null, isVerifying = false }) => {
  return (
    <div className="text-end">
      <label className="form-label text-white small mb-1 fw-semibold">
        Customer ID {disabled && <span className="text-success">✓ Verified</span>}
      </label>
      <div className="d-flex gap-2 align-items-center">
        <input
          type="text"
          className="form-control form-control-sm text-dark fw-medium"
          placeholder="custtest123"
          value={customerId}
          onChange={onCustomerIdChange}
          disabled={disabled}
          readOnly={disabled}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && onVerify && !disabled && customerId) {
              e.preventDefault();
              onVerify();
            }
          }}
          style={{
            width: '140px',
            backgroundColor: disabled ? 'rgba(144,238,144,0.2)' : 'rgba(255,255,255,0.95)',
            border: disabled ? '2px solid rgba(40,167,69,0.5)' : '2px solid rgba(255,255,255,0.3)',
            color: '#212529',
            cursor: disabled ? 'not-allowed' : 'text'
          }}
        />
        {onVerify && !disabled && (
          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={onVerify}
            disabled={!customerId || isVerifying}
            style={{
              minWidth: '70px',
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem'
            }}
          >
            {isVerifying ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '0.7rem', height: '0.7rem' }}></span>
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-1"></i>
                Verify
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerIdInput;
