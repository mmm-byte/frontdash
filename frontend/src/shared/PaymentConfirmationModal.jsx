import React, { useEffect, useState } from "react";
import "../styles/PaymentConfirmationModal.css"; // optional for custom styles

const PaymentConfirmationModal = ({ show, onComplete, orderNumber, orderPlacedAt, discount = 0, pointsEarned = 0, customerData = null }) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

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

  // Calculate estimated delivery time (30-40 minutes from order placement)
  const getEstimatedDelivery = (placedAt) => {
    if (!placedAt) return '30-40 mins';
    const estimatedMinutes = 30 + Math.floor(Math.random() * 11); // Random between 30-40 minutes
    const deliveryTime = new Date(new Date(placedAt).getTime() + estimatedMinutes * 60000);
    return deliveryTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  useEffect(() => {
    if (show) {
      setLoading(true);
      setSuccess(false);

      const timer1 = setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 3000); // 3 seconds loading

      const timer2 = setTimeout(() => {
        onComplete();
      }, 7000); // total 7 seconds before redirect

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="payment-modal-backdrop">
      <div className="payment-modal-content">
        {loading && (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Processing Payment...</p>
          </div>
        )}
        {success && (
          <div className="success-container">
            <div className="green-tick">✔</div>
            <p>Order Placed!</p>
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
                  <strong>Estimated Delivery:</strong> {getEstimatedDelivery(orderPlacedAt)}
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
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
