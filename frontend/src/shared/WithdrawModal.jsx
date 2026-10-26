import React from "react";

const WithdrawModal = ({ onConfirm, onCancel, loading }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h5>Confirm Withdrawal</h5>
        <p>Are you sure you want to withdraw from FrontDash?</p>
        <p className="text-muted small">
          This will submit a withdrawal request to the admin for approval.
        </p>
        <div className="modal-actions">
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Yes, Withdraw'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
