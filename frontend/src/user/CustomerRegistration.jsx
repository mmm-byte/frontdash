import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, User, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import CardTypeSelector from "../shared/CardTypeSelector";
import api from "../utils/api";

const CustomerRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    buildingNumber: "",
    streetName: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    cardType: "",
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'];

  // Auto-detect card type based on first digit
  const detectCardTypeFromNumber = (cardNumber) => {
    const num = cardNumber.replace(/\s/g, '');
    const firstDigit = num[0];

    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    if (firstDigit === '6') return 'discover';
    if (firstDigit === '3') return 'amex';

    return '';
  };

  const handleChange = (field, value) => {
    // Auto-detect card type when card number changes
    if (field === 'cardNumber') {
      const detectedType = detectCardTypeFromNumber(value);
      setFormData(prev => ({ ...prev, cardNumber: value, cardType: detectedType }));

      // Clear errors for both cardNumber and cardType
      if (errors.cardNumber || errors.cardType) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.cardNumber;
          delete newErrors.cardType;
          return newErrors;
        });
      }
    } else if (field === 'cardType') {
      // Validate card type matches card number when manually changed
      setFormData(prev => ({ ...prev, [field]: value }));

      const cardNum = formData.cardNumber.replace(/\s/g, '');
      const firstDigit = cardNum[0];

      if (firstDigit && cardNum.length > 0) {
        let errorMsg = '';
        if (firstDigit === '4' && value !== 'visa') {
          errorMsg = "Card starting with 4 must be Visa";
        } else if (firstDigit === '5' && value !== 'mastercard') {
          errorMsg = "Card starting with 5 must be Mastercard";
        } else if (firstDigit === '6' && value !== 'discover') {
          errorMsg = "Card starting with 6 must be Discover";
        } else if (firstDigit === '3' && value !== 'amex') {
          errorMsg = "Card starting with 3 must be Amex";
        }

        if (errorMsg) {
          setErrors(prev => ({ ...prev, cardType: errorMsg }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.cardType;
            return newErrors;
          });
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Info - Title Case validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!/^[A-Z][a-z]*$/.test(formData.firstName.trim())) {
      newErrors.firstName = "First name must be in Title Case (e.g., John)";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[A-Z][a-z]*$/.test(formData.lastName.trim())) {
      newErrors.lastName = "Last name must be in Title Case (e.g., Smith)";
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!/^[1-9]\d{9}$/.test(formData.phone)) newErrors.phone = "10-digit phone required (cannot start with 0)";

    // Address
    if (!formData.buildingNumber.trim()) {
      newErrors.buildingNumber = "Building number is required";
    } else if (!/^\d+[A-Za-z]?$/.test(formData.buildingNumber.trim())) {
      newErrors.buildingNumber = "Invalid building number (e.g., 123, 45A)";
    }

    if (!formData.streetName.trim()) {
      newErrors.streetName = "Street name is required";
    } else if (!/^[0-9A-Za-z\s.,-]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way|Place|Pl)?$/i.test(formData.streetName.trim())) {
      newErrors.streetName = "Invalid street (e.g., Main St, University Blvd)";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    } else if (!/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/.test(formData.city.trim())) {
      newErrors.city = "City must be in Title Case (e.g., Dallas, San Antonio)";
    }

    if (!formData.state) newErrors.state = "State is required";
    if (!/^\d{5}$/.test(formData.zip)) newErrors.zip = "5-digit ZIP required";

    // Card Info
    if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) newErrors.cardNumber = "16-digit card number required";
    if (!formData.cardType) {
      newErrors.cardType = "Card type is required";
    } else {
      // Validate card type matches card number
      const cardNum = formData.cardNumber.replace(/\s/g, '');
      const firstDigit = cardNum[0];
      if (firstDigit) {
        if (firstDigit === '4' && formData.cardType !== 'visa') {
          newErrors.cardType = "Card starting with 4 must be Visa";
        } else if (firstDigit === '5' && formData.cardType !== 'mastercard') {
          newErrors.cardType = "Card starting with 5 must be Mastercard";
        } else if (firstDigit === '6' && formData.cardType !== 'discover') {
          newErrors.cardType = "Card starting with 6 must be Discover";
        } else if (firstDigit === '3' && formData.cardType !== 'amex') {
          newErrors.cardType = "Card starting with 3 must be Amex";
        }
      }
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
    } else if (!/^[A-Z][a-z]+(\s[A-Z][a-z]+)+$/.test(formData.cardName.trim())) {
      newErrors.cardName = "Must be full name in Title Case (e.g., John Doe)";
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = "Format: MM/YY";
    } else {
      const [month, year] = formData.expiryDate.split('/').map(Number);
      if (month < 1 || month > 12) {
        newErrors.expiryDate = "Invalid month (01-12)";
      } else {
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          newErrors.expiryDate = "Card has expired";
        }
      }
    }

    // CVV validation - accept 3 or 4 digits
    if (!formData.cvv) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = "CVV must be 3-4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Parse expiry date
      const [expiryMonth, expiryYear] = formData.expiryDate.split('/').map(Number);
      const fullExpiryYear = 2000 + expiryYear;

      // Prepare data for backend API
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardType: formData.cardType.toUpperCase(),
        expiryMonth: expiryMonth,
        expiryYear: fullExpiryYear,
        cardholderName: formData.cardName,
        securityCode: formData.cvv,
        buildingNumber: formData.buildingNumber,
        billingStreet: formData.streetName,
        billingCity: formData.city,
        billingState: formData.state,
        billingZip: formData.zip,
        loyaltyOptIn: true
      };

      const data = await api.customers.register(requestData);

      if (!data.success) {
        // Show detailed validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => {
            return err.msg || JSON.stringify(err);
          }).join('\n');
          setErrorMessage(`Validation Error:\n${errorMessages}`);
        } else {
          setErrorMessage(data.message || 'Registration failed');
        }
        setLoading(false);
        return;
      }

      // Success - store customer ID
      const customer = data.data;
      localStorage.setItem('customerID', customer.customerID);
      localStorage.setItem('customerEmail', customer.email);
      localStorage.setItem('loyaltyCardIdentifier', customer.loyaltyCardIdentifier || '');

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="bg-white rounded-4 shadow-lg p-5 text-center" style={{ maxWidth: '500px' }}>
          <div className="mb-4">
            <CheckCircle2 className="text-success" size={80} />
          </div>
          <h2 className="fw-bold mb-3">Registration Submitted!</h2>
          <p className="text-muted mb-4">
            Your registration request has been submitted successfully. An administrator will review your request shortly.
            Once approved, you'll receive your unique customer number via email.
          </p>
          <button
            className="btn btn-primary btn-lg rounded-pill px-5"
            onClick={() => navigate('/')}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header */}
            <div className="text-center text-white mb-4">
              <h1 className="display-5 fw-bold mb-3">Customer Registration</h1>
              <p className="lead">Register to earn points and get exclusive discounts on your orders!</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-4 shadow-lg p-4 p-md-5">
              {errorMessage && (
                <div className="alert alert-danger alert-dismissible fade show mb-4">
                  <strong>Error:</strong> {errorMessage}
                  <button type="button" className="btn-close" onClick={() => setErrorMessage("")}></button>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                      <User className="text-primary" size={24} />
                    </div>
                    <h5 className="mb-0 fw-bold">Personal Information</h5>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">First Name *</label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.firstName ? 'is-invalid' : ''}`}
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        placeholder="John"
                      />
                      {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Last Name *</label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.lastName ? 'is-invalid' : ''}`}
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        placeholder="Doe"
                      />
                      {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email *</label>
                      <div className="input-group">
                        <span className="input-group-text"><Mail size={18} /></span>
                        <input
                          type="email"
                          className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="john@example.com"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone *</label>
                      <div className="input-group">
                        <span className="input-group-text"><Phone size={18} /></span>
                        <input
                          type="text"
                          className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="1234567890"
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-2 bg-success bg-opacity-10 rounded-3 me-3">
                      <MapPin className="text-success" size={24} />
                    </div>
                    <h5 className="mb-0 fw-bold">Billing Address</h5>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Building Number *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.buildingNumber ? 'is-invalid' : ''}`}
                        value={formData.buildingNumber}
                        onChange={(e) => handleChange('buildingNumber', e.target.value)}
                        placeholder="123"
                      />
                      {errors.buildingNumber && <div className="invalid-feedback">{errors.buildingNumber}</div>}
                    </div>

                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Street Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.streetName ? 'is-invalid' : ''}`}
                        value={formData.streetName}
                        onChange={(e) => handleChange('streetName', e.target.value)}
                        placeholder="Main Street"
                      />
                      {errors.streetName && <div className="invalid-feedback">{errors.streetName}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">City *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="Dallas"
                      />
                      {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">State *</label>
                      <select
                        className={`form-select ${errors.state ? 'is-invalid' : ''}`}
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                      >
                        <option value="">Select State</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">ZIP Code *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
                        value={formData.zip}
                        onChange={(e) => handleChange('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="75201"
                      />
                      {errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-2 bg-warning bg-opacity-10 rounded-3 me-3">
                      <CreditCard className="text-warning" size={24} />
                    </div>
                    <h5 className="mb-0 fw-bold">Default Payment Method</h5>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Card Number *</label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.cardNumber ? 'is-invalid' : ''}`}
                        value={formData.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16);
                          const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                          handleChange('cardNumber', formatted);
                        }}
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && <div className="invalid-feedback">{errors.cardNumber}</div>}
                    </div>

                    <CardTypeSelector
                      selectedCardType={formData.cardType}
                      onCardTypeChange={(e) => handleChange('cardType', e.target.value)}
                    />
                    {errors.cardType && (
                      <div className="col-12">
                        <div className="text-danger small">{errors.cardType}</div>
                      </div>
                    )}

                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Cardholder Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.cardName ? 'is-invalid' : ''}`}
                        value={formData.cardName}
                        onChange={(e) => handleChange('cardName', e.target.value)}
                        placeholder="John Doe"
                      />
                      {errors.cardName && <div className="invalid-feedback">{errors.cardName}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Expiry Date *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
                        value={formData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          handleChange('expiryDate', value);
                        }}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                      {errors.expiryDate && <div className="invalid-feedback">{errors.expiryDate}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">CVV *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                        value={formData.cvv}
                        onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                      />
                      {errors.cvv && <div className="invalid-feedback">{errors.cvv}</div>}
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg rounded-pill flex-fill"
                    onClick={() => navigate('/')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg rounded-pill flex-fill"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registering...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegistration;
