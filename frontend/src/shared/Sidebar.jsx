import React from "react";
import { Nav } from "react-bootstrap";

const Sidebar = ({ activeTab, setActiveTab, handleLogout, restaurantName }) => {
  const menuItems = [
    { id: "menu", label: "Manage Menu", icon: "🍽️" },
    { id: "hours", label: "Opening Hours", icon: "🕒" },
    { id: "contact", label: "Contact Info", icon: "📞" },
    { id: "orders", label: "Order History", icon: "📦" },
    { id: "password", label: "Change Password", icon: "🔐" },
    { id: "withdraw", label: "Withdraw", icon: "⚠️", danger: true }
  ];

  const navItemStyle = (isActive, isDanger = false) => ({
    borderRadius: "12px",
    margin: "8px 0",
    padding: "12px 16px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    border: "none",
    background: isActive
      ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
      : "transparent",
    color: isActive
      ? "white"
      : isDanger
        ? "#d32f2f"
        : "#2d5016",
    boxShadow: isActive
      ? "0 8px 25px rgba(76, 175, 80, 0.3)"
      : "none",
    transform: isActive ? "translateY(-2px)" : "none"
  });

  const handleItemHover = (e, isEnter) => {
    if (!e.target.classList.contains('active')) {
      if (isEnter) {
        e.target.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
        e.target.style.transform = "translateX(8px)";
      } else {
        e.target.style.backgroundColor = "transparent";
        e.target.style.transform = "translateX(0)";
      }
    }
  };

  return (
    <div
      style={{
        width: "280px",
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 252, 248, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(76, 175, 80, 0.1)",
        boxShadow: "4px 0 20px rgba(45, 80, 22, 0.05)",
        padding: "30px 20px",
        minHeight: "100vh"
      }}
    >
      {/* Logo Section */}
      <div className="text-center mb-4">
        <div
          style={{
            background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "15px",
            boxShadow: "0 12px 30px rgba(76, 175, 80, 0.2)"
          }}
        >
          <h4
            style={{
              color: "white",
              fontWeight: "800",
              fontSize: "1.8rem",
              margin: "0",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            🍔 {restaurantName || 'Restaurant'}
          </h4>
        </div>
        <p style={{ color: "#4a7c59", fontSize: "0.9rem", margin: "0" }}>
          Your Restaurant Management
        </p>
      </div>

      {/* Navigation Items */}
      <Nav className="flex-column">
        {menuItems.map(item => (
          <Nav.Link
            key={item.id}
            className={activeTab === item.id ? 'active' : ''}
            onClick={() => setActiveTab(item.id)}
            style={navItemStyle(activeTab === item.id, item.danger)}
            onMouseEnter={(e) => handleItemHover(e, true)}
            onMouseLeave={(e) => handleItemHover(e, false)}
          >
            <span style={{ marginRight: "10px", fontSize: "16px" }}>
              {item.icon}
            </span>
            {item.label}
          </Nav.Link>
        ))}
      </Nav>

      {/* Quick Stats Section */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          right: "20px"
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "15px",
            background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.05) 100%)",
            borderRadius: "12px",
            border: "1px solid rgba(76, 175, 80, 0.2)",
            marginBottom: "10px"
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#4a7c59", fontWeight: "600", marginBottom: "8px" }}>
            🌱 eco-friendly dashborad
          </div>
          <small style={{ color: "#6b7280", fontSize: "0.7rem" }}>
            Version 2.0
          </small>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
