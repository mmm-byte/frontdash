import React, { useState, useEffect } from "react";
import { Users, CheckCircle, XCircle, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import api from "../utils/api";

const CustomerRegistrationsManager = ({ onApproval }) => {
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      // Get PENDING customers awaiting approval
      const response = await api.customers.getPending();
      if (response && response.success && response.data) {
        // Format data to match expected structure
        const formatted = response.data.map(c => ({
          id: c.customerID,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          phone: c.phone,
          buildingNumber: c.billingStreet?.split(' ')[0] || '',
          streetName: c.billingStreet?.split(' ').slice(1).join(' ') || '',
          apartment: '',
          city: c.billingCity,
          state: c.billingState,
          zip: c.billingZip,
          cardNumber: c.cardNumberMasked,
          cardType: c.cardType?.toLowerCase(),
          cardName: `${c.firstName} ${c.lastName}`,
          expiryDate: `${String(c.expiryMonth).padStart(2, '0')}/${String(c.expiryYear).slice(-2)}`,
          status: 'pending',
          requestedAt: c.createdAt
        }));
        setRegistrations(formatted);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error loading customer registrations:', error);
      setRegistrations([]); // Set empty array on error
    }
  };

  const handleApprove = async (registration) => {
    try {
      const response = await api.customers.updateStatus(registration.id, 'APPROVED');

      if (response.success) {
        // Remove from pending list
        setRegistrations(registrations.filter(r => r.id !== registration.id));

        // Show approval modal with customer ID
        setSelectedRegistration(registration);
        setShowApprovalModal(true);
        setShowDetailsModal(false);

        if (onApproval) onApproval();
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Failed to approve registration. Please try again.');
    }
  };

  const handleReject = async (registration) => {
    if (!window.confirm(`Are you sure you want to reject the registration request from ${registration.name}?`)) {
      return;
    }

    try {
      const response = await api.customers.updateStatus(registration.id, 'REJECTED');

      if (response.success) {
        // Remove from pending list
        setRegistrations(registrations.filter(r => r.id !== registration.id));
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Failed to reject registration. Please try again.');
    }
  };

  const viewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailsModal(true);
  };

  const pendingCount = registrations.filter(r => r.status === 'pending').length;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <Users className="text-white" size={26} />
          </div>
          <div>
            <h4 className="mb-0 fw-bold">Customer Registrations</h4>
            <p className="text-muted mb-0 small">Pending: {pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      {registrations.length === 0 ? (
        <div className="text-center py-5">
          <Users size={60} className="text-muted mb-3" />
          <p className="text-muted">No pending registration requests</p>
        </div>
      ) : (
        <div className="row g-3">
          {registrations.map((registration) => (
            <div key={registration.id} className="col-12">
              <div
                className="card border-0 shadow-sm hover-shadow-lg"
                style={{
                  borderRadius: '15px',
                  transition: 'all 0.3s ease',
                  borderLeft: '4px solid #667eea'
                }}
              >
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h5 className="mb-0 fw-bold">{registration.name}</h5>
                        <span
                          className="badge rounded-pill"
                          style={{ background: '#fff3cd', color: '#856404' }}
                        >
                          Pending
                        </span>
                      </div>

                      <div className="row g-2 text-muted small">
                        <div className="col-md-4">
                          <Mail size={14} className="me-2" />
                          {registration.email}
                        </div>
                        <div className="col-md-4">
                          <Phone size={14} className="me-2" />
                          {registration.phone}
                        </div>
                        <div className="col-md-4">
                          <MapPin size={14} className="me-2" />
                          {registration.city}, {registration.state}
                        </div>
                      </div>

                      <p className="text-muted small mb-0 mt-2">
                        Requested: {new Date(registration.requestedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill"
                        onClick={() => viewDetails(registration)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-sm rounded-pill text-white"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                        onClick={() => handleApprove(registration)}
                      >
                        <CheckCircle size={16} className="me-1" />
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill"
                        onClick={() => handleReject(registration)}
                      >
                        <XCircle size={16} className="me-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRegistration && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 bg-light">
                <h5 className="modal-title fw-bold">Registration Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Personal Info */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Users size={20} className="text-primary" />
                    <h6 className="mb-0 fw-bold">Personal Information</h6>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="small text-muted">Name</label>
                      <p className="mb-0 fw-semibold">{selectedRegistration.name}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted">Email</label>
                      <p className="mb-0 fw-semibold">{selectedRegistration.email}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted">Phone</label>
                      <p className="mb-0 fw-semibold">{selectedRegistration.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <MapPin size={20} className="text-success" />
                    <h6 className="mb-0 fw-bold">Delivery Address</h6>
                  </div>
                  <p className="mb-0">
                    {selectedRegistration.buildingNumber} {selectedRegistration.streetName}
                    {selectedRegistration.apartment && `, ${selectedRegistration.apartment}`}
                    <br />
                    {selectedRegistration.city}, {selectedRegistration.state} {selectedRegistration.zip}
                    <br />
                    {selectedRegistration.country}
                  </p>
                </div>

                {/* Card Info */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <CreditCard size={20} className="text-warning" />
                    <h6 className="mb-0 fw-bold">Payment Method</h6>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="small text-muted">Card Number</label>
                      <p className="mb-0 fw-semibold">•••• •••• •••• {selectedRegistration.cardNumber.slice(-4)}</p>
                    </div>
                    {selectedRegistration.cardType && (
                      <div className="col-md-12">
                        <label className="small text-muted">Card Type</label>
                        <p className="mb-0 fw-semibold text-capitalize">{selectedRegistration.cardType === 'amex' ? 'American Express' : selectedRegistration.cardType}</p>
                      </div>
                    )}
                    <div className="col-md-6">
                      <label className="small text-muted">Cardholder</label>
                      <p className="mb-0 fw-semibold">{selectedRegistration.cardName}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted">Expiry</label>
                      <p className="mb-0 fw-semibold">{selectedRegistration.expiryDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 bg-light">
                <button
                  className="btn btn-outline-danger rounded-pill"
                  onClick={() => handleReject(selectedRegistration)}
                >
                  <XCircle size={16} className="me-1" />
                  Reject
                </button>
                <button
                  className="btn text-white rounded-pill"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                  onClick={() => handleApprove(selectedRegistration)}
                >
                  <CheckCircle size={16} className="me-1" />
                  Approve Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Success Modal */}
      {showApprovalModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-body p-5 text-center">
                <div className="mb-4">
                  <CheckCircle size={80} className="text-success" />
                </div>
                <h4 className="fw-bold mb-3">Registration Approved!</h4>
                <p className="text-muted mb-4">
                  {selectedRegistration?.name}'s registration has been approved.
                </p>

                <div
                  className="p-4 rounded-3 mb-4"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  <p className="text-white mb-2 small">Customer Number</p>
                  <h2 className="text-white fw-bold mb-0 font-monospace">*********</h2>
                </div>

                <div className="alert alert-info">
                  <Mail size={16} className="me-2" />
                  This customer number has been "sent" to {selectedRegistration?.email}
                </div>

                <button
                  className="btn btn-primary btn-lg rounded-pill px-5"
                  onClick={() => setShowApprovalModal(false)}
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRegistrationsManager;
