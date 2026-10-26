import React, { useState } from "react";
import { Truck, Phone, MapPin, Search, Filter, User, Calendar, UserX } from "lucide-react";
import DriverModal from "./DriverModal";
import DriverDetailModal from "./DriverDetailModal";
import ConfirmationModal from "../shared/ConfirmationModal";
import api from "../utils/api";

const DriverManagement = ({ drivers, setDrivers, triggerToast }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverDetail, setShowDriverDetail] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [driverToRemove, setDriverToRemove] = useState(null);

  const handleHireDriver = async (driverData) => {
    try {
      // firstName and lastName are now separate in driverData
      const firstName = driverData.firstName.trim();
      const lastName = driverData.lastName.trim();

      // Validate phone (must be exactly 10 digits for backend)
      let phone = driverData.phone.replace(/\D/g, '');
      if (!phone || phone.length < 10) {
        // Generate a dummy 10-digit phone if not provided
        phone = '0000000000';
      }

      // Call backend API with all fields
      const response = await api.drivers.create({
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        license: driverData.license || null,
        vehicle: driverData.vehicle || 'car'
      });

      // Backend returns driver in response.data
      const newDriver = {
        driverID: response.data.driverID,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        phone: phone,
        license: driverData.license || 'Not provided',
        vehicle: driverData.vehicle || 'car',
        status: response.data.status || 'HIRED',
        hired_at: response.data.hiredAt || new Date().toISOString()
      };

      setDrivers([...drivers, newDriver]);
      triggerToast(`Driver hired: ${firstName} ${lastName}`, "success");
      return true;
    } catch (error) {
      console.error('Error hiring driver:', error);
      triggerToast(`Failed to hire driver: ${error.message}`, "error");
      return false;
    }
  };

  const handleEditDriver = async (driver) => {
    // For now, just show a placeholder. You can implement an edit modal later
    triggerToast(`Edit functionality for ${driver.name} - Coming soon!`, "info");
    // TODO: Implement edit modal similar to DriverModal but with pre-filled data
  };

  const handleRemoveDriver = async (driver) => {
    // Show confirmation modal instead of window.confirm
    setDriverToRemove(driver);
    setShowConfirmModal(true);
  };

  const confirmRemoveDriver = async () => {
    if (!driverToRemove) return;

    const driverName = driverToRemove.name || `${driverToRemove.first_name} ${driverToRemove.last_name}`;

    try {
      const driverId = driverToRemove.driverID || driverToRemove.id;
      const response = await api.drivers.delete(driverId);

      if (response.success) {
        // Update the driver's status to FIRED
        setDrivers(drivers.map(d => {
          if ((d.driverID || d.id) === driverId) {
            // If backend returned updated driver data, use it
            if (response.data) {
              return {
                ...d,
                ...response.data,
                status: 'FIRED',
                fired_at: response.data.firedAt || new Date().toISOString(),
                firedAt: response.data.firedAt || new Date().toISOString()
              };
            }
            // Otherwise just update the status manually
            return {
              ...d,
              status: 'FIRED',
              fired_at: new Date().toISOString(),
              firedAt: new Date().toISOString()
            };
          }
          return d;
        }));
        triggerToast(`Driver terminated: ${driverName}`, "warning");
      }
    } catch (error) {
      console.error('Error removing driver:', error);
      triggerToast(`Failed to terminate driver: ${error.message}`, "error");
    } finally {
      setDriverToRemove(null);
    }
  };

  const handleFireDriver = async (driver) => {
    // Call handleRemoveDriver directly
    await handleRemoveDriver(driver);
  };

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
    setShowDriverDetail(true);
  };

  const getVehicleIcon = () => <Truck size={14} />;

  const getVehicleColor = (vehicleType) => {
    switch (vehicleType?.toLowerCase()) {
      case 'motorcycle': return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' };
      case 'car': return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
      case 'van': return { bg: '#e0e7ff', text: '#4338ca', border: '#a5b4fc' };
      case 'truck': return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
    }
  };

  const normalizedDrivers = drivers.map((driver, index) => {
    if (typeof driver === 'string') {
      return {
        id: index,
        name: driver,
        phone: 'Not provided',
        license: 'Not provided',
        vehicle: 'Not specified',
        hiredDate: 'Not recorded',
        status: 'active'
      };
    }

    // Handle database driver objects
    return {
      ...driver,
      name: driver.name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim(),
      phone: driver.phone || 'Not provided',
      license: driver.license || 'Not provided',
      vehicle: driver.vehicle || 'Not specified',
      hiredDate: (driver.hiredAt || driver.hired_at) ? new Date(driver.hiredAt || driver.hired_at).toLocaleDateString() : 'Not recorded',
      firedDate: (driver.firedAt || driver.fired_at) ? new Date(driver.firedAt || driver.fired_at).toLocaleDateString() : null,
      status: driver.status === 'HIRED' ? 'active' : 'inactive',
      isFired: driver.status === 'FIRED'
    };
  });

  const filteredDrivers = normalizedDrivers.filter(driver => {
    const name = driver.name || '';
    const phone = driver.phone || '';
    const license = driver.license || '';
    const vehicle = driver.vehicle || '';

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === "all" || vehicle.toLowerCase() === filterBy.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const vehicleTypes = [
    { value: "all", label: "All Vehicles" },
    { value: "motorcycle", label: "Motorcycles" },
    { value: "car", label: "Cars" },
    { value: "van", label: "Vans" },
    { value: "truck", label: "Trucks" }
  ];

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

  const terminateButtonStyle = {
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

  const searchInputStyle = {
    width: '100%',
    padding: '0.75rem',
    paddingLeft: '2.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s ease'
  };

  const selectStyle = {
    padding: '0.75rem',
    paddingLeft: '2.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.95rem',
    minWidth: '150px',
    transition: 'border-color 0.2s ease'
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

  const statCardStyle = {
    borderRadius: '12px',
    padding: '1rem',
    textAlign: 'center',
    border: '2px solid'
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Truck size={24} className="me-3" />
            <div>
              <h3 className="mb-0 h5 fw-semibold">Driver Management</h3>
              <small style={{ opacity: 0.8 }}>
                {drivers.length} {drivers.length === 1 ? 'driver' : 'drivers'}
              </small>
            </div>
          </div>
          <DriverModal onHireDriver={handleHireDriver} />
        </div>
      </div>

      <div style={contentStyle}>
        <div className="row g-3 mb-4">
          <div className="col-lg-8">
            <div className="position-relative">
              <Search
                size={20}
                color="#6b7280"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}
              />
              <input
                type="text"
                placeholder="Search drivers by name, phone, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyle}
                onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          <div className="col-lg-4">
            <div className="position-relative">
              <Filter
                size={20}
                color="#6b7280"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}
              />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                style={selectStyle}
                onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                {vehicleTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredDrivers.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={iconCircleStyle}>
              <Truck size={32} color="#9ca3af" />
            </div>
            <h5 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              {drivers.length === 0 ? "No drivers hired yet" : "No drivers match your search"}
            </h5>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
              {drivers.length === 0 ? "Hire your first driver to start deliveries" : "Try adjusting your search criteria"}
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
                      Driver
                    </div>
                  </th>
                  <th style={thStyle}>
                    <div className="d-flex align-items-center">
                      <Phone size={16} className="me-2" />
                      Contact
                    </div>
                  </th>
                  <th style={thStyle}>
                    <div className="d-flex align-items-center">
                      <MapPin size={16} className="me-2" />
                      License
                    </div>
                  </th>
                  <th style={thStyle}>
                    <div className="d-flex align-items-center">
                      <Truck size={16} className="me-2" />
                      Vehicle
                    </div>
                  </th>
                  <th style={thStyle}>
                    <div className="d-flex align-items-center">
                      <Calendar size={16} className="me-2" />
                      Hired Date
                    </div>
                  </th>
                  <th style={thStyle}>
                    <div className="d-flex align-items-center">
                      Status
                    </div>
                  </th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver, index) => {
                  const vehicleColors = getVehicleColor(driver.vehicle);
                  return (
                    <tr
                      key={driver.id || index}
                      style={rowStyle}
                      onClick={() => handleDriverClick(driver)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title={`Click to view details for ${driver.name}`}
                    >
                      <td style={tdStyle}>
                        <div className="d-flex align-items-center">
                          <div style={avatarStyle}>
                            <User size={20} color="#64748b" />
                          </div>
                          <div>
                            <p className="mb-0 fw-medium text-dark">{driver.name}</p>
                            <small className="text-muted">Delivery Driver</small>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div className="d-flex align-items-center">
                          <Phone size={16} color="#6b7280" className="me-2" />
                          <span style={{ fontSize: '0.875rem', color: '#374151' }}>{driver.phone}</span>
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
                          {driver.license}
                        </code>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: vehicleColors.bg,
                            color: vehicleColors.text,
                            border: `1px solid ${vehicleColors.border}`
                          }}
                        >
                          {getVehicleIcon()}
                          {driver.vehicle}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{driver.hiredDate}</span>
                      </td>
                      <td style={tdStyle}>
                        <div className="d-flex flex-column gap-1">
                          {driver.isFired ? (
                            <>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '12px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                  backgroundColor: '#fee2e2',
                                  color: '#991b1b',
                                  border: '1px solid #fca5a5',
                                  width: 'fit-content'
                                }}
                              >
                                INACTIVE
                              </span>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '12px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                  backgroundColor: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fcd34d',
                                  width: 'fit-content'
                                }}
                              >
                                FIRED
                              </span>
                              {driver.firedDate && (
                                <small style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                                  {driver.firedDate}
                                </small>
                              )}
                            </>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                backgroundColor: '#d1fae5',
                                color: '#065f46',
                                border: '1px solid #6ee7b7',
                                width: 'fit-content'
                              }}
                            >
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <button
                          style={terminateButtonStyle}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleFireDriver(driver);
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
                          title={`Terminate ${driver.name}`}
                        >
                          <UserX size={14} />
                          Terminate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {drivers.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '2px solid #f3f4f6' }}>
            <div className="row g-3">
              <div className="col-sm-6 col-lg-3">
                <div style={{ ...statCardStyle, backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}>
                  <h4 className="mb-0 fw-bold" style={{ color: '#475569' }}>{drivers.length}</h4>
                  <small className="fw-medium" style={{ color: '#64748b' }}>Total Drivers</small>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div style={{ ...statCardStyle, backgroundColor: '#dbeafe', borderColor: '#93c5fd' }}>
                  <h4 className="mb-0 fw-bold" style={{ color: '#1e40af' }}>
                    {normalizedDrivers.filter(d => d.status === 'active').length}
                  </h4>
                  <small className="fw-medium" style={{ color: '#2563eb' }}>Active</small>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div style={{ ...statCardStyle, backgroundColor: '#e0e7ff', borderColor: '#a5b4fc' }}>
                  <h4 className="mb-0 fw-bold" style={{ color: '#4338ca' }}>
                    {normalizedDrivers.filter(d => (d.vehicle || '').toLowerCase() === 'motorcycle').length}
                  </h4>
                  <small className="fw-medium" style={{ color: '#4f46e5' }}>Motorcycles</small>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div style={{ ...statCardStyle, backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }}>
                  <h4 className="mb-0 fw-bold" style={{ color: '#374151' }}>
                    {normalizedDrivers.filter(d => ['car', 'van', 'truck'].includes((d.vehicle || '').toLowerCase())).length}
                  </h4>
                  <small className="fw-medium" style={{ color: '#4b5563' }}>Vehicles</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Driver Detail Modal */}
      <DriverDetailModal
        show={showDriverDetail}
        onHide={() => setShowDriverDetail(false)}
        driver={selectedDriver}
        onEdit={handleEditDriver}
        onRemove={handleRemoveDriver}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setDriverToRemove(null);
        }}
        onConfirm={confirmRemoveDriver}
        title="Remove Driver"
        message={`Are you sure you want to remove ${driverToRemove?.name || 'this driver'}? This action cannot be undone.`}
        confirmText="Remove Driver"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default DriverManagement;
