import React, { useEffect, useMemo, useState } from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import CardTypeSelector from "./CardTypeSelector";
import VirtualCardPreview from "./VirtualCardPreview";
import CustomerIdInput from "../user/CustomerIdInput";
import {
  validateField,
  detectCardType,
  formatCardNumber,
  formatExpiry,
  isFormValid,
  getCustomerData
} from "../utils/formValidationUtils";

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

const PaymentForm = ({
  onSubmit,
  deliveryAddress,
  customerData,
  onVerifyCustomer,
  customerId: externalCustomerId,
  setCustomerId: setExternalCustomerId,
  isVerifying,
  customerIdError
}) => {
  // Form state
  const [formData, setFormData] = useState({
    cardNumber: "",
    firstName: "",
    lastName: "",
    expiry: "",
    cvv: "",
    building: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    cardType: ""
  });

  const [cardType, setCardType] = useState("");
  const [manualCardType, setManualCardType] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  // Use external customerId if provided, otherwise use internal state
  const customerId = externalCustomerId !== undefined ? externalCustomerId : (customerData?.customerId || "");
  const setCustomerId = setExternalCustomerId || (() => {});
  const [useDeliveryAsBilling, setUseDeliveryAsBilling] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Auto-fill from customerData if provided - fetch full payment info including decrypted CVV
  useEffect(() => {
    const loadCustomerPaymentInfo = async () => {
      if (customerData && customerData.customerId) {
        try {
          const paymentInfo = await getCustomerData(customerData.customerId.toString());
          if (paymentInfo) {
            setFormData(paymentInfo);
            setCardType(paymentInfo.cardType);

            // Mark all fields as touched
            setTouched({
              cardNumber: true,
              firstName: true,
              lastName: true,
              expiry: true,
              cvv: true,
              building: true,
              street: true,
              city: true,
              state: true,
              zip: true,
              phone: true
            });
          }
        } catch (error) {
          console.error('Failed to load payment info:', error);
          // Fallback to basic customerData (without CVV)
          const maskedCard = customerData.cardNumber.slice(-4).padStart(16, '•');
          const displayCard = maskedCard.match(/.{1,4}/g)?.join(' ') || maskedCard;

          setFormData({
            cardNumber: displayCard,
            firstName: customerData.cardName?.split(' ')[0] || '',
            lastName: customerData.cardName?.split(' ').slice(1).join(' ') || '',
            expiry: customerData.expiryDate || '',
            cvv: '•••',
            building: customerData.buildingNumber || '',
            street: [customerData.streetName, customerData.apartment].filter(Boolean).join(' '),
            city: customerData.city || '',
            state: customerData.state || '',
            zip: customerData.zip || '',
            phone: customerData.phone || ''
          });

          setTouched({
            cardNumber: true,
            firstName: true,
            lastName: true,
            expiry: true,
            cvv: true,
            building: true,
            street: true,
            city: true,
            state: true,
            zip: true,
            phone: true
          });
        }
      }
    };

    loadCustomerPaymentInfo();
  }, [customerData]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // When toggling "use delivery as billing", copy address
  useEffect(() => {
    if (useDeliveryAsBilling && deliveryAddress) {
      const mapped = {
        building: deliveryAddress.buildingNumber || '',
        street: [deliveryAddress.streetName, deliveryAddress.apartment].filter(Boolean).join(' '),
        city: deliveryAddress.city || '',
        state: deliveryAddress.state || '',
        zip: deliveryAddress.zip || '',
        phone: (deliveryAddress.contactPhone || '').toString().replace(/\D/g,'').slice(0,10)
      };

      setFormData(prev => {
        const updated = { ...prev, ...mapped };
        return updated;
      });

      // Mark address fields touched for validation feedback
      setTouched(prev => ({ ...prev, building: true, street: true, city: true, state: true, zip: true, phone: true }));

      // Clear errors for address fields since we're auto-filling with valid data
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.building;
        delete newErrors.street;
        delete newErrors.city;
        delete newErrors.state;
        delete newErrors.zip;
        delete newErrors.phone;
        return newErrors;
      });
    }
  }, [useDeliveryAsBilling, deliveryAddress]);

  // Handle customer ID change (just update the value, no auto-fetch)
  const handleCustomerIdChange = async (e) => {
    const value = e.target.value;
    // Only allow numbers
    const numbersOnly = value.replace(/\D/g, '');
    setCustomerId(numbersOnly);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting
    switch (name) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        const detectedType = detectCardType(formattedValue);
        setCardType(detectedType);
        // Update cardType in formData as well
        setFormData(prev => ({
          ...prev,
          cardNumber: formattedValue,
          cardType: detectedType
        }));
        return; // Return early since we already updated formData
      case 'expiry':
        formattedValue = formatExpiry(value);
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').slice(0, 3);
        break;
      case 'zip':
        formattedValue = value.replace(/\D/g, '').slice(0, 5);
        break;
      case 'phone':
        formattedValue = value.replace(/\D/g, '').slice(0, 10);
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Handle blur (touched state and validation)
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, formData[name], { cardType: effectiveCardType });
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Handle card type selection
  const handleCardTypeChange = (e) => {
    setManualCardType(e.target.value);
  };

  // Check if form is valid (requires card type)
  const effectiveCardType = manualCardType || cardType;
  const formIsValid = useMemo(() => {
    return isFormValid(formData, effectiveCardType);
  }, [formData, effectiveCardType]);

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = Object.keys(formData).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {});
    setTouched(allFields);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field], { cardType: effectiveCardType });
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);

    // Submit if valid
    if (Object.keys(newErrors).length === 0 && effectiveCardType) {
      onSubmit({
        ...formData,
        cardType: effectiveCardType,
        customerId: customerId || null // Include customer ID if entered
      });
    }
  };

  const renderBrandLogo = (type) => {
    switch (type) {
      case 'visa':
        return (
          <svg width="46" height="22" viewBox="0 0 64 24" aria-label="Visa" role="img">
            <rect width="64" height="24" rx="4" fill="#1a1f71"/>
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="12">VISA</text>
          </svg>
        );
      case 'mastercard':
        return (
          <svg width="46" height="22" viewBox="0 0 64 24" aria-label="Mastercard" role="img">
            <rect width="64" height="24" rx="4" fill="#111827"/>
            <circle cx="28" cy="12" r="7" fill="#eb001b"/>
            <circle cx="36" cy="12" r="7" fill="#f79e1b" opacity="0.9"/>
          </svg>
        );
      case 'discover':
        return (
          <svg width="46" height="22" viewBox="0 0 64 24" aria-label="Discover" role="img">
            <rect width="64" height="24" rx="4" fill="#ffffff" stroke="#ff6000"/>
            <rect x="42" y="0" width="22" height="24" fill="#ff6000"/>
            <text x="18" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#111827" fontWeight="800" fontSize="9">DISC</text>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card border-0 shadow-lg rounded-4 glass-card">
      {/* Header */}
      <div className="card-header border-0 text-white p-4 gradient-header-purple rounded-top-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="rounded-circle me-3 d-flex align-items-center justify-content-center bg-white bg-opacity-20"
                 style={{ width: '48px', height: '48px' }}>
              <i className="bi bi-credit-card text-white fs-5"></i>
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Payment Details</h5>
              <small className="opacity-75">Complete your order</small>
            </div>
          </div>

          <CustomerIdInput
            customerId={customerId}
            onCustomerIdChange={handleCustomerIdChange}
            disabled={!!customerData?.customerId}
            onVerify={onVerifyCustomer}
            isVerifying={isVerifying}
          />
        </div>
      </div>

      <div className="card-body p-4">
        {/* Show customer verification message */}
        {customerIdError && (
          <div className="alert alert-danger mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {customerIdError}
          </div>
        )}
        {customerData && (
          <div className="alert alert-success mb-3">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>Welcome back, {customerData.name}!</strong>
            {' '}
            {customerData.loyaltyPoints >= 100
              ? `🎉 ${customerData.loyaltyPoints} points! Enjoying 10% discount!`
              : `${customerData.loyaltyPoints} points.`
            }
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Virtual Credit Card */}
          <VirtualCardPreview formData={formData} selectedCardType={cardType} cardType={cardType} />

          {/* Card Information Section */}
          <div className="mb-3">
            <h6 className="fw-bold mb-3 text-primary">
              <i className="bi bi-credit-card-2-front me-2"></i>
              Card Information
            </h6>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold text-dark">
                  <i className="bi bi-credit-card me-2 text-muted"></i>
                  Card Number
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    name="cardNumber"
                    className={`form-control form-control-lg rounded-3 ${touched.cardNumber && errors.cardNumber ? 'is-invalid' : touched.cardNumber && !errors.cardNumber && formData.cardNumber ? 'is-valid' : ''}`}
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {effectiveCardType && (
                    <div style={{ position: 'absolute', right: 8, top: 6 }}>
                      {renderBrandLogo(effectiveCardType)}
                    </div>
                  )}
                  {touched.cardNumber && errors.cardNumber && (
                    <div className="invalid-feedback d-block">{errors.cardNumber}</div>
                  )}
                </div>
              </div>

              <CardTypeSelector
                selectedCardType={manualCardType || cardType}
                onCardTypeChange={handleCardTypeChange}
              />

              <FormInput
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.firstName}
                touched={touched.firstName}
                placeholder="John"
                icon="person"
                className="col-md-6"
              />

              <FormInput
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.lastName}
                touched={touched.lastName}
                placeholder="Doe"
                icon="person"
                className="col-md-6"
              />

              <FormInput
                name="expiry"
                label="Expiry Date"
                value={formData.expiry}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.expiry}
                touched={touched.expiry}
                placeholder="MM/YY"
                maxLength="5"
                icon="calendar"
                className="col-md-6"
              />

              <FormInput
                name="cvv"
                label="CVV"
                value={formData.cvv}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.cvv}
                touched={touched.cvv}
                placeholder="123"
                maxLength="3"
                icon="shield-lock"
                className="col-md-6"
              />
            </div>
          </div>

          {/* Billing Address Section */}
          <div className="mb-3">
            <h6 className="fw-bold mb-3 text-success">
              <i className="bi bi-house me-2"></i>
              Billing Address
            </h6>

            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" id="sameAsDelivery" checked={useDeliveryAsBilling} onChange={(e)=> setUseDeliveryAsBilling(e.target.checked)} />
              <label className="form-check-label" htmlFor="sameAsDelivery">Same as delivery address</label>
            </div>

            <div className="row g-3">
              <FormInput
                name="building"
                label="Building Number"
                value={formData.building}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.building}
                touched={touched.building}
                placeholder="123"
                icon="building"
                className="col-md-3"
                disabled={useDeliveryAsBilling}
              />
              <FormInput
                name="street"
                label="Street Address"
                value={formData.street}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.street}
                touched={touched.street}
                placeholder="Main Street"
                icon="geo-alt"
                className="col-md-9"
                disabled={useDeliveryAsBilling}
              />

              <FormInput
                name="city"
                label="City"
                value={formData.city}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.city}
                touched={touched.city}
                placeholder="Dallas"
                icon="building"
                className="col-md-6"
                disabled={useDeliveryAsBilling}
              />

              <FormSelect
                name="state"
                label="State"
                value={formData.state}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.state}
                touched={touched.state}
                options={US_STATES}
                placeholder="Select a state"
                className="col-md-6"
                disabled={useDeliveryAsBilling}
              />

              <FormInput
                name="zip"
                label="ZIP Code"
                value={formData.zip}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.zip}
                touched={touched.zip}
                placeholder="75201"
                maxLength="5"
                icon="mailbox"
                className="col-md-6"
                disabled={useDeliveryAsBilling}
              />

              <FormInput
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.phone}
                touched={touched.phone}
                placeholder="1234567890"
                maxLength="10"
                icon="telephone"
                className="col-md-6"
                disabled={useDeliveryAsBilling}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`btn w-100 rounded-pill fw-semibold text-white ${
              formIsValid ? 'btn-success' : 'btn-secondary'
            }`}
            style={{ padding: '10px 16px' }}
            onClick={(e) => {
              if (!formIsValid) {
                e.preventDefault();

                // Mark all fields as touched to show errors
                const allFields = Object.keys(formData).reduce((acc, field) => ({
                  ...acc,
                  [field]: true
                }), {});
                setTouched(allFields);

                // Calculate all errors
                const newErrors = {};
                Object.keys(formData).forEach(field => {
                  const error = validateField(field, formData[field], { cardType: effectiveCardType });
                  if (error) newErrors[field] = error;
                });
                setErrors(newErrors);

              }
            }}
          >
            <i className="bi bi-shield-lock me-2"></i>
            Complete Secure Payment
          </button>

          {/* Validation feedback when form is invalid */}
          {!formIsValid && Object.keys(errors).length > 0 && (
            <div className="alert alert-warning mt-3 mb-0" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Please fix the errors above to continue
            </div>
          )}

          {!formIsValid && !effectiveCardType && (
            <div className="alert alert-warning mt-3 mb-0" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Please enter a valid card number
            </div>
          )}

          {/* Security Notice */}
          <div className="text-center mt-3">
            <small className="text-muted d-flex align-items-center justify-content-center">
              <i className="bi bi-shield-check me-1 text-success"></i>
              Your payment information is encrypted and secure
            </small>
          </div>
        </form>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(15px);
        }

        .gradient-header-purple {
          background: linear-gradient(45deg, #f59e0b, #fbbf24);
        }

        .rounded-top-4 {
          border-top-left-radius: 1.5rem !important;
          border-top-right-radius: 1.5rem !important;
        }

        .rounded-4 {
          border-radius: 1.5rem !important;
        }

        .form-control-lg {
          font-size: 1rem;
          padding: 0.75rem 1rem;
          border: 2px solid #e9ecef;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .form-control-lg:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 0.2rem rgba(245, 158, 11, 0.25);
          outline: none;
        }

        .form-control-lg.is-valid {
          border-color: #28a745;
        }

        .form-control-lg.is-invalid {
          border-color: #dc3545;
        }

        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

export default PaymentForm;
