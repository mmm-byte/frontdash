import React from "react";
import { Check, X, AlertCircle, Info } from "lucide-react";

const ToastNotification = ({ show, visible, message, setShow, type = "success" }) => {
  // Normalize props: support legacy `visible` without requiring setShow
  const isShown = typeof show === 'boolean' ? show : !!visible;
  const safeSetShow = typeof setShow === 'function' ? setShow : () => {};

  // Auto-hide only when parent supplied a setter
  React.useEffect(() => {
    if (isShown && typeof setShow === 'function') {
      const timer = setTimeout(() => safeSetShow(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isShown, setShow]);

  if (!isShown) return null;

  const { bgColor, icon } = (() => {
    switch (type) {
      case "success":
        return { bgColor: "#059669", icon: <Check size={20} /> };
      case "error":
        return { bgColor: "#dc2626", icon: <X size={20} /> };
      case "warning":
        return { bgColor: "#d97706", icon: <AlertCircle size={20} /> };
      case "info":
        return { bgColor: "#2563eb", icon: <Info size={20} /> };
      default:
        return { bgColor: "#334155", icon: <Check size={20} /> };
    }
  })();

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 1055,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        transform: 'translateX(0)',
        opacity: 1
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        style={{
          backgroundColor: bgColor,
          color: 'white',
          padding: '12px 16px',
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>{icon}</div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{message}</span>
          <button
            onClick={() => safeSetShow(false)}
            style={{
              marginLeft: 8,
              background: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              padding: 4
            }}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
