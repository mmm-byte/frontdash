import React, { useState, useEffect } from "react";

const AddressModal = ({ isOpen = true, address = {}, onSave, onClose, title = "Enter Delivery Address" }) => {
  const [buildingNumber, setBuildingNumber] = useState(address.buildingNumber || "");
  const [streetName, setStreetName] = useState(address.streetName || "");
  const [apartment, setApartment] = useState(address.apartment || "");
  const [city, setCity] = useState(address.city || "");
  const [stateVal, setStateVal] = useState(address.state || "");
  const [zip, setZip] = useState(address.zip || "");
  const [country, setCountry] = useState(address.country || "US");
  const [contactName, setContactName] = useState(address.contactName || "");
  const [contactPhone, setContactPhone] = useState(address.contactPhone || "");

  useEffect(() => {
    setBuildingNumber(address.buildingNumber || "");
    setStreetName(address.streetName || "");
    setApartment(address.apartment || "");
    setCity(address.city || "");
    setStateVal(address.state || "");
    setZip(address.zip || "");
    setCountry(address.country || "US");
    setContactName(address.contactName || "");
    setContactPhone(address.contactPhone || "");
  }, [address]);

  if (!isOpen) return null;

  const handleSave = () => {
    const newAddress = { buildingNumber, streetName, apartment, city, state: stateVal, zip, contactName, contactPhone, country };
    onSave(newAddress);
  };

  const handleOverlayClick = (e) => {
    // Close modal if clicking on overlay (not the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-4 p-4 mx-3"
        style={{
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          transform: 'scale(1)',
          animation: 'modalSlideIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 fw-bold">{title}</h4>
          <button
            className="btn-close"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              opacity: 0.6,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = 1}
            onMouseLeave={(e) => e.target.style.opacity = 0.6}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="mb-4">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Building Number</label>
              <input
                type="text"
                placeholder="123"
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
                className="form-control rounded-3"
                style={{ border: '2px solid #e9ecef', padding: '12px 16px', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label fw-semibold">Street Name</label>
              <input
                type="text"
                placeholder="Main Street"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                className="form-control rounded-3"
                style={{ border: '2px solid #e9ecef', padding: '12px 16px', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">City</label>
              <input
                type="text"
                placeholder="Dallas"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-control rounded-3"
                style={{
                  border: '2px solid #e9ecef',
                  padding: '12px 16px',
                  fontSize: '1rem'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">State</label>
              <select
                className="form-select rounded-3"
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                style={{ border: '2px solid #e9ecef', padding: '12px 16px', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              >
                <option value="">Select state</option>
                {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Apartment / Unit (optional)</label>
              <input
                type="text"
                placeholder="Apt 2B"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                className="form-control rounded-3"
                style={{ border: '2px solid #e9ecef', padding: '12px 16px', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">ZIP Code</label>
              <input
                type="text"
                placeholder="75201"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="form-control rounded-3"
                style={{ border: '2px solid #e9ecef', padding: '12px 16px', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Country</label>
            <select
              className="form-select rounded-3"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ border: '2px solid #e9ecef', padding: '12px 16px', fontSize: '1rem' }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
            </select>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Contact Name</label>
              <input
                type="text"
                placeholder="Recipient name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="form-control rounded-3"
                style={{ border: '2px solid #e9ecef', padding: '12px 16px', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Contact Phone</label>
              <input
                type="text"
                placeholder="10-digit phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="form-control rounded-3"
                style={{ border: '2px solid #e9ecef', padding: '12px 16px', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex gap-3">
          <button
            className="btn btn-outline-secondary flex-fill rounded-pill py-2"
            onClick={onClose}
            style={{
              border: '2px solid #e9ecef',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.borderColor = '#dee2e6';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#e9ecef';
            }}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary flex-fill rounded-pill py-2"
            onClick={handleSave}
            disabled={!buildingNumber || !streetName || !city || !stateVal || !contactName || !/^[1-9]\d{9}$/.test(contactPhone)}
            style={{
              background: (!buildingNumber || !streetName || !city || !stateVal || !contactName || !/^[1-9]\d{9}$/.test(contactPhone))
                ? '#6c757d'
                : 'linear-gradient(45deg, #667eea, #764ba2)',
              border: 'none',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: (!buildingNumber || !streetName || !city || !stateVal || !contactName || contactPhone.length !== 10 || /^0/.test(contactPhone))
                ? 'none'
                : '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            Save Address
          </button>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AddressModal;
