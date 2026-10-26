import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../utils/api";
import "../styles/ContactManager.css";

const ContactManager = ({ onSaved, restaurantId }) => {
  const [contact, setContact] = useState({
    phone: "",
    email: "",
    address: "",
    contactPerson: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(contact);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Load current contact info from database
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const currentRestaurantId = restaurantId || localStorage.getItem('currentRestaurantId');
        if (!currentRestaurantId) {
          console.error('No restaurant ID available');
          setLoading(false);
          return;
        }

        const response = await api.restaurants.getById(currentRestaurantId);
        if (response.success && response.data) {
          const restaurant = response.data;
          const address = [restaurant.street, restaurant.city, restaurant.state, restaurant.zip]
            .filter(Boolean)
            .join(', ');

          setContact({
            phone: restaurant.phone || "",
            email: restaurant.email || "",
            address: address || "",
            contactPerson: restaurant.contactName || "",
          });
        }
      } catch (error) {
        console.error('Error loading contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContactInfo();
  }, [restaurantId]);

  const handleOpenModal = () => {
    setFormData(contact); // prefill with current contact info
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSave = async () => {
    const e = {};

    // Phone validation
    const digits = (formData.phone || '').replace(/\D/g, '');
    if (!digits) {
      e.phone = 'Phone number is required';
    } else if (!/^[1-9]\d{9}$/.test(digits)) {
      e.phone = 'Enter valid 10-digit phone (not starting with 0)';
    }

    // Email validation
    if (!formData.email) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Enter a valid email address';
    }

    // Contact person validation
    if (!formData.contactPerson || formData.contactPerson.trim().length === 0) {
      e.contactPerson = 'Contact person name is required';
    } else if (formData.contactPerson.trim().length < 2) {
      e.contactPerson = 'Contact person name must be at least 2 characters';
    } else if (!/^[A-Za-z\s]+$/.test(formData.contactPerson)) {
      e.contactPerson = 'Contact person name should only contain letters and spaces';
    }

    setErrors(e);
    if (Object.keys(e).length === 0) {
      try {
        const currentRestaurantId = restaurantId || localStorage.getItem('currentRestaurantId');

        // Update restaurant contact info in database
        const response = await api.restaurants.update(currentRestaurantId, {
          phone: digits,
          email: formData.email,
          contactName: formData.contactPerson
        });

        if (response.success) {
          setContact({ ...formData, phone: digits });
          handleCloseModal();
          if (onSaved) onSaved('Contact information saved successfully');
        } else {
          if (onSaved) onSaved('Failed to save contact information');
        }
      } catch (error) {
        console.error('Error saving contact info:', error);
        if (onSaved) onSaved('Error saving contact information');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'phone') v = value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  if (loading) {
    return <div>Loading contact information...</div>;
  }

  return (
    <div>
      <h5>Contact Information</h5>
      <p><strong>Phone:</strong> {contact.phone || 'Not set'}</p>
      <p><strong>Email:</strong> {contact.email || 'Not set'}</p>
      <p><strong>Address:</strong> {contact.address || 'Not set'}</p>
      <p><strong>Contact Person:</strong> {contact.contactPerson || 'Not set'}</p>

      <button className="btn btn-primary" onClick={handleOpenModal}>
        Edit Contact Info
      </button>

      {/* Glass Effect Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <div className="glass-modal p-3 rounded">
          <Modal.Header closeButton>
            <Modal.Title>Edit Contact Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Phone <span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  isInvalid={!!errors.phone}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
                {!errors.phone && formData.phone && (
                  <Form.Text className="text-success">
                    ✓ Valid phone format
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email <span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="restaurant@example.com"
                  isInvalid={!!errors.email}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
                {!errors.email && formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <Form.Text className="text-success">
                    ✓ Valid email format
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  disabled
                  placeholder="Address is managed separately"
                />
                <Form.Text className="text-muted">
                  Address cannot be edited here
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Contact Person <span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Primary contact name"
                  isInvalid={!!errors.contactPerson}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactPerson}
                </Form.Control.Feedback>
                {!errors.contactPerson && formData.contactPerson && formData.contactPerson.trim().length >= 2 && (
                  <Form.Text className="text-success">
                    ✓ Valid name format
                  </Form.Text>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave}>
              Save Changes
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
};

export default ContactManager;
