import React, { useState, useEffect } from "react";
import { Store, Plus, Trash2, Eye } from "lucide-react";
import api from "../utils/api";

const RestaurantManagement = ({ triggerToast }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    contactPerson: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Load restaurants from API
  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.restaurants.getAll();
      if (response.success) {
        // Get restaurant account info from Staff table
        const staffResponse = await api.staff.getAll();
        const restaurantAccounts = staffResponse.staff.filter(s => s.usertype === 'RESTAURANT');

        // Merge restaurant data with account info
        const merged = response.restaurants.map(r => {
          const account = restaurantAccounts.find(a =>
            a.first_name === r.name || a.email === r.email
          );
          return {
            ...r,
            hasAccount: !!account,
            username: account?.username,
            accountStatus: account?.status
          };
        });

        setRestaurants(merged);
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to load restaurants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateUsername = (name) => {
    // Generate username from restaurant name
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.length < 2) {
      errors.name = 'Restaurant name is required (min 2 characters)';
    }

    if (!formData.street) errors.street = 'Street address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state || formData.state.length !== 2) errors.state = 'Valid state code required (2 letters)';
    if (!formData.zip || !/^\d{5}$/.test(formData.zip)) errors.zip = 'Valid 5-digit ZIP code required';
    if (!formData.phone || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Valid 10-digit phone number required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email address required';
    }

    if (!formData.username || formData.username.length < 3) {
      errors.username = 'Username required (min 3 characters)';
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password required (min 6 characters)';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      triggerToast('Please fix form errors', 'error');
      return;
    }

    try {
      // 1. Create restaurant in Restaurant table
      const restaurantResponse = await api.restaurants.create({
        name: formData.name,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        phone: formData.phone,
        email: formData.email,
        contactPerson: formData.contactPerson
      });

      if (!restaurantResponse.success) {
        throw new Error(restaurantResponse.message || 'Failed to create restaurant');
      }

      // 2. Create login account in Staff table
      const accountResponse = await api.staff.create({
        username: formData.username,
        password: formData.password,
        firstName: formData.name,
        lastName: 'Restaurant',
        email: formData.email,
        phone: formData.phone,
        usertype: 'RESTAURANT',
        isFirstLogin: true
      });

      if (!accountResponse.success) {
        throw new Error(accountResponse.message || 'Failed to create account');
      }

      // Success
      triggerToast(
        `Restaurant added successfully!\nUsername: ${formData.username}\nPassword: ${formData.password}`,
        'success'
      );

      // Reset form and close modal
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',
        contactPerson: '',
        username: '',
        password: '',
        confirmPassword: ''
      });
      setFormErrors({});
      setShowModal(false);

      // Reload restaurants
      loadRestaurants();
    } catch (err) {
      triggerToast(err.message || 'Failed to add restaurant', 'error');
    }
  };

  const handleDelete = async (restaurant) => {
    if (!window.confirm(`Are you sure you want to delete ${restaurant.name}?`)) return;

    try {
      // Delete restaurant
      await api.restaurants.delete(restaurant.restaurantID);

      // TODO: Also delete associated account from Staff table if exists

      triggerToast(`Deleted restaurant: ${restaurant.name}`, 'warning');
      loadRestaurants();
    } catch (err) {
      triggerToast(err.message || 'Failed to delete restaurant', 'error');
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

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Store size={24} className="me-3" />
            <div>
              <h3 className="mb-0 h5 fw-semibold">Restaurant Management</h3>
              <small style={{ opacity: 0.8 }}>
                {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} registered
              </small>
            </div>
          </div>
          <button
            className="btn btn-light d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Add Restaurant
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Store size={48} className="mb-3" style={{ opacity: 0.3 }} />
            <p>No restaurants added yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Account</th>
                  <th>Username</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.restaurantID}>
                    <td className="fw-semibold">{restaurant.name}</td>
                    <td>
                      <small className="text-muted">
                        {restaurant.street}<br />
                        {restaurant.city}, {restaurant.state} {restaurant.zip}
                      </small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {restaurant.phone}<br />
                        {restaurant.email}
                      </small>
                    </td>
                    <td>
                      {restaurant.hasAccount ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-warning">No Account</span>
                      )}
                    </td>
                    <td>
                      <code>{restaurant.username || '-'}</code>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(restaurant)}
                        title="Delete restaurant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Restaurant Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={headerStyle}>
                <h5 className="modal-title d-flex align-items-center">
                  <Store size={24} className="me-2" />
                  Add New Restaurant
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <h6 className="border-bottom pb-2 mb-3">Restaurant Information</h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Restaurant Name *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (e.target.value) {
                            setFormData(prev => ({ ...prev, username: generateUsername(e.target.value) }));
                          }
                        }}
                        placeholder="e.g., Pizza Palace"
                      />
                      {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Contact Person</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="e.g., John Smith"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Street Address *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.street ? 'is-invalid' : ''}`}
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        placeholder="e.g., 123 Main Street"
                      />
                      {formErrors.street && <div className="invalid-feedback">{formErrors.street}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">City *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.city ? 'is-invalid' : ''}`}
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g., Dallas"
                      />
                      {formErrors.city && <div className="invalid-feedback">{formErrors.city}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">State *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.state ? 'is-invalid' : ''}`}
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                        placeholder="TX"
                        maxLength="2"
                      />
                      {formErrors.state && <div className="invalid-feedback">{formErrors.state}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">ZIP Code *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.zip ? 'is-invalid' : ''}`}
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        placeholder="75201"
                        maxLength="5"
                      />
                      {formErrors.zip && <div className="invalid-feedback">{formErrors.zip}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone *</label>
                      <input
                        type="tel"
                        className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="1234567890"
                      />
                      {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="restaurant@example.com"
                      />
                      {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                    </div>
                  </div>

                  <h6 className="border-bottom pb-2 mb-3">Login Credentials</h6>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Username *</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                          placeholder="username"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setFormData(prev => ({ ...prev, username: generateUsername(formData.name) }))}
                          title="Auto-generate from name"
                        >
                          <i className="bi bi-lightning-charge"></i>
                        </button>
                      </div>
                      {formErrors.username && <div className="invalid-feedback d-block">{formErrors.username}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Password *</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            const pwd = generatePassword();
                            setFormData(prev => ({ ...prev, password: pwd, confirmPassword: pwd }));
                          }}
                          title="Generate random password"
                        >
                          <i className="bi bi-lightning-charge"></i>
                        </button>
                      </div>
                      {formErrors.password && <div className="invalid-feedback d-block">{formErrors.password}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Confirm Password *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm password"
                      />
                      {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
                    </div>
                  </div>

                  {formData.username && formData.password && formData.password === formData.confirmPassword && (
                    <div className="alert alert-info mt-3">
                      <strong>Credentials Summary:</strong>
                      <div className="mt-2">
                        <code>Username: {formData.username}</code><br/>
                        <code>Password: {formData.password}</code>
                      </div>
                      <small className="text-muted d-block mt-2">
                        <i className="bi bi-info-circle me-1"></i>
                        Save these credentials to share with the restaurant.
                      </small>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dark">
                    <Plus size={18} className="me-1" />
                    Create Restaurant
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;
