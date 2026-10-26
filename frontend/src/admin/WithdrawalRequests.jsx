import React, { useState } from "react";
import api from "../utils/api";

const WithdrawalRequests = ({ requests, setRequests, onApprove, onReject }) => {
  const [loading, setLoading] = useState({});

  // Styling
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

  const requestCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.25rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const handleApprove = async (request, index) => {

    setLoading(prev => ({ ...prev, [index]: true }));

    try {

      // Call the API to process the withdrawal request
      const response = await api.restaurants.processRequest(
        request.id,
        'APPROVE',
        'Withdrawal approved by admin'
      );


      if (response.success) {
        // Remove from list or mark as approved
        const updated = requests.filter((_, i) => i !== index);
        setRequests(updated);

        if (onApprove) {
          onApprove(request);
        } else {
          alert(`${request.name} withdrawal approved`);
        }
      } else {
        console.error('❌ API returned failure:', response.message);
        alert(response.message || 'Failed to approve withdrawal');
      }
    } catch (error) {
      console.error('❌ Error approving withdrawal:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      alert(error.message || 'Failed to approve withdrawal. Check console for details.');
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleDisapprove = async (request, index) => {
    setLoading(prev => ({ ...prev, [index]: true }));

    try {
      // Call the API to reject the withdrawal request
      const response = await api.restaurants.processRequest(
        request.id,
        'REJECT',
        'Withdrawal rejected by admin'
      );

      if (response.success) {
        // Remove from list
        const updated = requests.filter((_, i) => i !== index);
        setRequests(updated);

        if (onReject) {
          onReject(request);
        } else {
          alert(`${request.name} withdrawal disapproved`);
        }
      } else {
        alert(response.message || 'Failed to reject withdrawal');
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert(error.message || 'Failed to reject withdrawal');
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="mb-4">
      <h4 className="text-purple">Restaurant Withdrawal Requests</h4>
      {requests.length === 0 ? (
        <p className="text-muted">No pending withdrawal requests</p>
      ) : (
        <div className="row">
          {requests.map((req, index) => (
            <div key={req.id || index} className="col-md-4 mb-3">
              <div style={requestCardStyle}>
                <h5 className="text-purple">{req.name}</h5>
                <p className="mb-1"><strong>Status:</strong> {req.status}</p>
                <p className="mb-1 text-muted small">Submitted: {req.submittedDate}</p>
                {req.status === "Pending" && (
                  <div className="mt-2">
                    <button
                      style={approveButtonStyle}
                      onClick={() => handleApprove(req, index)}
                      disabled={loading[index]}
                      onMouseOver={(e) => {
                        if (!loading[index]) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {loading[index] ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      style={rejectButtonStyle}
                      onClick={() => handleDisapprove(req, index)}
                      disabled={loading[index]}
                      onMouseOver={(e) => {
                        if (!loading[index]) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {loading[index] ? 'Processing...' : 'Disapprove'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequests;
