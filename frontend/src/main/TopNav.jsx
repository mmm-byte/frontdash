import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginButton from './LoginButton';

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const checkUser = () => {
    try {
      // Check both sessionStorage (for admin/staff/restaurant) and localStorage (for customers)
      const sessionUser = sessionStorage.getItem('username');
      const sessionName = sessionStorage.getItem('name');
      const sessionRole = sessionStorage.getItem('role');

      if (sessionUser) {
        setUser({ name: sessionName || sessionUser, role: sessionRole });
      } else {
        const u = JSON.parse(localStorage.getItem('currentUser') || 'null');
        setUser(u);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser(); // Check on mount and route change

    window.addEventListener('storage', checkUser);

    // Custom event listener for session updates
    const handleSessionUpdate = () => checkUser();
    window.addEventListener('sessionUpdate', handleSessionUpdate);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('sessionUpdate', handleSessionUpdate);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    // Clear both storages
    localStorage.removeItem('currentUser');
    sessionStorage.clear();
    setUser(null);
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <nav
      className="frontdash-app-nav w-100"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1030,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-soft)'
      }}
    >
      <div className="container d-flex align-items-center justify-content-between" style={{ padding: '10px 0' }}>
        <button
          onClick={handleLogoClick}
          className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2"
          style={{ color: 'var(--color-text)', fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.25rem' }}
        >
          <span className="frontdash-topnav-icon" aria-hidden="true">F</span>
          <span>FrontDash</span>
        </button>
        <div className="d-flex align-items-center gap-3">
          {user ? (
            <>
              <small className="text-muted">Hi, {user.name}</small>
              <button
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '8px 24px',
                  fontWeight: '700',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
                }}
                onClick={handleLogout}
              >
                LOGOUT
              </button>
            </>
          ) : (
            location.pathname !== '/customer-login' &&
            location.pathname !== '/customer-menu' &&
            location.pathname !== '/customer-cart' &&
            <LoginButton />
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
