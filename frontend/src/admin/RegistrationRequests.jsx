import React from "react";

const RegistrationRequests = ({ requests, setRequests }) => {
  const handleApprove = (index) => {
    const updated = [...requests];
    updated[index].status = "Approved";
    setRequests(updated);
    alert(`${updated[index].name} approved`);
  };

  const handleDisapprove = (index) => {
    const updated = [...requests];
    updated[index].status = "Disapproved";
    setRequests(updated);
    alert(`${updated[index].name} disapproved`);
  };

  return (
    <div className="mb-4">
      <h4 className="text-purple">Restaurant Registration Requests</h4>
      <div className="row">
        {requests.map((req, index) => (
          <div key={index} className="col-md-4 mb-3">
            <div className="card border-purple p-2">
              <h5>{req.name}</h5>
              <p>Status: {req.status}</p>
              {req.status === "Pending" && (
                <>
                  <button
                    className="btn btn-purple me-2"
                    onClick={() => handleApprove(index)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-outline-purple"
                    onClick={() => handleDisapprove(index)}
                  >
                    Disapprove
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegistrationRequests;
