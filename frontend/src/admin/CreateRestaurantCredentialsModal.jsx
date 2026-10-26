import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Key, User, Eye, EyeOff, Check } from 'lucide-react';

const CreateRestaurantCredentialsModal = ({ show, onHide, restaurant, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Generate suggested username from restaurant name
  const generateUsername = () => {
    if (!restaurant?.name) return '';
    // Convert to lowercase, remove spaces and special chars
    const suggested = restaurant.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    setUsername(suggested);
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setConfirmPassword(pass);
  };

  const handleSubmit = () => {
    setError('');

    // Validation
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Submit credentials
    onSubmit({ username, password });

    // Reset form
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="md">
      <Modal.Header closeButton style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        borderBottom: 'none'
      }}>
        <Modal.Title className="d-flex align-items-center">
          <Key size={24} className="me-2" />
          Create Restaurant Login Credentials
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '2rem' }}>
        <div className="mb-4 p-3 bg-light rounded border">
          <h6 className="text-dark mb-2">Restaurant Details</h6>
          <p className="mb-1"><strong>Name:</strong> {restaurant?.name}</p>
          <p className="mb-0"><strong>Email:</strong> {restaurant?.payload?.email || 'N/A'}</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <User size={16} className="me-2" />
              Username
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="form-control-lg"
              />
              <Button
                variant="outline-secondary"
                onClick={generateUsername}
                title="Generate from restaurant name"
              >
                <i className="bi bi-lightning-charge"></i>
              </Button>
            </div>
            <Form.Text className="text-muted">
              Minimum 3 characters, lowercase letters and numbers only
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <Key size={16} className="me-2" />
              Password
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control-lg"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={generatePassword}
                title="Generate random password"
              >
                <i className="bi bi-lightning-charge"></i>
              </Button>
            </div>
            <Form.Text className="text-muted">
              Minimum 6 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <Key size={16} className="me-2" />
              Confirm Password
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control-lg"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </Form.Group>

          {username && password && password === confirmPassword && (
            <div className="alert alert-info">
              <strong>Credentials Summary:</strong>
              <div className="mt-2">
                <code>Username: {username}</code><br/>
                <code>Password: {password}</code>
              </div>
              <small className="text-muted d-block mt-2">
                <i className="bi bi-info-circle me-1"></i>
                Make sure to save these credentials and share them with the restaurant.
              </small>
            </div>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="dark"
          onClick={handleSubmit}
          disabled={!username || !password || password !== confirmPassword}
        >
          <Check size={18} className="me-1" />
          Create & Approve
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateRestaurantCredentialsModal;
