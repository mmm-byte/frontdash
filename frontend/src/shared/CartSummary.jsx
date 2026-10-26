// src/components/CartSummary.jsx
import React from "react";

const CartSummary = ({ subtotal, tax, tip, setTip, total }) => {
  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Tax (8.25%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Tip:</span>
          <input
            type="number"
            className="form-control w-25"
            value={tip}
            min={0}
            onChange={(e) => setTip(parseFloat(e.target.value))}
          />
        </div>
        <hr />
        <div className="d-flex justify-content-between fw-bold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
