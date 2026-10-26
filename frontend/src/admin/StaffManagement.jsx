import React, { useState, useEffect } from "react";
import { Users, User, Mail, UserX } from "lucide-react";
import StaffModal from "./StaffModal";
import StaffDetailModal from "./StaffDetailModal";
import ConfirmationModal from "../shared/ConfirmationModal";
import StaffCredentialsModal from "../shared/StaffCredentialsModal";
import api from "../utils/api";

const StaffManagement = ({ staffList, setStaffList, triggerToast }) => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showStaffDetail, setShowStaffDetail] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newStaffCredentials, setNewStaffCredentials] = useState(null);

  // Load staff from API
  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await api.staff.getAll();
      // Transform API data to match existing format
      const transformed = response.data.map(s => ({
        staffID: s.staffID,
        fullName: `${s.firstName} ${s.lastName}`,
        username: s.usernameFk,
        email: s.email,
        phone: s.phone || 'N/A',
        status: s.status,
        addedDate: s.createdAt
      }));
      setStaffList(transformed);
    } catch (err) {
      triggerToast(err.message || 'Failed to load staff', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (fullName, email) => {
    try {
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || nameParts[0];

      const response = await api.staff.create({
        firstName,
        lastName,
        email: email || undefined, // Don't send empty string
        phone: undefined // Optional field - don't send if not provided
      });

      // Show credentials modal (response.data contains staff, username, password)
      setNewStaffCredentials({
        staffName: fullName,
        username: response.data.username,
        password: response.data.password,
        email: email
      });
      setShowCredentialsModal(true);

      triggerToast(`Staff added: ${fullName}`, "success");

      // Reload staff list
      loadStaff();
    } catch (err) {
      triggerToast(err.message || 'Failed to add staff', 'danger');
    }
  };

  const handleDeleteStaff = (index) => {
    const target = staffList[index];
    setStaffToRemove({ ...target, index });
    setShowConfirmModal(true);
  };

  const confirmRemoveStaff = async () => {
    if (!staffToRemove) return;

    try {
      await api.staff.delete(staffToRemove.staffID);
      triggerToast(`Removed staff: ${staffToRemove.fullName}`, "warning");
      loadStaff(); // Reload list
      setShowConfirmModal(false);
      setStaffToRemove(null);
    } catch (err) {
      setShowConfirmModal(false);
      setStaffToRemove(null);
      triggerToast(err.message || 'Failed to delete staff', 'danger');
    }
  };

  const handleStaffClick = (staff, index) => {
    setSelectedStaff({ ...staff, index });
    setShowStaffDetail(true);
  };

  const handleUpdateStaff = async (updatedStaff) => {
    try {
      await api.staff.update(updatedStaff.staffID, {
        firstName: updatedStaff.fullName.split(" ")[0],
        lastName: updatedStaff.fullName.split(" ").slice(1).join(" "),
        email: updatedStaff.email,
        phone: updatedStaff.phone,
        status: updatedStaff.status
      });
      triggerToast(`Updated staff: ${updatedStaff.fullName}`, "success");
      loadStaff(); // Reload list
    } catch (err) {
      triggerToast(err.message || 'Failed to update staff', 'danger');
    }
  };

  const handleCreateCredentials = async () => {
    if (selectedStaff) {
      try {
        const response = await api.staff.createCredentials(selectedStaff.staffID, {});
        alert(`New credentials generated!\nUsername: ${response.credentials.username}\nPassword: ${response.credentials.password}`);
        triggerToast(`New credentials generated for ${selectedStaff.fullName}`, "success");
      } catch (err) {
        triggerToast(err.message || 'Failed to create credentials', 'danger');
      }
    }
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

  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0'
  };

  const thStyle = {
    textAlign: 'left',
    padding: '1rem',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  };

  const tdStyle = {
    padding: '1rem',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle'
  };

  const rowStyle = {
    transition: 'background-color 0.2s ease',
    cursor: 'pointer'
  };

  const removeButtonStyle = {
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
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

  const avatarStyle = {
    width: '40px',
    height: '40px',
    backgroundColor: '#e2e8f0',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem'
  };

  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h3 className="mb-0 h5 fw-semibold">Staff Management</h3>
        </div>
        <div style={{...contentStyle, textAlign: 'center', padding: '3rem'}}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Users size={24} className="me-3" />
            <div>
              <h3 className="mb-0 h5 fw-semibold">Staff Management</h3>
              <small style={{ opacity: 0.8 }}>
                {staffList.length} {staffList.length === 1 ? 'member' : 'members'}
              </small>
            </div>
          </div>
          <StaffModal onAddStaff={handleAddStaff} />
        </div>
      </div>

      <div style={contentStyle}>
        {staffList.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={iconCircleStyle}>
              <Users size={32} color="#9ca3af" />
            </div>
            <h5 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No staff members yet</h5>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
              Add your first team member to get started
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>
                    <div className="d-flex align-items-center">
                      <User size={16} className="me-2" />
                      Staff Member
                    </div>
                  </th>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Password</th>
                  <th style={thStyle}>
                    <div className="d-flex align-items-center">
                      <Mail size={16} className="me-2" />
                      Email
                    </div>
                  </th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff, index) => (
                  <tr
                    key={index}
                    style={rowStyle}
                    onClick={() => handleStaffClick(staff, index)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title={`Click to view details for ${staff.fullName}`}
                  >
                    <td style={tdStyle}>
                      <div className="d-flex align-items-center">
                        <div style={avatarStyle}>
                          <User size={20} color="#64748b" />
                        </div>
                        <div>
                          <p className="mb-0 fw-medium text-dark">{staff.fullName}</p>
                          <small className="text-muted">Staff Member</small>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <code
                        style={{
                          backgroundColor: '#f1f5f9',
                          padding: '0.375rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {staff.username}
                      </code>
                    </td>
                    <td style={tdStyle}>
                      <code
                        style={{
                          backgroundColor: '#f1f5f9',
                          padding: '0.375rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        ••••••••
                      </code>
                    </td>
                    <td style={tdStyle}>
                      <div className="d-flex align-items-center">
                        <Mail size={16} color="#6b7280" className="me-2" />
                        <span style={{ color: '#374151' }}>{staff.email}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <button
                        style={removeButtonStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStaff(index);
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#b91c1c';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#dc2626';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.2)';
                        }}
                        title={`Remove ${staff.fullName}`}
                      >
                        <UserX size={14} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Detail Modal */}
      <StaffDetailModal
        show={showStaffDetail}
        onHide={() => setShowStaffDetail(false)}
        staff={selectedStaff}
        onUpdateStaff={handleUpdateStaff}
        onCreateCredentials={handleCreateCredentials}
      />

      {/* Confirmation Modal for Staff Removal */}
      <ConfirmationModal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setStaffToRemove(null);
        }}
        onConfirm={confirmRemoveStaff}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${staffToRemove?.fullName || 'this staff member'}? This will deactivate their account and revoke their access to the system.`}
        confirmText="Remove Staff"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Staff Credentials Modal */}
      {newStaffCredentials && (
        <StaffCredentialsModal
          show={showCredentialsModal}
          onHide={() => {
            setShowCredentialsModal(false);
            setNewStaffCredentials(null);
          }}
          staffName={newStaffCredentials.staffName}
          username={newStaffCredentials.username}
          password={newStaffCredentials.password}
          email={newStaffCredentials.email}
          triggerToast={triggerToast}
        />
      )}
    </div>
  );
};

export default StaffManagement;
