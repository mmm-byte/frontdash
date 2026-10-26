import React from 'react';

const OrderSummary = ({
  cart = [],
  deliveryAddress = {},
  subtotal = 0,
  serviceCharge = 0,
  tip = 0,
  total = 0,
  discount = 0,
  customerData = null
}) => {
  // Get current date and time for order
  const orderTime = new Date();
  const orderTimeString = orderTime.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="card border-0 shadow-lg rounded-4 glass-card">
      {/* Header */}
      <div className="card-header border-0 text-white p-4 gradient-header-green rounded-top-4">
        <div className="d-flex align-items-center">
          <div className="rounded-circle me-3 d-flex align-items-center justify-content-center bg-white bg-opacity-20"
               style={{ width: '48px', height: '48px' }}>
            <i className="bi bi-receipt text-white fs-5"></i>
          </div>
          <div>
            <h5 className="mb-0 fw-bold">Order Summary</h5>
            <small className="opacity-75">
              {cart.length} item{cart.length !== 1 ? 's' : ''} • ${total.toFixed(2)} • {orderTimeString}
            </small>
          </div>
        </div>
      </div>

      <div className="card-body p-4">
        {/* Order Items */}
        {cart.length > 0 && (
          <div className="mb-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <i className="bi bi-bag-check me-2 text-success"></i>
              Items Ordered
            </h6>
            <div className="list-group list-group-flush">
              {cart.map((item, index) => (
                <div key={index} className="list-group-item border-0 px-0 d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-dark">{item.name}</div>
                    <small className="text-muted">Qty: {item.quantity}</small>
                  </div>
                  <div className="fw-bold text-primary fs-6">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {Object.keys(deliveryAddress).length > 0 && (
          <div className="mb-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <i className="bi bi-geo-alt me-2 text-primary"></i>
              Delivery Address
            </h6>
            <div className="alert alert-success border-0 rounded-3 mb-0" role="alert">
              <div className="fw-semibold">
                {deliveryAddress.streetName ? (
                  <>
                    {deliveryAddress.buildingNumber} {deliveryAddress.streetName}{deliveryAddress.apartment ? `, ${deliveryAddress.apartment}` : ''}
                  </>
                ) : (
                  deliveryAddress.street
                )}
              </div>
              <div className="text-muted small">
                {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zip || ''}
              </div>
              {deliveryAddress.contactName && (
                <div className="text-muted small">Contact: {deliveryAddress.contactName} • {deliveryAddress.contactPhone}</div>
              )}
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="border-top pt-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-calculator me-2 text-info"></i>
            Price Breakdown
          </h6>

          <div className="row g-2">
            <div className="col-6">
              <span className="text-muted">Subtotal</span>
            </div>
            <div className="col-6 text-end">
              <span className="fw-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="col-6">
              <span className="text-muted">Tax & Fees</span>
            </div>
            <div className="col-6 text-end">
              <span className="fw-medium">${serviceCharge.toFixed(2)}</span>
            </div>

            <div className="col-6">
              <span className="text-muted">Tip</span>
            </div>
            <div className="col-6 text-end">
              <span className="fw-medium">${tip.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <>
                <div className="col-6">
                  <span className="text-success">
                    <i className="bi bi-star-fill me-1"></i>
                    {customerData ? (
                      <>Customer Discount {customerData.loyaltyPoints >= 100 ? '(50%)' : '(10%)'}</>
                    ) : (
                      'Discount'
                    )}
                  </span>
                </div>
                <div className="col-6 text-end">
                  <span className="text-success fw-medium">-${discount.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="col-6">
              <span className="text-muted">Delivery Fee</span>
            </div>
            <div className="col-6 text-end">
              <span className="text-success fw-medium">FREE</span>
            </div>

            <div className="col-12">
              <hr className="my-3" />
            </div>

            <div className="col-6">
              <span className="fs-5 fw-bold text-dark">Total</span>
            </div>
            <div className="col-6 text-end">
              <span className="fs-4 fw-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Estimated Delivery Time */}
        <div className="mt-4">
          <div className="alert alert-light border rounded-3 text-center py-3" role="alert">
            <div className="d-flex align-items-center justify-content-center mb-2">
              <i className="bi bi-clock-fill text-success fs-5 me-2"></i>
              <span className="fw-bold text-success">Estimated Delivery</span>
            </div>
            <div className="text-muted fw-medium">30-40 minutes</div>
          </div>
        </div>
      </div>

      {/* Custom Styles - inline styles moved to CSS modules or removed */}
    </div>
  );
};

export default OrderSummary;
