import React, { useState } from "react";
import { Check, X, FileText } from "lucide-react";
import { Modal, Button } from "react-bootstrap";

const RequestsCards = ({ title, requests, setRequests, triggerToast, icon, onApprove, onReject }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleApprove = (index) => {
    const updated = [...requests];
    updated[index].status = "Approved";
    setRequests(updated);
    triggerToast(`${updated[index].name} approved`, "success");
    if (onApprove) onApprove(updated[index]);
  };

  const handleDisapprove = (index) => {
    const updated = [...requests];
    updated[index].status = "Disapproved";
    setRequests(updated);
    triggerToast(`${updated[index].name} disapproved`, "warning");
    if (onReject) onReject(updated[index]);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Approved":
        return "badge bg-success";
      case "Disapproved":
        return "badge bg-danger";
      case "Pending":
        return "badge bg-warning text-dark";
      default:
        return "badge bg-secondary";
    }
  };

  const openDetails = (index) => {
    setSelectedIndex(index);
    setShowModal(true);
  };

  const closeDetails = () => {
    setShowModal(false);
    setSelectedIndex(null);
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    marginBottom: '2rem'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    color: 'white',
    padding: '1.5rem',
    borderBottom: '1px solid #475569'
  };

  const contentStyle = {
    padding: '1.5rem'
  };

  const requestCardStyle = {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.25rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  const buttonStyle = {
    borderRadius: '8px',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer'
  };

  const approveButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(45deg, #22c55e, #16a34a)',
    color: 'white',
    marginRight: '0.5rem'
  };

  const rejectButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc2626',
    color: 'white'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '3rem 0',
    color: '#6b7280'
  };

  const iconCircleStyle = {
    width: '64px',
    height: '64px',
    backgroundColor: '#f3f4f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem'
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div className="d-flex align-items-center">
          {icon && <span className="me-3">{icon}</span>}
          <div>
            <h3 className="mb-0 h5 fw-semibold">{title}</h3>
            <small style={{ opacity: 0.8 }}>
              {requests.filter(r => r.status === "Pending").length} pending requests
            </small>
          </div>
        </div>
      </div>

      <div style={contentStyle}>
        {requests.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={iconCircleStyle}>
              <FileText size={32} color="#9ca3af" />
            </div>
            <h5 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No requests found</h5>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
              All requests will appear here
            </p>
          </div>
        ) : (
          <div className="row g-4">
              {requests.map((req, index) => (
                <div key={req.id} className="col-lg-4 col-md-6">
                <div
                  style={requestCardStyle}
                  role="button"
                  onClick={() => openDetails(index)}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-semibold text-dark mb-1">{req.name}</h5>
                      <small className="text-muted">Submitted: {req.submittedDate}</small>
                    </div>
                    <span className={getStatusBadgeClass(req.status)}>
                      {req.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="badge bg-light text-dark border">
                      <FileText size={12} className="me-1" />
                      {req.requestType}
                    </span>
                  </div>

                  {req.status === "Pending" && (
                    <div className="d-flex gap-2">
                      <button
                        style={approveButtonStyle}
                        onClick={(e) => { e.stopPropagation(); handleApprove(index); }}
                        onMouseEnter={(e) => e.target.style.filter = 'brightness(1.1)'}
                        onMouseLeave={(e) => e.target.style.filter = 'none'}
                      >
                        <Check size={16} style={{ marginRight: '0.25rem' }} />
                        Approve
                      </button>
                      <button
                        style={rejectButtonStyle}
                        onClick={(e) => { e.stopPropagation(); handleDisapprove(index); }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                      >
                        <X size={16} style={{ marginRight: '0.25rem' }} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal show={showModal} onHide={closeDetails} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{title} - Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedIndex !== null && (
            <div>
              <p className="mb-1"><strong>Name:</strong> {requests[selectedIndex].name}</p>
              <p className="mb-1"><strong>Type:</strong> {requests[selectedIndex].requestType}</p>
              <p className="mb-1"><strong>Submitted:</strong> {requests[selectedIndex].submittedDate}</p>
              <p className="mb-1"><strong>Status:</strong> {requests[selectedIndex].status}</p>
              {requests[selectedIndex].payload ? (
                <div className="mt-3 p-3 bg-light rounded border">
                  <small className="text-muted d-block mb-2"><strong>Restaurant Details:</strong></small>
                  {(() => {
                    // Try to get restaurant data from either payload.restaurant or directly from payload
                    const rest = requests[selectedIndex].payload.restaurant || requests[selectedIndex].payload;
                    return (
                      <>
                        <small className="text-muted d-block"><strong>Restaurant Name:</strong> {
                          rest.name ||
                          requests[selectedIndex].payload.restaurantName ||
                          'N/A'
                        }</small>
                        <small className="text-muted d-block"><strong>Building:</strong> {
                          rest.buildingNumber ||
                          rest.building_number ||
                          rest.building ||
                          'N/A'
                        }</small>
                        <small className="text-muted d-block"><strong>Street:</strong> {
                          rest.street ||
                          'N/A'
                        }</small>
                        <small className="text-muted d-block"><strong>City:</strong> {
                          rest.city ||
                          'N/A'
                        }</small>
                        <small className="text-muted d-block"><strong>State:</strong> {
                          rest.state ||
                          'N/A'
                        }</small>
                        <small className="text-muted d-block"><strong>ZIP:</strong> {
                          rest.zip ||
                          'N/A'
                        }</small>
                        <small className="text-muted d-block"><strong>Phone:</strong> {
                          rest.phone ||
                          'N/A'
                        }</small>
                        <small className="text-muted d-block"><strong>Email:</strong> {
                          rest.email ||
                          'N/A'
                        }</small>
                        <small className="text-muted d-block"><strong>Contact Person:</strong> {
                          rest.contactName ||
                          rest.contact_name ||
                          rest.contactPerson ||
                          'N/A'
                        }</small>
                        <small className="text-muted d-block"><strong>Restaurant Status:</strong> {
                          rest.status ||
                          requests[selectedIndex].payload.status ||
                          'N/A'
                        }</small>
                        {(rest.hoursJson || rest.hours_json) && (
                          <small className="text-muted d-block"><strong>Hours:</strong> {
                            rest.hoursJson ||
                            rest.hours_json
                          }</small>
                        )}
                      </>
                    );
                  })()}
                  {requests[selectedIndex].payload.notes && (
                    <small className="text-muted d-block"><strong>Notes:</strong> {requests[selectedIndex].payload.notes}</small>
                  )}

                  {/* Menu Items Section */}
                  {requests[selectedIndex].payload.menuItems && requests[selectedIndex].payload.menuItems.length > 0 && (
                    <>
                      <hr className="my-2" />
                      <small className="text-muted d-block mb-2"><strong>Menu Items ({requests[selectedIndex].payload.menuItems.length}):</strong></small>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {requests[selectedIndex].payload.menuItems.map((item, idx) => (
                          <div key={idx} className="mb-2 p-2 bg-white rounded border">
                            <small className="d-block fw-bold">{item.name}</small>
                            <small className="text-muted d-block">
                              Price: ${parseFloat(item.price).toFixed(2)} |
                              Status: {item.availability || 'N/A'}
                            </small>
                            {item.description && (
                              <small className="text-muted d-block fst-italic">{item.description}</small>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <hr />
                  <small className="text-muted d-block"><strong>Restaurant ID:</strong> {
                    requests[selectedIndex].payload.restaurantID ||
                    requests[selectedIndex].payload.restaurantIdFk ||
                    'N/A'
                  }</small>
                  <small className="text-muted d-block"><strong>Request ID:</strong> {
                    requests[selectedIndex].payload.requestID ||
                    'N/A'
                  }</small>
                </div>
              ) : (
                <div className="mt-3 p-3 bg-light rounded border">
                  <small className="text-muted">No additional details were provided.</small>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedIndex !== null && requests[selectedIndex].status === 'Pending' && (
            <>
              <Button variant="dark" onClick={() => { handleApprove(selectedIndex); closeDetails(); }}>
                <Check size={16} className="me-1" /> Approve
              </Button>
              <Button variant="danger" onClick={() => { handleDisapprove(selectedIndex); closeDetails(); }}>
                <X size={16} className="me-1" /> Reject
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={closeDetails}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RequestsCards;
