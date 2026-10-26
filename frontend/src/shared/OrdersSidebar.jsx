import React, { useState, useEffect } from "react";

const OrdersSidebar = ({ pendingOrders, preparingOrders, preparingTimestamps = {}, onAcceptOrder, onMarkReady }) => {
  const [etaInputs, setEtaInputs] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second ONLY if there are preparing orders that need countdown
  useEffect(() => {
    // Check if any preparing orders are still in countdown (less than 3 seconds)
    const hasActiveCountdown = preparingOrders.some(order => {
      const startTime = preparingTimestamps[order.id] || preparingTimestamps[order.orderID];
      if (!startTime) return false;
      const elapsed = Date.now() - startTime;
      return elapsed < 3000;
    });

    if (!hasActiveCountdown) return; // Don't set interval if no countdowns active

    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [preparingOrders, preparingTimestamps]);

  const handleEtaChange = (orderId, value) => {
    setEtaInputs((prev) => ({ ...prev, [orderId]: value }));
  };

  const OrderCard = ({ order, type, children }) => (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(76, 175, 80, 0.2)",
        boxShadow: "0 8px 25px rgba(76, 175, 80, 0.1)",
        padding: "16px",
        marginBottom: "12px",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(76, 175, 80, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(76, 175, 80, 0.1)";
      }}
    >
      {/* Order Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6
          style={{
            color: "#2d5016",
            fontWeight: "700",
            margin: "0",
            fontSize: "1rem"
          }}
        >
          👤 {order.customer}
        </h6>
        <div
          style={{
            background: type === 'pending'
              ? "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)"
              : "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "20px",
            fontSize: "0.7rem",
            fontWeight: "600"
          }}
        >
          {type === 'pending' ? '⏳ New' : '👨‍🍳 Preparing'}
        </div>
      </div>

      {/* Order Details */}
      <div style={{ marginBottom: "12px" }}>
        <p style={{
          color: "#4a7c59",
          margin: "0",
          fontSize: "0.85rem",
          fontWeight: "500"
        }}>
          🍽️ Items: {order.items && order.items.length > 0
            ? (Array.isArray(order.items) && typeof order.items[0] === 'object'
                ? order.items.map(item => item.itemNameSnapshot).join(", ")
                : order.items.join(", "))
            : "No items"}
        </p>
        {order.time && (
          <p style={{
            color: "#666",
            margin: "4px 0 0 0",
            fontSize: "0.8rem"
          }}>
            🕒 Ordered: {order.time}
          </p>
        )}
        {order.total && (
          <p style={{
            color: "#4caf50",
            margin: "4px 0 0 0",
            fontSize: "0.9rem",
            fontWeight: "600"
          }}>
            💰 Total: {order.total}
          </p>
        )}
        {order.eta && (
          <p style={{
            color: "#ff9800",
            margin: "4px 0 0 0",
            fontSize: "0.85rem",
            fontWeight: "600"
          }}>
            ⏱️ ETA: {order.eta}
          </p>
        )}
        {order.acceptedAt && (
          <p style={{
            color: "#666",
            margin: "4px 0 0 0",
            fontSize: "0.8rem"
          }}>
            ✅ Accepted: {order.acceptedAt}
          </p>
        )}
      </div>

      {children}
    </div>
  );

  const SectionHeader = ({ title, count, icon, color }) => (
    <div
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "16px",
        color: "white",
        textAlign: "center",
        boxShadow: `0 8px 20px ${color}33`
      }}
    >
      <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{icon}</div>
      <h6 style={{ margin: "0", fontWeight: "700", fontSize: "1rem" }}>
        {title}
      </h6>
      <small style={{ opacity: "0.9" }}>
        {count} order{count !== 1 ? 's' : ''}
      </small>
    </div>
  );

  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 252, 248, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        border: "1px solid rgba(76, 175, 80, 0.2)",
        boxShadow: "0 15px 40px rgba(76, 175, 80, 0.1)",
        padding: "25px",
        height: "fit-content",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto"
      }}
    >
      {/* Main Header */}
      <div className="text-center mb-4">
        <h5
          style={{
            color: "#2d5016",
            fontWeight: "800",
            marginBottom: "5px",
            fontSize: "1.4rem"
          }}
        >
          📋 Order Queue
        </h5>
        <p style={{ color: "#4a7c59", margin: "0", fontSize: "0.9rem" }}>
          Real-time order management
        </p>
      </div>

      {/* Pending Orders Section */}
      <SectionHeader
        title="Pending Orders"
        count={pendingOrders.length}
        icon="🔔"
        color="#ff9800"
      />

      {pendingOrders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "30px 20px",
            background: "rgba(76, 175, 80, 0.05)",
            borderRadius: "12px",
            marginBottom: "20px",
            border: "2px dashed rgba(76, 175, 80, 0.2)"
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px", opacity: "0.5" }}>
            🎉
          </div>
          <p style={{
            color: "#4a7c59",
            margin: "0",
            fontStyle: "italic",
            fontSize: "0.9rem"
          }}>
            No pending orders.<br/>
            <small>All caught up!</small>
          </p>
        </div>
      ) : (
        pendingOrders.map((order) => (
          <OrderCard key={order.id} order={order} type="pending">
            <div className="d-flex align-items-center gap-2">
              <select
                style={{
                  borderRadius: "8px",
                  border: "2px solid #e8f5e8",
                  padding: "6px 8px",
                  fontSize: "0.8rem",
                  width: "100px",
                  background: "white",
                  cursor: "pointer"
                }}
                value={etaInputs[order.id] || "30 min"}
                onChange={(e) => handleEtaChange(order.id, e.target.value)}
              >
                <option value="15 min">15 min</option>
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="1 hour">1 hour</option>
                <option value="90 min">90 min</option>
              </select>

              <button
                onClick={() => onAcceptOrder(order, etaInputs[order.id] || "30 min")}
                style={{
                  background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  flex: "1",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)"
                }}
              >
                ✅ Accept
              </button>
            </div>
          </OrderCard>
        ))
      )}

      {/* Preparing Orders Section */}
      <SectionHeader
        title="In Preparation"
        count={preparingOrders.length}
        icon="👨‍🍳"
        color="#4caf50"
      />

      {preparingOrders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "30px 20px",
            background: "rgba(76, 175, 80, 0.05)",
            borderRadius: "12px",
            border: "2px dashed rgba(76, 175, 80, 0.2)"
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px", opacity: "0.5" }}>
            👨‍🍳
          </div>
          <p style={{
            color: "#4a7c59",
            margin: "0",
            fontStyle: "italic",
            fontSize: "0.9rem"
          }}>
            No orders being prepared.<br/>
            <small>Ready for new orders!</small>
          </p>
        </div>
      ) : (
        preparingOrders.map((order) => {
          const preparingStartTime = preparingTimestamps[order.id] || preparingTimestamps[order.orderID];
          const elapsedSeconds = preparingStartTime ? Math.floor((currentTime - preparingStartTime) / 1000) : 9999;
          const showButton = elapsedSeconds >= 3; // Show button after 3 seconds

          return (
            <OrderCard key={order.id || order.orderID} order={order} type="preparing">
              {!showButton ? (
                <div
                  style={{
                    background: "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "100%",
                    textAlign: "center",
                    boxShadow: "0 6px 16px rgba(255, 152, 0, 0.3)"
                  }}
                >
                  👨‍🍳 Preparing... ({3 - elapsedSeconds}s)
                </div>
              ) : (
                <button
                  onClick={() => onMarkReady(order)}
                  style={{
                    background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    width: "100%",
                    transition: "all 0.3s ease",
                    boxShadow: "0 6px 16px rgba(76, 175, 80, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 20px rgba(76, 175, 80, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 6px 16px rgba(76, 175, 80, 0.3)";
                  }}
                >
                  ✅ Mark Ready for Pickup
                </button>
              )}
            </OrderCard>
          );
        })
      )}

      {/* Summary Stats */}
      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          background: "linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%)",
          borderRadius: "12px",
          border: "1px solid rgba(76, 175, 80, 0.2)"
        }}
      >
        <div className="text-center">
          <small style={{ color: "#4a7c59", fontWeight: "600" }}>
            📊 Current Orders
          </small>
          <div className="row mt-2">
            <div className="col-4 text-center">
              <div style={{ color: "#ff9800", fontWeight: "700", fontSize: "1.2rem" }}>
                {pendingOrders.length}
              </div>
              <small style={{ color: "#666" }}>Pending</small>
            </div>
            <div className="col-4 text-center">
              <div style={{ color: "#2196f3", fontWeight: "700", fontSize: "1.2rem" }}>
                {preparingOrders.length}
              </div>
              <small style={{ color: "#666" }}>Preparing</small>
            </div>
            <div className="col-4 text-center">
              <div style={{ color: "#4caf50", fontWeight: "700", fontSize: "1.2rem" }}>
                {pendingOrders.length + preparingOrders.length}
              </div>
              <small style={{ color: "#666" }}>Total</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersSidebar;
