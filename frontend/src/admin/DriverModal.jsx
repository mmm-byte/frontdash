import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Plus, Truck } from "lucide-react";
import api from "../utils/api";

const DriverModal = ({ onHireDriver }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    license: "",
    vehicle: "car"
  });
  const [errors, setErrors] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState("");
  const [licenseWarning, setLicenseWarning] = useState("");
  const firstName = formData.firstName;
  const lastName = formData.lastName;
  const license = formData.license;

  const handleClose = () => {
    setShow(false);
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      license: "",
      vehicle: "car"
    });
    setErrors({});
    setDuplicateWarning("");
    setLicenseWarning("");
  };

  // Check for duplicate driver name when both first and last name are entered
  useEffect(() => {
    const checkDuplicate = async () => {
      // Only check if both names are entered
      if (!firstName.trim() || !lastName.trim()) {
        setDuplicateWarning("");
        return;
      }

      try {
        const response = await api.drivers.getAll();
        if (response.success && response.drivers) {
          const existingDriver = response.drivers.find(
            driver =>
              driver.first_name?.toLowerCase() === firstName.trim().toLowerCase() &&
              driver.last_name?.toLowerCase() === lastName.trim().toLowerCase() &&
              driver.status === 'HIRED'
          );

          if (existingDriver) {
            setDuplicateWarning(`A driver named ${firstName} ${lastName} already exists`);
          } else {
            setDuplicateWarning("");
          }
        }
      } catch (error) {
        console.error("Error checking duplicate:", error);
      }
    };

    // Debounce the check by 500ms
    const timeoutId = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timeoutId);
  }, [firstName, lastName]);

  // Check for duplicate license number
  useEffect(() => {
    const checkLicense = async () => {
      // Only check if license is entered
      if (!license.trim()) {
        setLicenseWarning("");
        return;
      }

      try {
        const response = await api.drivers.getAll();
        if (response.success && response.drivers) {
          const existingDriver = response.drivers.find(
            driver =>
              driver.license?.toLowerCase() === license.trim().toLowerCase() &&
              driver.status === 'HIRED'
          );

          if (existingDriver) {
            setLicenseWarning(`License number ${license} is already assigned to ${existingDriver.first_name} ${existingDriver.last_name}`);
          } else {
            setLicenseWarning("");
          }
        }
      } catch (error) {
        console.error("Error checking license:", error);
      }
    };

    // Debounce the check by 500ms
    const timeoutId = setTimeout(checkLicense, 500);
    return () => clearTimeout(timeoutId);
  }, [license]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'phone') v = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleSave = () => {
    const e = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      e.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      e.firstName = 'First name must be at least 2 characters';
    } else if (!/^[A-Z][a-z]*$/.test(formData.firstName.trim())) {
      e.firstName = 'First name must be in Title Case (e.g., John)';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      e.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      e.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[A-Z][a-z]*$/.test(formData.lastName.trim())) {
      e.lastName = 'Last name must be in Title Case (e.g., Smith)';
    }

    // Validate phone if provided
    if (formData.phone && formData.phone.length > 0) {
      if (formData.phone.length !== 10) {
        e.phone = 'Phone number must be exactly 10 digits';
      } else if (formData.phone.startsWith('0')) {
        e.phone = 'Phone number cannot start with 0';
      }
    }

    // Check for duplicate warning
    if (duplicateWarning) {
      e.duplicate = duplicateWarning;
    }

    // Check for license warning
    if (licenseWarning) {
      e.license = licenseWarning;
    }

    setErrors(e);
    if (Object.keys(e).length === 0) {
      // Combine first and last name for display
      const driverData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`
      };
      const success = onHireDriver(driverData);
      if (success !== false) {
        handleClose();
      }
    }
  };

  const modalStyle = {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  };

  const modalContentStyle = {
    borderRadius: '16px',
    border: 'none',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    color: 'white',
    border: 'none',
    padding: '1.5rem'
  };

  const buttonStyle = {
    backgroundColor: '#1e293b',
    borderColor: '#1e293b',
    borderRadius: '8px',
    fontWeight: '500',
    padding: '0.5rem 1.5rem',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const triggerButtonStyle = {
    ...buttonStyle,
    boxShadow: '0 4px 12px rgba(30, 41, 59, 0.3)',
    transform: 'translateY(0)',
    transition: 'all 0.2s ease'
  };

  return (
    <>
      <Button
        style={triggerButtonStyle}
        onClick={() => setShow(true)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#0f172a';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 16px rgba(30, 41, 59, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#1e293b';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(30, 41, 59, 0.3)';
        }}
      >
        <Plus size={16} />
        Hire Driver
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        centered
        style={modalStyle}
        backdrop="static"
      >
        <div style={modalContentStyle}>
          <Modal.Header closeButton style={headerStyle}>
            <div className="d-flex align-items-center">
              <div
                className="me-3"
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              >
                <Truck size={20} />
              </div>
              <div>
                <Modal.Title className="mb-0 h5">Hire New Driver</Modal.Title>
                <small style={{ opacity: 0.8 }}>Add a new driver to your delivery team</small>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="p-4">
            {duplicateWarning && (
              <Alert variant="danger" className="mb-3 d-flex align-items-center">
                <div>
                  <strong>Duplicate Driver:</strong> {duplicateWarning}
                </div>
              </Alert>
            )}

            {licenseWarning && (
              <Alert variant="warning" className="mb-3 d-flex align-items-center">
                <div>
                  <strong>License Already In Use:</strong> {licenseWarning}
                </div>
              </Alert>
            )}

            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  First Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g., John"
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
                {errors.firstName && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>{errors.firstName}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  Last Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g., Smith"
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
                {errors.lastName && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>{errors.lastName}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  Phone Number <span style={{ opacity: 0.6 }}>(optional)</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10 digits, no leading 0"
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                {errors.phone && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>{errors.phone}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  License Number <span style={{ opacity: 0.6 }}>(optional)</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  placeholder="Enter license number"
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                {errors.license && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>{errors.license}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">Vehicle Type</Form.Label>
                <Form.Select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="motorcycle">Motorcycle</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </Form.Select>
              </Form.Group>

              <div
                className="p-3 rounded"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <small className="text-muted">
                  <strong>Note:</strong> Names must be in Title Case (first letter uppercase). Phone must be 10 digits without leading 0.
                </small>
              </div>
            </Form>
          </Modal.Body>

          <Modal.Footer
            className="p-4"
            style={{
              backgroundColor: '#f8fafc',
              border: 'none'
            }}
          >
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              style={{
                borderRadius: '8px',
                fontWeight: '500',
                padding: '0.5rem 1.5rem'
              }}
            >
              Cancel
            </Button>
            <Button
              style={buttonStyle}
              onClick={handleSave}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0f172a'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1e293b'}
            >
              <Truck size={16} />
              Hire Driver
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
};

export default DriverModal;
