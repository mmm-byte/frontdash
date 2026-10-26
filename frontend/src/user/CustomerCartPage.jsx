import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// AddressModal removed; using inline address form

// Modular Components
const SleekHeader = ({ onBackClick }) => (
  <div
    className="text-white py-3"
    style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}
  >
    <div className="container text-center">
      <button
        className="btn btn-outline-light rounded-pill px-4 mb-3"
        onClick={onBackClick}
        style={{ border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}
      >
        <i className="bi bi-arrow-left me-2"></i>Back to Menu
      </button>

      <h1 className="h2 fw-bold mb-1" style={{
        textShadow: '0 4px 12px rgba(0,0,0,0.3)', letterSpacing: '-0.02em'
      }}>
        Review Order
      </h1>

      <div
        className="d-inline-flex align-items-center rounded-pill px-4 py-2 shadow-sm"
        style={{ background: '#ffffff', color: '#374151' }}
      >
        <span className="me-3" style={{ color: '#6b7280' }}>Menu</span>
        <i className="bi bi-chevron-right text-muted me-3"></i>
        <span className="me-3" style={{ color: '#92400e', fontWeight: 700 }}>Review Order</span>
        <i className="bi bi-chevron-right text-muted me-3"></i>
        <span style={{ color: '#6b7280' }}>Payment</span>
      </div>
    </div>
  </div>
);

const SleekCard = ({ title, subtitle, icon, iconColor, children }) => (
  <div
    className="card border-0 shadow-lg mb-4"
    style={{
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(15px)'
    }}
  >
    <div className="card-header border-0 bg-transparent p-4">
      <div className="d-flex align-items-center">
        <div
          className="rounded-circle me-3 d-flex align-items-center justify-content-center"
          style={{
            width: '48px', height: '48px',
            background: iconColor || 'linear-gradient(45deg, #667eea, #764ba2)'
          }}
        >
          <i className={`${icon} text-white fs-5`}></i>
        </div>
        <div>
          <h5 className="mb-0 fw-bold">{title}</h5>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
      </div>
    </div>
    <div className="card-body p-4 pt-2">
      {children}
    </div>
  </div>
);

const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
  <div
    className="d-flex align-items-center p-3 mb-3 rounded-4"
    style={{
      background: 'linear-gradient(135deg, #e6aaaaff 0%, #f0f4ff 100%)',
      transition: 'all 0.3s ease'
    }}
  >
    <img
      src={item.image}
      alt={item.name}
      className="rounded-3 me-3"
      style={{ height: '60px', width: '60px', objectFit: 'cover' }}
    />

    <div className="flex-grow-1">
      <h6 className="fw-bold mb-1">{item.name}</h6>
      <small className="text-muted">{item.description || 'Delicious item'}</small>
    </div>

    <div className="d-flex align-items-center me-3">
      <button
        className="btn btn-sm btn-outline-primary rounded-circle me-2"
        style={{ width: '30px', height: '30px', padding: '0' }}
        onClick={() => onUpdateQuantity && onUpdateQuantity(item.name, item.quantity - 1)}
      >
        −
      </button>
      <span className="fw-semibold mx-2">{item.quantity}</span>
      <button
        className="btn btn-sm btn-outline-primary rounded-circle ms-2"
        style={{ width: '30px', height: '30px', padding: '0' }}
        onClick={() => onUpdateQuantity && onUpdateQuantity(item.name, item.quantity + 1)}
      >
        +
      </button>
    </div>

    <div className="text-end me-3">
      <div className="fw-bold text-primary">${(item.price * item.quantity).toFixed(2)}</div>
      <small className="text-muted">${item.price} each</small>
    </div>

    <button
      className="btn btn-sm btn-outline-danger rounded-circle"
      onClick={() => onRemove && onRemove(item.name)}
    >
      <i className="bi bi-trash"></i>
    </button>
  </div>
);

const InlineAddressForm = ({ value = {}, onChange, errors = {}, onClearError }) => {
  const update = (patch) => onChange({ ...value, ...patch });
  const states = ['','AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'];

  const handleFieldChange = (field, newValue) => {
    update({ [field]: newValue });
    // Clear the error for this field when user starts typing
    if (onClearError && errors[field]) {
      onClearError(field);
    }
  };

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <label className="form-label">Building Number</label>
        <input
          className={`form-control ${errors.buildingNumber ? 'is-invalid' : ''}`}
          value={value.buildingNumber || ''}
          onChange={(e)=>handleFieldChange('buildingNumber', e.target.value)}
          placeholder="123"
        />
        {errors.buildingNumber && <div className="invalid-feedback d-block">{errors.buildingNumber}</div>}
      </div>
      <div className="col-md-8">
        <label className="form-label">Street Name</label>
        <input
          className={`form-control ${errors.streetName ? 'is-invalid' : ''}`}
          value={value.streetName || ''}
          onChange={(e)=>handleFieldChange('streetName', e.target.value)}
          placeholder="Main Street (Title Case)"
        />
        {errors.streetName && <div className="invalid-feedback d-block">{errors.streetName}</div>}
      </div>
      <div className="col-md-6">
        <label className="form-label">City</label>
        <input
          className={`form-control ${errors.city ? 'is-invalid' : ''}`}
          value={value.city || ''}
          onChange={(e)=>handleFieldChange('city', e.target.value)}
          placeholder="San Antonio (Title Case)"
        />
        {errors.city && <div className="invalid-feedback d-block">{errors.city}</div>}
      </div>
      <div className="col-md-3">
        <label className="form-label">State</label>
        <select
          className={`form-select ${errors.state ? 'is-invalid' : ''}`}
          value={value.state || ''}
          onChange={(e)=>handleFieldChange('state', e.target.value)}
        >
          {states.map(s => <option key={s} value={s}>{s || 'Select'}</option>)}
        </select>
        {errors.state && <div className="invalid-feedback d-block">{errors.state}</div>}
      </div>
      <div className="col-md-3">
        <label className="form-label">ZIP</label>
        <input
          className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
          value={value.zip || ''}
          onChange={(e)=>handleFieldChange('zip', e.target.value.replace(/\D/g,'').slice(0,5))}
        />
        {errors.zip && <div className="invalid-feedback d-block">{errors.zip}</div>}
      </div>
      <div className="col-md-6">
        <label className="form-label">Contact Name</label>
        <input
          className={`form-control ${errors.contactName ? 'is-invalid' : ''}`}
          value={value.contactName || ''}
          onChange={(e)=>handleFieldChange('contactName', e.target.value)}
          placeholder="John Doe (Title Case)"
        />
        {errors.contactName && <div className="invalid-feedback d-block">{errors.contactName}</div>}
      </div>
      <div className="col-md-6">
        <label className="form-label">Contact Phone</label>
        <input
          className={`form-control ${errors.contactPhone ? 'is-invalid' : ''}`}
          value={value.contactPhone || ''}
          onChange={(e)=>handleFieldChange('contactPhone', e.target.value.replace(/\D/g,'').slice(0,10))}
          placeholder="10-digit"
        />
        {errors.contactPhone && <div className="invalid-feedback d-block">{errors.contactPhone}</div>}
      </div>
    </div>
  );
};

const TipSelector = ({ tip, subtotal, onTipChange }) => {
  const [inputMode, setInputMode] = React.useState('amount'); // 'amount' or 'percentage'
  const [inputValue, setInputValue] = React.useState('');

  // Calculate tip percentage from tip amount
  const calculatePercentage = (tipAmount) => {
    if (subtotal === 0) return 0;
    return (tipAmount / subtotal) * 100;
  };

  // Calculate tip amount from percentage
  const calculateAmount = (percentage) => {
    return subtotal * (percentage / 100);
  };

  const currentPercentage = calculatePercentage(tip);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseFloat(value) || 0;

    if (inputMode === 'amount') {
      // User entered tip amount, calculate and update
      onTipChange(numValue);
    } else {
      // User entered percentage, calculate tip amount and update
      const tipAmount = calculateAmount(numValue);
      onTipChange(tipAmount);
    }
  };

  const toggleInputMode = () => {
    setInputMode(prev => prev === 'amount' ? 'percentage' : 'amount');
    setInputValue(''); // Clear input when switching modes
  };

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="fw-semibold">Add Tip</span>
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold text-primary">${tip.toFixed(2)}</span>
          <small className="text-muted">({currentPercentage.toFixed(1)}%)</small>
        </div>
      </div>

      <div className="row g-2 mb-3">
        {[15, 18, 20, 25].map(percentage => {
          const tipAmount = calculateAmount(percentage);
          return (
            <div key={percentage} className="col-6">
              <button
                className={`btn w-100 rounded-pill ${
                  Math.abs(tip - tipAmount) < 0.01 ? 'btn-warning text-white' : 'btn-outline-warning'
                }`}
                onClick={() => onTipChange(tipAmount)}
                style={{
                  background: Math.abs(tip - tipAmount) < 0.01
                    ? 'linear-gradient(45deg, #f59e0b, #fbbf24)' : 'transparent'
                }}
              >
                {percentage}%
              </button>
            </div>
          );
        })}
      </div>

      <div className="input-group mb-2">
        <span
          className="input-group-text bg-white border rounded-start-pill cursor-pointer"
          onClick={toggleInputMode}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          title="Click to switch between $ and %"
        >
          {inputMode === 'amount' ? '$' : '%'}
        </span>
        <input
          type="number"
          step="0.01"
          className="form-control border"
          value={inputValue || (inputMode === 'amount' ? tip.toFixed(2) : currentPercentage.toFixed(1))}
          onChange={handleInputChange}
          placeholder={inputMode === 'amount' ? 'Custom tip amount' : 'Custom tip %'}
        />
        <button
          className="btn btn-outline-secondary rounded-end-pill"
          onClick={toggleInputMode}
          title="Switch input mode"
        >
          <i className={`bi bi-${inputMode === 'amount' ? 'percent' : 'currency-dollar'}`}></i>
        </button>
      </div>
      <small className="text-muted">
        <i className="bi bi-info-circle me-1"></i>
        {inputMode === 'amount'
          ? 'Enter tip amount or click % to enter percentage'
          : 'Enter tip percentage or click $ to enter amount'}
      </small>
    </div>
  );
};

// Main Component
const CustomerCartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialCart = location.state?.cart || [];
  const restaurant = location.state?.restaurant || { name: "Restaurant" };
  const initialTip = location.state?.tip || 0;

  const [tip, setTip] = useState(initialTip);
  const [cartItems, setCartItems] = useState(initialCart);
  const [deliveryAddress, setDeliveryAddress] = useState(location.state?.deliveryAddress || {});
  const [addressErrors, setAddressErrors] = useState({});
  const [triedProceed, setTriedProceed] = useState(false);

  const subtotal = useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems]);
  const tax = useMemo(() => subtotal * 0.0825, [subtotal]);
  const total = useMemo(() => subtotal + tax + tip, [subtotal, tax, tip]);

  const validateAddress = (addr) => {
    const e = {};

    // Building Number validation
    if (!addr.buildingNumber?.trim()) {
      e.buildingNumber = 'Building number is required';
    } else if (!/^[0-9]+[A-Za-z]?$/.test(addr.buildingNumber.trim())) {
      e.buildingNumber = 'Enter valid building number (e.g., 123 or 123A)';
    }

    // Street Name validation - Allow common street formats
    if (!addr.streetName?.trim()) {
      e.streetName = 'Street name is required';
    } else if (addr.streetName.trim().length < 3) {
      e.streetName = 'Street name must be at least 3 characters';
    } else {
      const streetWords = addr.streetName.trim().split(/\s+/);
      const isValidFormat = streetWords.every(word => {
        if (word.length === 0) return true;
        // Allow numbers (5750), single letters (E, W, N, S), Title Case words, or abbreviations with periods (Blvd., St., Ave.)
        return /^\d+$/.test(word) || // Numbers
               /^[A-Z]$/.test(word) || // Single uppercase letters (E, W, N, S)
               /^[A-Z][a-z]+$/.test(word) || // Title Case words
               /^[A-Z][a-z]*\.$/.test(word); // Abbreviations with period
      });
      if (!isValidFormat) {
        e.streetName = 'Street must use proper format (e.g., "5750 E University Blvd.")';
      }
    }

    // City validation - Title Case required
    if (!addr.city?.trim()) {
      e.city = 'City is required';
    } else if (addr.city.trim().length < 2) {
      e.city = 'City name must be at least 2 characters';
    } else {
      const cityWords = addr.city.trim().split(/\s+/);
      const isValidTitleCase = cityWords.every(word => {
        if (word.length === 0) return true;
        return /^[A-Z][a-z]*$/.test(word);
      });
      if (!isValidTitleCase) {
        e.city = 'City must be in Title Case (e.g., "San Antonio", "New York")';
      }
    }

    // State validation
    if (!addr.state?.trim()) {
      e.state = 'State is required';
    }

    // ZIP validation
    if (!/^\d{5}$/.test(addr.zip || '')) {
      e.zip = '5-digit ZIP code required';
    }

    // Contact Name validation - Title Case required
    if (!addr.contactName?.trim()) {
      e.contactName = 'Contact name is required';
    } else if (addr.contactName.trim().length < 2) {
      e.contactName = 'Contact name must be at least 2 characters';
    } else {
      const nameWords = addr.contactName.trim().split(/\s+/);
      const isValidTitleCase = nameWords.every(word => {
        if (word.length === 0) return true;
        return /^[A-Z][a-z]*$/.test(word);
      });
      if (!isValidTitleCase) {
        e.contactName = 'Contact name must be in Title Case (e.g., "John Doe")';
      }
    }

    // Contact Phone validation
    if (!/^[1-9]\d{9}$/.test((addr.contactPhone || ''))) {
      e.contactPhone = '10-digit phone required (cannot start with 0)';
    }

    setAddressErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClearError = (fieldName) => {
    setAddressErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleUpdateQuantity = (itemName, newQuantity) => {
    setCartItems(prev => prev
      .map(it => it.name === itemName ? { ...it, quantity: Math.max(1, newQuantity) } : it)
    );
  };

  const handleRemoveItem = (itemName) => {
    setCartItems(prev => prev.filter(it => it.name !== itemName));
  };

  return (
    <div className="min-vh-100" style={{ background: 'var(--color-bg)' }}>
      <SleekHeader onBackClick={() => navigate(-1)} />

      <div className="container pb-5">
        <div className="row g-4">
          {/* Order Items */}
          <div className="col-lg-8">
            <SleekCard
              title="Order Items"
              subtitle={`${cartItems.length} items in your cart`}
              icon="bi-bag-check"
              iconColor="linear-gradient(45deg, #667eea, #764ba2)"
            >
              {cartItems.map((item, index) => (
                <CartItem
                  key={index}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </SleekCard>

            {/* Delivery Address */}
            <SleekCard
              title="Delivery Address"
              subtitle="Where should we deliver?"
              icon="bi-geo-alt"
              iconColor="linear-gradient(45deg, #28a745, #20c997)"
            >
              <InlineAddressForm
                value={deliveryAddress}
                onChange={setDeliveryAddress}
                errors={addressErrors}
                onClearError={handleClearError}
              />
            </SleekCard>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: '2rem' }}>
              <SleekCard
                title="Order Summary"
                subtitle="Review your order"
                icon="bi-receipt"
                iconColor="linear-gradient(45deg, #ffc107, #fd7e14)"
              >
                {cartItems.length === 0 && (
                  <div className="alert alert-warning">
                    Your cart is empty. Please add items to proceed to payment.
                  </div>
                )}
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span className="fw-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (8.25%)</span>
                    <span className="fw-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Delivery Fee</span>
                    <span className="fw-semibold text-success">FREE</span>
                  </div>
                </div>

                <TipSelector tip={tip} subtotal={subtotal} onTipChange={setTip} />

                <hr style={{ margin: '1.5rem 0', opacity: 0.1 }} />

                <div className="d-flex justify-content-between mb-4 p-3 rounded-4"
                  style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)' }}
                >
                  <span className="fs-5 fw-bold">Total</span>
                  <span className="fs-4 fw-bold text-primary">${total.toFixed(2)}</span>
                </div>

                <div className="text-center p-3 mb-4 rounded-4"
                  style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)' }}
                >
                  <i className="bi bi-clock text-success fs-5 mb-2"></i>
                  <div className="fw-semibold text-success">25-35 minutes</div>
                  <small className="text-muted">Estimated delivery</small>
                </div>

                <button
                  className="btn w-100 rounded-pill fw-semibold mb-3 text-white"
                  onClick={() => {
                    setTriedProceed(true);
                    if (!validateAddress(deliveryAddress) || cartItems.length === 0) {
                      return;
                    }
                    navigate("/customer-payment", {
                      state: {
                        cart: cartItems,
                        tip,
                        deliveryAddress,
                        restaurant
                      }
                    });
                  }}
                  style={{
                    background: 'linear-gradient(45deg, #28a745, #20c997)',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(40, 167, 69, 0.2)',
                    fontSize: '1rem',
                    padding: '10px 16px'
                  }}
                  disabled={cartItems.length === 0}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Proceed to Payment
                </button>

                {triedProceed && Object.keys(addressErrors).length > 0 && (
                  <div className="alert alert-danger mt-2">Please complete the delivery address before continuing.</div>
                )}

                <div className="text-center">
                  <small className="text-muted">
                    <i className="bi bi-shield-check me-1"></i>
                    Secure checkout with SSL
                  </small>
                </div>
              </SleekCard>
            </div>
          </div>
        </div>
      </div>

      {/* inline form, modal removed */}
    </div>
  );
};

export default CustomerCartPage;
