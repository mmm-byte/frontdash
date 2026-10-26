import React, { useState } from "react";

const FoodItemCard = ({ item, onAdd }) => {
  const [quantity, setQuantity] = useState(0);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 0) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (quantity <= 0) return;
    onAdd(quantity);
    setQuantity(0); // Reset quantity after adding
  };

  return (
    <div
      className="card h-100 border-0 position-relative overflow-hidden interactive-card card-surface"
    >
      {!item.available && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: 'rgba(0,0,0,0.7)',
            zIndex: 10,
            borderRadius: '16px'
          }}
        >
          <span className="text-white fw-bold fs-5">Out of Stock</span>
        </div>
      )}

      <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
        <img
          src={item.image}
          className="card-img-top w-100 h-100"
          alt={item.name}
          style={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          onError={(e) => { e.currentTarget.src = '/images/pizza.jpg'; }}
        />
        <div
          className="position-absolute top-0 end-0 m-3"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '6px 12px'
          }}
        >
          <span className="fw-bold text-primary">${Number(item.price).toFixed(2)}</span>
        </div>
      </div>

      <div className="card-body p-4 d-flex flex-column">
        <h5 className="card-title fw-bold mb-2">
          {item.name}
        </h5>
        <p className="card-text text-muted small mb-3 flex-grow-1" style={{ lineHeight: '1.5' }}>
          {item.description}
        </p>

        <div className="d-flex justify-content-between align-items-center mb-3 food-card-meta">
          <span className="food-item-category">{item.category || 'From the kitchen'}</span>
          <div className={`fw-semibold ${item.available ? 'text-success' : 'text-muted'}`}>
            {item.available ? 'Available' : 'Unavailable'}
          </div>
        </div>

        {item.available && (
          <>
            {/* Quantity Controls */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted small">Quantity:</span>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-sm btn-outline-secondary rounded-circle me-2"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 0}
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  −
                </button>
                <span
                  className="fw-semibold mx-2 text-center"
                  style={{ minWidth: '24px' }}
                >
                  {quantity}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary rounded-circle ms-2"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price Display */}
            {quantity > 0 && (
              <div className="text-center mb-3">
                <small className="text-muted">
                  Total: <span className="fw-bold text-primary">${(item.price * quantity).toFixed(2)}</span>
                </small>
              </div>
            )}

            <button
              className="btn btn-success rounded-pill px-4 py-2 w-100"
              onClick={handleAddToCart}
              style={{
                background: 'linear-gradient(45deg, #22c55e, #16a34a)',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              disabled={quantity === 0}
            >
              <i className="bi bi-cart-plus me-2"></i>
              {quantity === 0 ? 'Select Quantity' : `Add ${quantity} to Cart`}
            </button>
          </>
        )}

        {!item.available && (
          <button
            className="btn btn-secondary rounded-pill px-4 py-2 w-100"
            disabled
            style={{
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            Currently Unavailable
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodItemCard;
