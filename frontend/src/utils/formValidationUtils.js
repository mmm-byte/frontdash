// Luhn algorithm for credit card validation
const luhnCheck = (cardNumber) => {
  let sum = 0;
  let isEven = false;

  // Loop through values starting from the rightmost digit
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Form validation utilities
export const validateField = (name, value, context = {}) => {
  const { cardType: selectedCardType } = context;
  switch (name) {
    case 'cardNumber':
      if (!value) return 'Card number is required';
      const cleaned = value.replace(/\s/g, '');

      // Allow masked card numbers (e.g., "**** **** **** 1234" or "************1234")
      const hasMasking = cleaned.includes('*') || cleaned.includes('•');
      if (hasMasking) {
        // Check that it has exactly 16 characters including masking and ends with digits
        if (cleaned.length === 16 && /\d{4}$/.test(cleaned)) {
          return ''; // Valid masked card number
        }
        return 'Invalid masked card number';
      }

      if (!/^\d{16}$/.test(cleaned)) return 'Card number must be exactly 16 digits';

      // Check if card type matches selected type
      if (selectedCardType) {
        const normalizedSelectedType = selectedCardType.toLowerCase();
        const firstDigit = cleaned[0];

        if (normalizedSelectedType === 'visa' && firstDigit !== '4') {
          return 'Card number does not match Visa (must start with 4)';
        }
        if (normalizedSelectedType === 'mastercard' && firstDigit !== '5') {
          return 'Card number does not match Mastercard (must start with 5)';
        }
        if (normalizedSelectedType === 'discover' && firstDigit !== '6') {
          return 'Card number does not match Discover (must start with 6)';
        }
        if ((normalizedSelectedType === 'amex' || normalizedSelectedType === 'american express') && firstDigit !== '3') {
          return 'Card number does not match American Express (must start with 3)';
        }
      }
      return '';

    case 'firstName':
      if (!value.trim()) return 'First name is required';
      if (!/^[A-Za-z]{2,}$/.test(value.trim())) return 'First name must have at least 2 letters';
      return '';

    case 'lastName':
      if (!value.trim()) return 'Last name is required';
      if (!/^[A-Za-z]{2,}$/.test(value.trim())) return 'Last name must have at least 2 letters';
      return '';

    case 'expiry':
      if (!value) return 'Expiry date is required';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) return 'Use MM/YY format';
      // Check future date
      try {
        const [mm, yy] = value.split('/').map(v => parseInt(v, 10));
        const year = 2000 + yy;
        const monthIndex = mm - 1;
        const lastDay = new Date(year, monthIndex + 1, 0);
        const now = new Date();
        if (lastDay < new Date(now.getFullYear(), now.getMonth(), 1)) {
          return 'Card is expired';
        }
      } catch {
        return 'Invalid expiry date';
      }
      return '';

    case 'cvv':
      if (!value) return 'CVV is required';
      // Allow masked CVV (•••) for auto-filled data
      if (/^•+$/.test(value) && value.length === 3) return '';
      if (!/^\d{3,4}$/.test(value)) return 'CVV must be 3 or 4 digits';
      return '';

    case 'street':
      return !value.trim() ? 'Street address is required' : '';

    case 'city':
      return !value.trim() ? 'City is required' : '';

    case 'state':
      return !value.trim() ? 'State is required' : '';

    case 'zip':
      if (!value.trim()) return 'ZIP code is required';
      if (!/^\d{5}$/.test(value)) return 'ZIP code must be 5 digits';
      return '';

    case 'phone':
      if (!value) return 'Phone number is required';
      const digits = value.replace(/\D/g, '');
      if (!/^[1-9]\d{9}$/.test(digits)) return 'Enter a valid 10-digit phone (must not start with 0)';
      return '';

    default:
      return '';
  }
};

// Card type detection
export const detectCardType = (number) => {
  const num = number.replace(/\s/g, '');
  const firstDigit = num[0];

  // Visa: starts with 4
  if (firstDigit === '4') return 'visa';

  // Mastercard: starts with 5
  if (firstDigit === '5') return 'mastercard';

  // Discover: starts with 6
  if (firstDigit === '6') return 'discover';

  // American Express: starts with 3
  if (firstDigit === '3') return 'amex';

  return '';
};

// Format card number with spaces
export const formatCardNumber = (value) => {
  const num = value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16);
  const match = num.match(/(\d{1,4})/g);
  const match2 = match ? match.join(' ') : '';
  return match2;
};

// Format expiry date
export const formatExpiry = (value) => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/(\d{1,2})(\d{0,2})/);
  if (match) {
    return !match[2] ? match[1] : `${match[1]}/${match[2]}`;
  }
  return value;
};

// Check if form is valid
export const isFormValid = (formData, cardType) => {
  const requiredFields = Object.keys(formData);
  const hasAllFields = requiredFields.every(field =>
    formData[field] && formData[field].toString().trim() !== ''
  );
  if (!hasAllFields) return false;
  // Card type must be selected/present
  if (!cardType) return false;

  // Check for errors in all fields
  const formErrors = {};
  Object.keys(formData).forEach(field => {
    const error = validateField(field, formData[field], { cardType });
    if (error) formErrors[field] = error;
  });

  return hasAllFields && Object.keys(formErrors).length === 0;
};

// Customer data for auto-fill - now fetches from API
export const getCustomerData = async (customerId) => {
  // Fallback to hardcoded test data
  const customerDatabase = {
    'custtest123': {
      cardNumber: "4532 1234 5678 9012",
      firstName: "John",
      lastName: "Doe",
      expiry: "12/25",
      cvv: "123",
      street: "123 Main Street",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      phone: "2145551234",
      cardType: "visa"
    }
  };

  // First check hardcoded test data
  if (customerDatabase[customerId]) {
    return customerDatabase[customerId];
  }

  // Try to fetch from API if customerId is a number
  if (/^\d+$/.test(customerId)) {
    try {
      const api = (await import('./api')).default;
      const response = await api.customers.getPaymentInfo(customerId);

      if (response.data) {
        const c = response.data;

        // Extract building number from street address
        const building = c.buildingNumber || c.building_number || '';
        const streetName = c.billingStreet || c.billing_street || c.street || '';

        // Format card number - handle masked cards properly
        let rawCard = c.cardNumberMasked || c.card_number_masked || '';
        // Remove any existing spaces or special characters
        rawCard = rawCard.replace(/[^\d*]/g, '');
        // Format with spaces every 4 digits
        const formattedCard = rawCard.match(/.{1,4}/g)?.join(' ') || rawCard;

        // Format expiry
        const expiryMonth = c.expiryMonth || c.expiry_month || '';
        const expiryYear = c.expiryYear || c.expiry_year || '';
        const expiry = c.expiry || `${String(expiryMonth).padStart(2, '0')}/${String(expiryYear).slice(-2)}`;

        // Determine card type
        const cardTypeRaw = c.cardType || c.card_type || '';
        const cardType = cardTypeRaw.toLowerCase();

        // Use cardholder name from card, not customer's actual name
        const cardholderName = c.cardholderName || c.cardholder_name || '';
        const nameParts = cardholderName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
          cardNumber: formattedCard,
          firstName: firstName,
          lastName: lastName,
          expiry: expiry,
          cvv: '', // CVV must be entered manually for security
          building: building,
          street: streetName,
          city: c.billingCity || c.billing_city || c.city || '',
          state: c.billingState || c.billing_state || c.state || '',
          zip: c.billingZip || c.billing_zip || c.zip || '',
          phone: c.phone || '',
          cardType: cardType
        };
      }
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
    }
  }

  return null;
};
