import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/ChangePassword.css';
import api from '../utils/api';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const data = await api.auth.changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword,
        user.username
      );

      if (data.success) {
        // Update user in localStorage to reflect password changed
        const updatedUser = { ...user, passwordChanged: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Redirect to appropriate dashboard
        const role = user.role || user.usertype?.toLowerCase();
        if (role === 'admin') {
          navigate('/admin-dashboard');
        } else if (role === 'staff') {
          navigate('/staff-dashboard');
        } else if (role === 'restaurant') {
          navigate('/restaurant-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Don't allow cancel - they must change password
    setError('You must change your password before continuing');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Change Password Required</h2>
        <p className="password-notice">
          Your account was created by an administrator. For security reasons, you must change your password before continuing.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password *</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password *</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
              required
              disabled={loading}
            />
            <small className="password-requirements">
              Must be at least 8 characters with uppercase, lowercase, and number
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>

        <div className="password-tips">
          <h4>Password Requirements:</h4>
          <ul>
            <li>At least 8 characters long</li>
            <li>Contains uppercase letter (A-Z)</li>
            <li>Contains lowercase letter (a-z)</li>
            <li>Contains number (0-9)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
