import React from "react";

// Modular Components
const CartHeader = ({ itemCount, total }) => (
  <div
    className="card-header border-0 text-white p-4"
    style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}
  >
    <div className="d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <div
          className="rounded-circle me-2 d-flex align-items-center justify-content-center"
          style={{
            width: '36px', height: '36px',
            background: 'rgba(255,255,255,0.2)'
          }}
        >
          <i className="bi bi-cart3 text-white"></i>
        </div>
        <div>
          <h6 className="mb-0 fw-bold">Your Order</h6>
          <small className="opacity-75">{itemCount} items</small>
        </div>
      </div>
      {itemCount > 0 && (
        <div className="text-end">
          <div className="fw-bold">${total.toFixed(2)}</div>
        </div>
      )}
    </div>
  </div>
);

const EmptyCart = () => (
  <div className="text-center p-5">
    <div
      className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
      style={{
        width: '80px', height: '80px',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}
    >
      <i className="bi bi-cart-x text-muted fs-2"></i>
    </div>
    <p className="text-muted mb-0">Your cart is empty</p>
    <small className="text-muted">Add items to get started</small>
  </div>
);

const CartItem = ({ item, onRemove }) => (
  <div
    className="p-3 border-bottom position-relative"
    style={{
      borderColor: 'rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
      background: 'transparent'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
    }}
  >
    <div className="d-flex align-items-start">
      <div className="flex-grow-1">
        <h6 className="mb-1 fw-semibold" style={{ fontSize: '0.9rem' }}>
          {item.name}
        </h6>
        <div className="d-flex align-items-center justify-content-between">
          <small className="text-muted">
            <span
              className="badge rounded-pill me-2"
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                fontSize: '0.7rem'
              }}
            >
              {item.quantity}x
            </span>
            ${item.price} each
          </small>
          <div className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>
            ${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      </div>
      <RemoveButton onRemove={() => onRemove(item.name)} />
    </div>
  </div>
);

const RemoveButton = ({ onRemove }) => (
  <button
    className="btn btn-sm ms-2"
    onClick={onRemove}
    style={{
      width: '28px', height: '28px', padding: '0',
      border: 'none', borderRadius: '50%',
      background: 'rgba(220, 53, 69, 0.1)',
      color: '#dc3545',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = '#dc3545';
      e.target.style.color = 'white';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = 'rgba(220, 53, 69, 0.1)';
      e.target.style.color = '#dc3545';
    }}
  >
    <i className="bi bi-x" style={{ fontSize: '0.8rem' }}></i>
  </button>
);

const DeliveryStatus = ({ hasAddress }) => (
  <div className="mb-3 p-2 rounded-3"
    style={{
      background: hasAddress
        ? 'rgba(40, 167, 69, 0.1)'
        : 'rgba(255, 193, 7, 0.1)'
    }}
  >
    <div className="d-flex align-items-center">
      <i className={`bi ${hasAddress ? 'bi-geo-alt text-success' : 'bi-exclamation-triangle text-warning'} me-2`}></i>
      <small className={`${hasAddress ? 'text-success' : 'text-warning'} fw-semibold`}>
        {hasAddress ? 'Delivery address set' : 'Add delivery address'}
      </small>
    </div>
  </div>
);

const SubtotalDisplay = ({ total }) => (
  <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-4"
    style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)' }}
  >
    <span className="fw-bold">Subtotal</span>
    <span className="fw-bold text-primary fs-5">${total.toFixed(2)}</span>
  </div>
);

const CheckoutButton = ({ cartLength, onGoToCart }) => {
  const isDisabled = cartLength === 0;

  return (
    <button
      className="btn btn-lg w-100 rounded-pill fw-bold"
      onClick={onGoToCart}
      disabled={isDisabled}
      style={{
        background: !isDisabled
          ? 'linear-gradient(45deg, #28a745, #20c997)'
          : '#6c757d',
        border: 'none', color: 'white',
        boxShadow: !isDisabled ? '0 4px 15px rgba(40, 167, 69, 0.3)' : 'none',
        transition: 'all 0.3s ease',
        fontSize: '1rem', padding: '12px 24px'
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
        }
      }}
    >
      <i className="bi bi-arrow-right-circle me-2"></i>
      {isDisabled ? 'Add items to continue' : 'Review Order'}
    </button>
  );
};

const TrustBadge = () => (
  <div className="text-center mt-3">
    <small className="text-muted d-flex align-items-center justify-content-center">
      <i className="bi bi-shield-check me-1"></i>
      Secure checkout
    </small>
  </div>
);

// Main CartSidebar Component
const CartSidebar = ({ cart, deliveryAddress, onRemove, onGoToCart }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="sticky-top" style={{ top: '2rem' }}>
      <div
        className="card border-0 shadow-lg"
        style={{
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(15px)',
          overflow: 'hidden'
        }}
      >
        <CartHeader itemCount={cart.length} total={total} />

        <div className="card-body p-0">
          {cart.length === 0 ? (
            <EmptyCart />
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {cart.map((item, index) => (
                <CartItem
                  key={index}
                  item={item}
                  onRemove={onRemove}
                />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="card-footer border-0 bg-transparent p-4">
            <DeliveryStatus hasAddress={!!deliveryAddress} />
            <SubtotalDisplay total={total} />
            <CheckoutButton cartLength={cart.length} onGoToCart={onGoToCart} />
            <TrustBadge />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
