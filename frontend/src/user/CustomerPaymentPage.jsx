import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrderSummary from "../shared/OrderSummary";
import PaymentForm from "../shared/PaymentForm";
import PaymentConfirmationModal from "../shared/PaymentConfirmationModal";
import api from "../utils/api";

const CustomerPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get all data from previous page
  const cart = location.state?.cart || [];
  const tip = location.state?.tip || 0;
  const deliveryAddress = location.state?.deliveryAddress || {};
  const restaurant = location.state?.restaurant || { name: "Restaurant" };

  // Customer verification state
  const [customerId, setCustomerId] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [customerIdError, setCustomerIdError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Totals with discount calculation
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const serviceCharge = subtotal * 0.0825;

  // Calculate discount based on customer loyalty points
  // When customer has 100+ points, they get 10% discount (100 points will be deducted)
  const discount = useMemo(() => {
    if (!customerData) return 0;
    if (customerData.loyaltyPoints >= 100) {
      return subtotal * 0.10; // 10% discount when 100+ points
    }
    return 0; // No discount if less than 100 points
  }, [subtotal, customerData]);

  const total = subtotal + serviceCharge + tip - discount;
  // Note: Points are now automatically calculated and awarded by the backend

  // Payment modal state
  const [showModal, setShowModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderPlacedAt, setOrderPlacedAt] = useState(null);
  const [orderError, setOrderError] = useState('');

  // Handle customer ID verification
  const handleVerifyCustomer = async () => {
    if (!customerId || customerId.length === 0) {
      setCustomerIdError('Please enter a customer ID');
      return;
    }

    setIsVerifying(true);
    setCustomerIdError('');

    try {
      // Fetch customer payment info using the payment-info endpoint
      const customerResponse = await api.customers.getPaymentInfo(customerId);
      const data = customerResponse.data; // Spring Boot returns data in ApiResponse.data

      // Store customer data with all payment information
      const customerWithPoints = {
        customerId: data.customerId || data.customerID,
        firstName: data.firstName || data.first_name,
        lastName: data.lastName || data.last_name,
        name: `${data.firstName || data.first_name} ${data.lastName || data.last_name}`,
        email: data.email || '',
        phone: data.phone || '',
        cardNumber: data.cardNumberMasked || data.cardNumber || data.card_number_masked,
        cardType: data.cardType || data.card_type,
        cardName: data.cardholderName || data.cardholder_name || '',
        expiry: data.expiry || `${data.expiryMonth || data.expiry_month}/${data.expiryYear || data.expiry_year}`,
        cvv: data.cvv || '***',
        street: data.billingStreet || data.street || data.billing_street,
        city: data.billingCity || data.city || data.billing_city,
        state: data.billingState || data.state || data.billing_state,
        zip: data.billingZip || data.zip || data.billing_zip,
        loyaltyPoints: data.loyaltyPoints || data.loyalty_points || 0
      };

      setCustomerData(customerWithPoints);
      setCustomerIdError('');
    } catch (error) {
      console.error('Error fetching customer:', error);
      setCustomerIdError(error.message || 'Customer not found. Please check the ID.');
      setCustomerData(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle form submission
  const handlePaymentSubmit = async (data) => {
    setOrderError('');
    const on = Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(on);
    const placedAt = new Date();
    setOrderPlacedAt(placedAt);

    // Determine customer ID from either logged-in customer or payment form input
    const actualCustomerId = data.customerId || customerData?.customerId || null;

    // Save order to database - Spring Boot format
    const contactNameParts = (deliveryAddress.contactName || customerData?.name || 'Guest Customer').split(' ');
    const contactFirstName = contactNameParts[0] || 'Guest';
    const contactLastName = contactNameParts.slice(1).join(' ') || 'Customer';
    const contactPhone = (deliveryAddress.contactPhone || '0000000000').toString().replace(/\D/g, '').padStart(10, '0');
    const zipcode = (deliveryAddress.zip || '00000').toString().padStart(5, '0');

    const orderData = {
      restaurantIdFk: restaurant.id || restaurant.restaurantID || 1,
      buildingNumber: deliveryAddress.buildingNumber || '',
      streetName: deliveryAddress.streetName || '',
      unit: deliveryAddress.apartment || '',
      city: deliveryAddress.city || '',
      state: deliveryAddress.state || '',
      zipcode: zipcode,
      contactName: `${contactFirstName} ${contactLastName}`,
      contactPhone: contactPhone,
      paymentMethod: 'CARD',
      tipAmount: tip || 0,
      subtotalBeforeService: subtotal,
      serviceChargeRate: 0.08,
      grandTotal: total + (tip || 0),
      items: cart.map(item => ({
        itemIdFk: item.id,
        quantity: item.quantity,
        itemNameSnapshot: item.name,
        unitPriceSnapshot: item.price,
        itemSubtotal: item.price * item.quantity
      }))
    };

    // Add optional customer ID if available
    if (actualCustomerId) {
      orderData.customerIdFk = parseInt(actualCustomerId);
    }

    // Note: pointsToRedeem removed - backend calculates discount automatically based on customer's loyalty points

    try {
      await api.orders.create(orderData);

      // Note: Points are automatically awarded by the backend in the order creation endpoint
      // No need to call api.points.earn separately

      setShowModal(true);
    } catch (error) {
      setOrderError(error.message || 'Your order could not be placed. Please try again.');
    }
  };

  // Modal complete callback
  const handleModalComplete = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <div className="min-vh-100 bg-gradient-primary">
      {/* Header Section */}
      <div className="container-fluid py-4 py-lg-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div className="text-center text-white mb-4">
                {/* Back Button */}
                <button
                  className="btn btn-outline-light btn-sm rounded-pill px-3 mb-3 me-auto"
                  onClick={() => navigate(-1)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Cart
                </button>

                {/* Header Title */}
                <h1 className="display-6 fw-bold mb-3 text-shadow">
                  Secure Payment
                </h1>

                {/* Progress Breadcrumb */}
                <nav aria-label="Payment progress">
                  <div className="d-flex justify-content-center">
                    <div className="rounded-pill px-4 py-2 shadow-sm" style={{ background: '#ffffff' }}>
                      <div className="d-flex align-items-center small" style={{ color: '#374151' }}>
                        <span className="text-muted">Menu</span>
                        <i className="bi bi-chevron-right text-muted mx-2"></i>
                        <span className="text-muted">Review Order</span>
                        <i className="bi bi-chevron-right text-muted mx-2"></i>
                        <span style={{ color: '#92400e', fontWeight: 700 }}>Payment</span>
                      </div>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container pb-5">
        {orderError && <div className="alert alert-danger" role="alert">{orderError}</div>}
        <div className="row g-4 justify-content-center">
          {/* Order Summary */}
          <div className="col-12 col-lg-6">
            <OrderSummary
              cart={cart}
              deliveryAddress={deliveryAddress}
              subtotal={subtotal}
              serviceCharge={serviceCharge}
              tip={tip}
              total={total}
              discount={discount}
              customerData={customerData}
            />
          </div>

          {/* Payment Form */}
          <div className="col-12 col-lg-6">
            <PaymentForm
              onSubmit={handlePaymentSubmit}
              deliveryAddress={deliveryAddress}
              customerData={customerData}
              onVerifyCustomer={handleVerifyCustomer}
              customerId={customerId}
              setCustomerId={setCustomerId}
              isVerifying={isVerifying}
              customerIdError={customerIdError}
            />
          </div>
        </div>

        {/* Cancel Order Button */}
        <div className="row justify-content-center mt-4">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="text-center">
              <button
                className="btn btn-outline-light rounded-pill px-4 py-2"
                onClick={() => navigate("/")}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        show={showModal}
        onComplete={handleModalComplete}
        orderNumber={orderNumber}
        orderPlacedAt={orderPlacedAt}
        discount={discount}
        pointsEarned={customerData ? Math.floor(subtotal) : 0}
        customerData={customerData}
      />

      {/* Custom Styles */}
      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        }

        .text-shadow {
          text-shadow: 0 4px 12px rgba(0,0,0,0.3);
          letter-spacing: -0.02em;
        }

        .backdrop-blur {
          backdrop-filter: blur(10px);
        }

        .glass-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .gradient-header-green {
          background: linear-gradient(45deg, #f59e0b, #fbbf24);
        }

        .gradient-header-purple {
          background: linear-gradient(45deg, #f59e0b, #fbbf24);
        }
      `}</style>
    </div>
  );
};

export default CustomerPaymentPage;
