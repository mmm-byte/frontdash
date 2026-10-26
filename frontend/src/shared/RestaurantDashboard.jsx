import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Sidebar from "./Sidebar";
import MenuManager from "./MenuManager";
import HoursManager from "./HoursManager";
import ContactManager from "./ContactManager";
import ChangePassword from "../staff/ChangePassword";
import Withdraw from "./Withdraw";
import OrdersSidebar from "./OrdersSidebar";
import OrderHistory from "./OrderHistory";
import DeliveryConfirmationModal from "./DeliveryConfirmationModal";
import ToastNotification from "./ToastNotification";

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("menu");
  const [showOrders, setShowOrders] = useState(true);
  const [restaurantData, setRestaurantData] = useState(null);

  // --- Orders State ---
  const [pendingOrders, setPendingOrders] = useState([]);
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [preparingTimestamps, setPreparingTimestamps] = useState({}); // Track when orders start preparing
  const [deliveryModal, setDeliveryModal] = useState({ show: false, customer: "" });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load restaurant data and pending orders on mount
  useEffect(() => {
    const loadRestaurantData = async () => {
      const restaurantId = localStorage.getItem('currentRestaurantId');
      if (restaurantId) {
        try {
          const response = await api.restaurants.getById(restaurantId);
          if (response.success && response.data) {
            setRestaurantData(response.data);
          }
        } catch (error) {
          console.error('Error loading restaurant data:', error);
        }
      } else {
        console.error('[DASHBOARD] No restaurantId in localStorage!');
      }
    };

    loadRestaurantData();
    loadPendingOrders();
    loadPreparingOrders();

    // Poll for new orders every 10 seconds
    const interval = setInterval(() => {
      loadPendingOrders();
      loadPreparingOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Load PENDING orders (new orders waiting for restaurant acceptance)
  const loadPendingOrders = async () => {
    try {
      const restaurantId = localStorage.getItem('currentRestaurantId');
      if (!restaurantId) return;

      const response = await api.orders.getAll({ status: 'PENDING' });
      if (response.success && response.data) {

        // Filter orders for this restaurant
        const restaurantOrders = response.data.filter(
          order => order.restaurantIdFk === parseInt(restaurantId)
        );

        // Sort by order time ascending (oldest first)
        restaurantOrders.sort((a, b) => new Date(a.orderTime) - new Date(b.orderTime));


        // Transform to UI format
        const formattedOrders = restaurantOrders.map(order => {
          return {
            id: order.orderID,
            customer: order.contactName || 'Customer',
            items: order.items && order.items.length > 0
              ? order.items.map(item => `${item.itemNameSnapshot || item.item_name_snapshot || 'Item'} (x${item.quantity})`)
              : ['No items'],
            time: new Date(order.orderTime).toLocaleString(),
            total: `$${parseFloat(order.grandTotal).toFixed(2)}`,
            address: `${order.buildingNumber || ''} ${order.streetName || ''}, ${order.city || ''}`,
            phone: order.contactPhone || 'N/A',
            orderData: order // Keep full order data for reference
          };
        });


        setPendingOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error loading pending orders:', error);
    }
  };

  // Load PREPARING orders (orders accepted by restaurant)
  const loadPreparingOrders = async () => {
    try {
      const restaurantId = localStorage.getItem('currentRestaurantId');
      if (!restaurantId) return;

      const response = await api.orders.getAll({ status: 'PREPARING' });
      if (response.success && response.data) {
        // Filter orders for this restaurant
        const restaurantOrders = response.data.filter(
          order => order.restaurantIdFk === parseInt(restaurantId)
        );

        // Sort by order time ascending (oldest first)
        restaurantOrders.sort((a, b) => new Date(a.orderTime) - new Date(b.orderTime));

        // Transform to UI format
        const formattedOrders = restaurantOrders.map(order => {
          return {
            id: order.orderID,
            customer: order.contactName || 'Customer',
            items: order.items && order.items.length > 0
              ? order.items.map(item => `${item.itemNameSnapshot || item.item_name_snapshot || 'Item'} (x${item.quantity})`)
              : ['No items'],
            time: new Date(order.orderTime).toLocaleString(),
            total: `$${parseFloat(order.grandTotal).toFixed(2)}`,
            address: `${order.buildingNumber || ''} ${order.streetName || ''}, ${order.city || ''}`,
            phone: order.contactPhone || 'N/A',
            eta: order.estimatedDeliveryTime || 'N/A',
            acceptedAt: order.orderTime ? new Date(order.orderTime).toLocaleString() : 'N/A'
          };
        });

        setPreparingOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error loading preparing orders:', error);
    }
  };

  const handleLogout = () => navigate("/");

  const handleAcceptOrder = async (order, eta) => {
    try {
      // Update order status to PREPARING in database
      const response = await api.orders.updateStatus(order.id, 'PREPARING');

      if (response.success) {
        triggerToast(`Order #${order.id} accepted! Now preparing...`, 'success');

        // Record when this order started preparing
        setPreparingTimestamps(prev => ({
          ...prev,
          [order.id]: Date.now()
        }));

        // Reload orders to sync with database
        setTimeout(() => {
          loadPendingOrders();
          loadPreparingOrders();
        }, 500);
      } else {
        triggerToast('Failed to accept order', 'error');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      triggerToast('Error accepting order', 'error');
    }
  };

  const handleMarkReady = async (order) => {
    try {
      // Update order status to READY_FOR_PICKUP
      const response = await api.orders.updateStatus(order.id, 'READY_FOR_PICKUP');

      if (response.success) {
        triggerToast(`Order #${order.id} is ready for pickup!`, 'success');

        // Optimistically update UI - immediately remove from preparing list
        setPreparingOrders(prev => prev.filter(o => o.id !== order.id));

        // Clear timestamp for this order
        setPreparingTimestamps(prev => {
          const updated = { ...prev };
          delete updated[order.id];
          return updated;
        });

        // Reload orders in background to sync with database
        loadPreparingOrders();
      } else {
        triggerToast('Failed to mark order as ready', 'error');
      }
    } catch (error) {
      console.error('Error marking order as ready:', error);
      triggerToast('Error marking order as ready', 'error');
    }
  };

  const triggerToast = (message, type='success') => {
    setToast({ show: true, message, type });
    setTimeout(()=> setToast(prev => ({ ...prev, show: false })), 2500);
  };

  // Generic header; no restaurant profile branding

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="page-hero gradient-yellow">
        <div className="container text-center">
          <h1 className="mb-1 fw-bold">Restaurant Dashboard</h1>
          <p className="mb-0" style={{ opacity: 0.85 }}>Manage your restaurant efficiently</p>
        </div>
      </div>
      <div className="d-flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
          restaurantName={restaurantData?.name}
        />

        <div className="flex-grow-1 p-4">
          {/* Top controls - Search and Orders toggle */}
          <div className="container-fluid mb-3">
            <div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowOrders(s => !s)}
                aria-pressed={showOrders}
              >
                {showOrders ? 'Hide Orders' : 'Show Orders'}
              </button>
              <span className="badge bg-success">Pending: {pendingOrders.length}</span>
              <span className="badge bg-primary">Preparing: {preparingOrders.length}</span>
            </div>
          </div>

          <div className="d-flex gap-4">
            {/* Main Content Area */}
            <div className="flex-grow-1">
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "20px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-soft)",
                  padding: "30px"
                }}
              >
                <div style={{ animation: 'fadein 250ms ease' }}>
                  {activeTab === 'menu' && <MenuManager restaurantId={restaurantData?.restaurantID} />}
                  {activeTab === 'hours' && <HoursManager restaurantId={restaurantData?.restaurantID} onSaved={(m)=> triggerToast(m)} />}
                  {activeTab === 'contact' && <ContactManager restaurantId={restaurantData?.restaurantID} onSaved={(m)=> triggerToast(m)} />}
                  {activeTab === 'orders' && <OrderHistory restaurantId={restaurantData?.restaurantID} />}
                  {activeTab === 'password' && <ChangePassword onSaved={(m)=> triggerToast(m)} />}
                  {activeTab === 'withdraw' && <Withdraw />}
                </div>
              </div>
            </div>

            {/* Orders Sidebar */}
            {showOrders && (
              <div style={{ width: "350px" }}>
                <OrdersSidebar
                  pendingOrders={pendingOrders}
                  preparingOrders={preparingOrders}
                  preparingTimestamps={preparingTimestamps}
                  onAcceptOrder={handleAcceptOrder}
                  onMarkReady={handleMarkReady}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Confirmation Modal */}
      <DeliveryConfirmationModal
        show={deliveryModal.show}
        customer={deliveryModal.customer}
        onHide={() => setDeliveryModal({ show: false, customer: "" })}
      />
      <ToastNotification show={toast.show} message={toast.message} type={toast.type} setShow={(s)=> setToast(prev => ({ ...prev, show: s }))} />
      <style>{`@keyframes fadein{from{opacity:0; transform: translateY(6px)} to{opacity:1; transform: translateY(0)}}`}</style>
    </div>
  );
};

export default RestaurantDashboard;
