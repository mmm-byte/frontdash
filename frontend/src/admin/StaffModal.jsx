import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { Plus, Users, UserPlus } from "lucide-react";

const StaffModal = ({ onAddStaff }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  const handleClose = () => {
    setShow(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: ""
    });
    setErrors({
      firstName: "",
      lastName: "",
      email: ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: ""
    };
    let isValid = true;

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters long";
      isValid = false;
    } else if (!/^[A-Z][a-z]*$/.test(formData.firstName.trim())) {
      newErrors.firstName = "First name must be in Title Case (e.g., John)";
      isValid = false;
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters long";
      isValid = false;
    } else if (!/^[A-Z][a-z]*$/.test(formData.lastName.trim())) {
      newErrors.lastName = "Last name must be in Title Case (e.g., Smith)";
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      onAddStaff(fullName, formData.email.trim());
      handleClose();
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
        Add Staff Member
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
                <Users size={20} />
              </div>
              <div>
                <Modal.Title className="mb-0 h5">Add New Staff Member</Modal.Title>
                <small style={{ opacity: 0.8 }}>Enter staff member details to generate credentials</small>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="p-4">
            <Form>
              <Row>
                <Col md={6}>
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
                      isInvalid={!!errors.firstName}
                      style={{
                        borderRadius: '8px',
                        border: errors.firstName ? '2px solid #dc3545' : '2px solid #e2e8f0',
                        padding: '0.75rem',
                        fontSize: '0.95rem',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        if (!errors.firstName) e.target.style.borderColor = '#1e293b';
                      }}
                      onBlur={(e) => {
                        if (!errors.firstName) e.target.style.borderColor = '#e2e8f0';
                      }}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
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
                      isInvalid={!!errors.lastName}
                      style={{
                        borderRadius: '8px',
                        border: errors.lastName ? '2px solid #dc3545' : '2px solid #e2e8f0',
                        padding: '0.75rem',
                        fontSize: '0.95rem',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        if (!errors.lastName) e.target.style.borderColor = '#1e293b';
                      }}
                      onBlur={(e) => {
                        if (!errors.lastName) e.target.style.borderColor = '#e2e8f0';
                      }}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Text className="text-muted mb-3 d-block">
                The last name will be used to generate the username
              </Form.Text>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  Email Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  isInvalid={!!errors.email}
                  style={{
                    borderRadius: '8px',
                    border: errors.email ? '2px solid #dc3545' : '2px solid #e2e8f0',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) e.target.style.borderColor = '#1e293b';
                  }}
                  onBlur={(e) => {
                    if (!errors.email) e.target.style.borderColor = '#e2e8f0';
                  }}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
                {!errors.email && (
                  <Form.Text className="text-muted">
                    Credentials will be sent to this email address
                  </Form.Text>
                )}
              </Form.Group>

              <div
                className="p-3 rounded"
                style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd'
                }}
              >
                <div className="d-flex align-items-start">
                  <UserPlus size={16} className="me-2 mt-1" style={{ color: '#0284c7' }} />
                  <div>
                    <small className="fw-semibold" style={{ color: '#0284c7' }}>
                      Auto-Generated Credentials
                    </small>
                    <small className="d-block text-muted mt-1">
                      Username and password will be automatically generated based on the staff member's name.
                      Login credentials will be sent to the provided email address.
                    </small>
                  </div>
                </div>
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
              <UserPlus size={16} />
              Add Staff Member
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
};

export default StaffModal;
