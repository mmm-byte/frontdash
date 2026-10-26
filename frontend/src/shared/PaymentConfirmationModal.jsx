import React, { useEffect } from "react";
import "../styles/PaymentConfirmationModal.css"; // optional for custom styles

const PaymentConfirmationModal = ({ show, onComplete, orderNumber, orderPlacedAt, discount = 0, pointsEarned = 0, customerData = null }) => {
  // Format date and time
  const formatDateTime = (date) => {
    if (!date) return '';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return new Date(date).toLocaleString('en-US', options);
  };

  useEffect(() => {
    if (!show) return undefined;
    const timer = setTimeout(onComplete, 7000);
    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="payment-modal-backdrop">
      <div className="payment-modal-content">
          <div className="success-container">
            <div className="green-tick">✔</div>
            <p>Order confirmed</p>
            {orderNumber && (
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>Order #: {orderNumber}</p>
            )}
            {orderPlacedAt && (
              <>
                <p style={{ fontSize: '0.95rem', marginBottom: '5px' }}>
                  <strong>Order Date & Time:</strong><br />
                  {formatDateTime(orderPlacedAt)}
                </p>
                <p style={{ fontSize: '0.95rem', marginBottom: '15px' }}>
                  <strong>Estimated delivery:</strong> 30–40 minutes (demo estimate)
                </p>
              </>
            )}

            {customerData && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                  <i className="bi bi-star-fill" style={{ marginRight: '8px' }}></i>
                  Rewards Summary
                </div>
                {discount > 0 && (
                  <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
                    ✓ Discount Applied: ${discount.toFixed(2)}
                  </div>
                )}
                {pointsEarned > 0 && (
                  <div style={{ fontSize: '0.9rem' }}>
                    ✓ Points Earned: {pointsEarned} points
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', marginTop: '10px', opacity: 0.9 }}>
                  Thank you for being a valued customer!
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
