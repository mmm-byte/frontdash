import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { isUsernameValid, isPasswordValid } from "../utils/security";

const LoginButton = () => {
  const [show, setShow] = useState(false);
  const [loginType, setLoginType] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleClose = () => {
    setShow(false);
    setLoginType(null);
    setUsername("");
    setPassword("");
    setError("");
    setSubmitted(false);
  };

  const handleShow = () => setShow(true);

  const handleTypeSelect = (type) => {
    setLoginType(type);
    setError("");
  };

  const handleLogin = async () => {
    setSubmitted(true);
    // Quick client-side pre-validation for clearer errors
    const u = (username || '').trim();
    const p = (password || '').trim();
    if (!u || !p) {
      setError('Both username and password are required.');
      return;
    }
    if (!isUsernameValid(loginType, u)) {
      setError('Username must be at least two letters followed by at least two digits (e.g., ab12).');
      return;
    }
    if (!isPasswordValid(p)) {
      setError('Password must be at least 6 chars with uppercase, lowercase, and a number.');
      return;
    }

    try {
      // Call API for authentication
      const response = await api.auth.login(username, password, loginType);

      if (response.success) {
        // Extract data from response (API returns {success, message, data})
        const userData = response.data || response;

        // Build name from available fields
        let displayName = userData.name ||
                         (userData.firstName && userData.lastName
                           ? `${userData.firstName} ${userData.lastName}`
                           : userData.restaurantName || username);

        // Store user session data in sessionStorage
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('name', displayName);
        sessionStorage.setItem('role', loginType);
        sessionStorage.setItem('usertype', userData.usertype || loginType);

        // Dispatch custom event to notify TopNav of session update
        window.dispatchEvent(new Event('sessionUpdate'));

        // Check if password change is required
        if (userData.passwordChanged === false) {
          // Store user data for password change page
          localStorage.setItem('user', JSON.stringify({
            username: username,
            role: loginType,
            usertype: userData.usertype,
            passwordChanged: false
          }));

          // Redirect to change password page
          navigate('/change-password', {
            state: {
              user: {
                username: username,
                role: loginType,
                usertype: userData.usertype
              }
            }
          });
          handleClose();
          return;
        }

        // Navigate based on role
        if (loginType === "restaurant") {
          // Store restaurant ID in localStorage
          if (userData.restaurantID) {
            localStorage.setItem('currentRestaurantId', userData.restaurantID);
          } else {
            console.error('[LOGIN] No restaurantID in userData!', userData);
          }
          navigate("/restaurant-dashboard");
        } else if (loginType === "staff") {
          localStorage.setItem('currentStaff', JSON.stringify({
            staffID: userData.staffID,
            name: displayName,
            email: userData.email,
            username: username
          }));
          navigate("/staff-dashboard");
        } else if (loginType === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate('/');
        }
        handleClose();
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <>
      <Button
        onClick={handleShow}
        style={{
          background: 'linear-gradient(135deg, #19382c 0%, #365b3e 100%)',
          border: 'none',
          borderRadius: '25px',
          padding: '12px 30px',
          fontWeight: '600',
          fontSize: '16px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          boxShadow: '0 8px 25px rgba(25, 56, 44, 0.2)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 12px 35px rgba(25, 56, 44, 0.28)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 25px rgba(25, 56, 44, 0.2)';
        }}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>Login</span>
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        centered
        backdrop="static"
        style={{
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '20px',
          border: 'none',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
        }}>
          <Modal.Header
            closeButton
            style={{
          background: 'linear-gradient(135deg, #19382c 0%, #365b3e 100%)',
              color: 'white',
              border: 'none',
              padding: '25px 30px'
            }}
          >
            <Modal.Title style={{
              fontWeight: '700',
              fontSize: '24px',
              textAlign: 'center',
              width: '100%',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {loginType ? `${loginType.charAt(0).toUpperCase() + loginType.slice(1)} Login` : 'Welcome Back'}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ padding: '40px 30px' }}>
            {!loginType ? (
              <div>
                <p style={{ textAlign: 'center', marginBottom: '30px', color: '#6c757d', fontSize: '16px', fontWeight: 500 }}>
                  Choose your login type
                </p>
                <div className="d-grid gap-3">
                  <Button onClick={() => handleTypeSelect('restaurant')} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', border: 'none', borderRadius: 15, padding: '15px 25px', fontWeight: 600 }}>🍽️ Restaurant Owner</Button>
                  <Button onClick={() => handleTypeSelect('staff')} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', border: 'none', borderRadius: 15, padding: '15px 25px', fontWeight: 600 }}>👥 Staff Member</Button>
                  <Button onClick={() => handleTypeSelect('admin')} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', border: 'none', borderRadius: 15, padding: '15px 25px', fontWeight: 600 }}>⚡ Administrator</Button>
                </div>
              </div>
            ) : (
              <Form>
                {error && (
                  <Alert
                    variant="danger"
                    style={{
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                      color: '#721c24',
                      fontWeight: '500'
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Form.Group className="mb-4">
                  <Form.Label style={{
                    fontWeight: '600',
                    color: '#495057',
                    marginBottom: '10px',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    isInvalid={submitted && !username.trim()}
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e9ecef',
                      padding: '15px 20px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                    }}
                  />
                  {submitted && !username.trim() && (
                    <div className="invalid-feedback d-block">Username is required</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{
                    fontWeight: '600',
                    color: '#495057',
                    marginBottom: '10px',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    isInvalid={submitted && !password.trim()}
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e9ecef',
                      padding: '15px 20px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                    }}
                  />
                  {submitted && !password.trim() && (
                    <div className="invalid-feedback d-block">Password is required</div>
                  )}
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Button
                      onClick={handleLogin}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 25px',
                        fontWeight: '600',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginRight: '10px',
                        boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.3)';
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => setLoginType(null)}
                      style={{
                        background: 'transparent',
                        border: '2px solid #6c757d',
                        borderRadius: '12px',
                        padding: '12px 25px',
                        fontWeight: '600',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#6c757d',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#6c757d';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6c757d';
                      }}
                    >
                      Back
                    </Button>
                  </div>

                  {loginType === 'restaurant' && (
                    <Button
                      onClick={() => {
                        handleClose();
                        navigate('/restaurant-registration');
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 25px',
                        fontWeight: '600',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 6px 20px rgba(86, 171, 47, 0.3)'
                      }}
                    >
                      Register
                    </Button>
                  )}
                </div>
              </Form>
            )}
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
};

export default LoginButton;
