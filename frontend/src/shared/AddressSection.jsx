// src/components/AddressSection.jsx
import React from "react";

const AddressSection = ({ address, onEdit }) => {
  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title">Delivery Address</h5>
          <p>
            {address.street || "Street not set"}, {address.city || "City not set"},{" "}
            {address.state || "State not set"} - {address.zip || "ZIP not set"}
          </p>
        </div>
        <button className="btn btn-outline-primary" onClick={onEdit}>
          Edit Address
        </button>
      </div>
    </div>
  );
};

export default AddressSection;
