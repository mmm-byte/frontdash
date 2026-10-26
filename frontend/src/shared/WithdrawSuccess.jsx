import React from "react";

const WithdrawSuccess = () => {
  return (
    <div className="modal-overlay">
      <div className="modal-box success-box">
        <div className="checkmark">&#10003;</div>
        <h5>Request Sent!</h5>
        <p>Your withdrawal request has been successfully submitted.</p>
      </div>
    </div>
  );
};

export default WithdrawSuccess;
