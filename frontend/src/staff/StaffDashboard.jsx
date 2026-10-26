import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import ToastNotification from "../shared/ToastNotification";
import ChangePassword from "./ChangePassword";
import {
  Key,
  Truck,
  MapPin,
  User,
  Package,
  CheckCircle,
  DollarSign,
  Phone
} from "lucide-react";

const StaffDashboard = () => {
  const navigate = useNavigate();

  // Authentication state
  const [currentStaff, setCurrentStaff] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [deliveredLog, setDeliveredLog] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [queueLength, setQueueLength] = useState(0);

  // Form states
  const [deliveryAmount, setDeliveryAmount] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Delivery log filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
  const [showMenu, setShowMenu] = useState(false); // Hamburger menu state

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Helper function to show toast
  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Load pending orders count from database
  const loadPendingOrdersCount = async () => {
    try {
      const response = await api.orders.getAll({ status: 'READY_FOR_PICKUP' });
      if (response.success && response.data) {
        setQueueLength(response.data.length);
      }
    } catch (error) {
      console.error('Error loading ready orders:', error);
    }
  };

  // Load available drivers from database
  const loadAvailableDrivers = async () => {
    try {
      const response = await api.drivers.getAvailable();
      if (response.success && response.data) {
        // Transform database drivers to match UI format
        const formattedDrivers = response.data.map(driver => ({
          id: driver.driverID,
          name: `${driver.firstName} ${driver.lastName}`,
          phone: driver.phone,
          license: driver.license || 'N/A',
          vehicle: driver.vehicle || 'car',
          hiredDate: driver.hiredAt ? new Date(driver.hiredAt).toISOString().split('T')[0] : '',
          status: driver.status === 'HIRED' ? 'active' : 'inactive'
        }));
        setAvailableDrivers(formattedDrivers);
      }
    } catch (error) {
      console.error('Error loading available drivers:', error);
    }
  };

  // Load retrieved orders from database
  const loadRetrievedOrders = async () => {
    try {
      // Load orders with RETRIEVED or IN_TRANSIT status (active orders)
      const response = await api.orders.getAll();
      if (response.success && response.data) {
        // Filter for only RETRIEVED and IN_TRANSIT orders
        const activeOrders = response.data.filter(order =>
          order.status === 'RETRIEVED' || order.status === 'IN_TRANSIT'
        );

        // Transform database orders to UI format
        const formattedOrders = await Promise.all(activeOrders.map(async (order) => {
          const address = `${order.buildingNumber || ''} ${order.streetName || ''}${order.unit ? ', ' + order.unit : ''}, ${order.city || ''}, ${order.state || ''}`.trim();

          // Get restaurant info
          let restaurantName = 'Unknown Restaurant';
          let restaurantAddress = 'Restaurant Address';
          try {
            const restaurantResponse = await api.restaurants.getById(order.restaurantIdFk);
            if (restaurantResponse.success && restaurantResponse.data) {
              const r = restaurantResponse.data;
              restaurantName = r.name;
              restaurantAddress = `${r.street}, ${r.city}, ${r.state} ${r.zip}`;
            }
          } catch (error) {
            console.error('Error loading restaurant info:', error);
          }

          // Get driver info if assigned
          let driverInfo = null;
          if (order.driverIdFk) {
            try {
              const driverResponse = await api.drivers.getById(order.driverIdFk);
              if (driverResponse.success && driverResponse.data) {
                driverInfo = {
                  id: order.driverIdFk,
                  name: `${driverResponse.data.firstName} ${driverResponse.data.lastName}`
                };
              }
            } catch (error) {
              console.error(`Error fetching driver ${order.driverIdFk}:`, error);
              driverInfo = {
                id: order.driverIdFk,
                name: 'Driver'
              };
            }
          }

          return {
            id: order.orderID,
            customer: order.contactName || 'Customer',
            customerPhone: order.contactPhone || 'Not provided',
            address,
            restaurant: restaurantName,
            restaurantAddress: restaurantAddress,
            status: order.status === 'IN_TRANSIT' ? 'In Transit' : 'Retrieved',
            eta: order.estimatedDeliveryTime || null,
            assignedDriver: driverInfo,
            placedAt: order.orderTime,
            total: parseFloat(order.grandTotal)
          };
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error loading retrieved orders:', error);
    }
  };

  // Load delivered orders from database for delivery log
  const loadDeliveredOrders = async () => {
    try {
      const response = await api.orders.getAll();
      if (response.success && response.data) {
        // Filter for only DELIVERED orders
        const deliveredOrders = response.data.filter(order => order.status === 'DELIVERED');

        // Transform to delivery log format
        const formattedLog = await Promise.all(deliveredOrders.map(async (order) => {
          // Get driver info if available
          let driverName = 'Unknown Driver';
          if (order.driverIdFk) {
            try {
              const driverResponse = await api.drivers.getById(order.driverIdFk);
              if (driverResponse.success && driverResponse.data) {
                driverName = `${driverResponse.data.firstName} ${driverResponse.data.lastName}`;
              }
            } catch (error) {
              console.error(`Error fetching driver ${order.driverIdFk}:`, error);
              driverName = 'Driver';
            }
          }

          return {
            orderId: order.orderID,
            customer: order.contactName || 'Customer',
            deliveredAt: order.deliveredAt || order.orderTime,
            amount: parseFloat(order.grandTotal),
            notes: `Delivered by ${driverName}`,
            driver: driverName,
            address: `${order.buildingNumber || ''} ${order.streetName || ''}${order.unit ? ', ' + order.unit : ''}, ${order.city || ''}, ${order.state || ''}`.trim()
          };
        }));

        // Sort by delivered time, most recent first
        formattedLog.sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt));

        setDeliveredLog(formattedLog);
      }
    } catch (error) {
      console.error('Error loading delivered orders:', error);
    }
  };

  useEffect(() => {
    // Check if this is first login
    const staffData = JSON.parse(localStorage.getItem('currentStaff') || '{}');
    if (staffData.isFirstLogin) {
      // Show change password modal for first login
      setShowChangePassword(true);
    }
    setCurrentStaff(staffData);

    // Load available drivers from database
    loadAvailableDrivers();

    // Load active orders (RETRIEVED and IN_TRANSIT) from database
    loadRetrievedOrders();

    // Load delivered orders from database for delivery log
    loadDeliveredOrders();

    // Load pending orders count from database
    loadPendingOrdersCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Filter delivered orders based on search and date
  const filteredDeliveredLog = deliveredLog.filter(delivery => {
    // Search filter (order ID or customer name)
    const matchesSearch = searchTerm === "" ||
      delivery.orderId.toString().includes(searchTerm) ||
      delivery.customer.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filter
    const deliveryDate = new Date(delivery.deliveredAt);
    const now = new Date();
    let matchesDate = true;

    if (dateFilter === "today") {
      matchesDate = deliveryDate.toDateString() === now.toDateString();
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = deliveryDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = deliveryDate >= monthAgo;
    }

    return matchesSearch && matchesDate;
  });

  // eslint-disable-next-line no-unused-vars
  const handleLogout = () => {
    localStorage.removeItem('currentStaff');
    navigate('/');
  };

  // Order Queue Management - Retrieve from database
  const retrieveNextOrder = async () => {
    // Check if staff is logged in
    if (!currentStaff) {
      alert('You must be logged in as staff to retrieve orders');
      navigate('/staff-login');
      return;
    }

    try {
      // Get READY_FOR_PICKUP orders from database (orders accepted by restaurant)
      const response = await api.orders.getAll({ status: 'READY_FOR_PICKUP' });

      if (!response.success || !response.data || response.data.length === 0) {
        alert('No orders ready for pickup. Waiting for restaurant to accept orders...');
        return;
      }

      // Get the oldest pending order
      const nextOrder = response.data[0];


      // Mark order as retrieved by updating status
      try {
        const staffData = localStorage.getItem('currentStaff');
        let staffId = null;
        if (staffData) {
          const staff = JSON.parse(staffData);
          staffId = staff.staffID;
        }
        await api.orders.updateStatus(nextOrder.orderID, 'RETRIEVED', staffId);
      } catch (statusError) {
        console.error('Status update failed:', statusError);
        throw new Error('Failed to update order status. Are you logged in as staff?');
      }

      // Format address
      const address = `${nextOrder.buildingNumber || ''} ${nextOrder.streetName || ''}${nextOrder.unit ? ', ' + nextOrder.unit : ''}, ${nextOrder.city || ''}, ${nextOrder.state || ''}`.trim();

      // Get restaurant info
      let restaurantName = 'Unknown Restaurant';
      let restaurantAddress = 'Restaurant Address';
      try {
        const restaurantResponse = await api.restaurants.getById(nextOrder.restaurantIdFk);
        if (restaurantResponse.success && restaurantResponse.data) {
          const r = restaurantResponse.data;
          restaurantName = r.name;
          restaurantAddress = `${r.street}, ${r.city}, ${r.state} ${r.zip}`;
        }
      } catch (error) {
        console.error('Error loading restaurant info:', error);
      }

      const order = {
        id: nextOrder.orderID,
        customer: nextOrder.contactName || 'Customer',
        customerPhone: nextOrder.contactPhone || 'Not provided',
        address,
        restaurant: restaurantName,
        restaurantAddress: restaurantAddress,
        status: 'Retrieved',
        eta: null,
        assignedDriver: null,
        placedAt: nextOrder.orderTime,
        total: parseFloat(nextOrder.grandTotal),
        items: [] // Will load items if needed
      };

      setOrders(prev => [order, ...prev]);

      // Update queue length
      setQueueLength(prev => prev - 1);

      // Reload all retrieved orders to ensure sync
      await loadRetrievedOrders();

    } catch (error) {
      console.error('Error retrieving order:', error);
      alert('Error retrieving order from database');
    }
  };

  // Driver Assignment - Auto-deliver after 3-4 seconds
  const assignDriver = async (orderId, driverId) => {
    const driver = availableDrivers.find(d => d.id === parseInt(driverId));
    if (!driver) return;

    try {
      // Assign driver via API
      const response = await api.orders.assignDriver(orderId, parseInt(driverId));

      if (response.success) {
        // Update order status to IN_TRANSIT
        await api.orders.updateStatus(orderId, 'IN_TRANSIT');

        // Update local state to show in-transit
        setOrders(prev => prev.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              assignedDriver: driver,
              status: 'IN_TRANSIT',
              assignedAt: new Date().toISOString()
            };
          }
          return order;
        }));

        showNotification(`Order #${orderId} assigned to ${driver.name}. Delivering...`, 'info');

        // Auto-deliver after 3-4 seconds
        const deliveryDelay = 3000 + Math.random() * 1000; // 3-4 seconds
        setTimeout(async () => {
          try {
            // Update status to DELIVERED in database
            await api.orders.updateStatus(orderId, 'DELIVERED');

            // Remove from active orders
            setOrders(prev => prev.filter(o => o.id !== orderId));

            // Reload delivery log to show the newly delivered order
            await loadDeliveredOrders();

            // Show success notification
            showNotification(`Order #${orderId} delivered successfully by ${driver.name}! 🎉`, 'success');

          } catch (error) {
            console.error('Error auto-delivering order:', error);
            showNotification(`Failed to deliver order #${orderId}. Please try again.`, 'error');
          }
        }, deliveryDelay);

      } else {
        showNotification(`Failed to assign driver: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      showNotification(`Error assigning driver: ${error.message || 'Unknown error'}`, 'error');
    }
  };  // Delivery Recording
  const recordDelivery = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !deliveryAmount) {
      alert('Please enter delivery amount');
      return;
    }

    const deliveryRecord = {
      orderId,
      customer: order.customer,
      deliveredAt: new Date().toISOString(),
      amount: parseFloat(deliveryAmount),
      notes: deliveryNotes,
      driver: order.assignedDriver?.name || 'Unknown',
      recordedBy: currentStaff?.username || 'staff'
    };

    setDeliveredLog(prev => [deliveryRecord, ...prev]);

    // Update order status
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'Delivered', deliveredAt: new Date().toISOString() } : o
    ));

    // Clear form
    setDeliveryAmount("");
    setDeliveryNotes("");

    alert('Delivery recorded successfully');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Retrieved': return '#f59e0b';
      case 'Assigned to Driver': return '#3b82f6';
      case 'Delivered': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #dbeafe 100%)' }}>
      {/* Toast Notification */}
      <ToastNotification
        show={showToast}
        setShow={setShowToast}
        message={toastMessage}
        type={toastType}
      />

      {/* Header */}
      <header className="py-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {/* Hamburger Menu */}
              <div className="position-relative me-3">
                <button
                  className="btn btn-outline-light d-flex align-items-center"
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  <div className="d-flex flex-column" style={{ gap: '3px' }}>
                    <div style={{ width: '20px', height: '2px', background: 'white' }}></div>
                    <div style={{ width: '20px', height: '2px', background: 'white' }}></div>
                    <div style={{ width: '20px', height: '2px', background: 'white' }}></div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <>
                    <div
                      className="position-fixed top-0 start-0 w-100 h-100"
                      style={{ zIndex: 1040 }}
                      onClick={() => setShowMenu(false)}
                    ></div>
                    <div
                      className="position-absolute start-0 mt-2 bg-white rounded shadow-lg"
                      style={{
                        zIndex: 1050,
                        minWidth: '220px',
                        overflow: 'hidden'
                      }}
                    >
                      <div className="list-group list-group-flush">
                        <button
                          className="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3"
                          onClick={() => {
                            setShowMenu(false);
                          }}
                        >
                          <i className="bi bi-graph-up" style={{ fontSize: '18px', color: '#3b82f6' }}></i>
                          <span>View Statistics</span>
                        </button>
                        <button
                          className="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3"
                          onClick={() => {
                            setShowMenu(false);
                          }}
                        >
                          <i className="bi bi-clock-history" style={{ fontSize: '18px', color: '#8b5cf6' }}></i>
                          <span>Order History</span>
                        </button>
                        <button
                          className="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3"
                          onClick={() => {
                            setShowMenu(false);
                          }}
                        >
                          <i className="bi bi-receipt" style={{ fontSize: '18px', color: '#10b981' }}></i>
                          <span>Reports</span>
                        </button>
                        <button
                          className="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3"
                          onClick={() => {
                            setShowMenu(false);
                          }}
                        >
                          <i className="bi bi-bell" style={{ fontSize: '18px', color: '#f59e0b' }}></i>
                          <span>Notifications</span>
                        </button>
                        <button
                          className="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3"
                          onClick={() => {
                            setShowChangePassword(true);
                            setShowMenu(false);
                          }}
                        >
                          <Key size={18} className="text-primary" />
                          <span>Change Password</span>
                        </button>
                        <button
                          className="list-group-item list-group-item-action d-flex align-items-center gap-2 py-3"
                          onClick={() => {
                            setShowMenu(false);
                          }}
                        >
                          <i className="bi bi-question-circle" style={{ fontSize: '18px', color: '#6b7280' }}></i>
                          <span>Help & Support</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Package size={32} className="me-3" />
              <div>
                <h1 className="h3 mb-0">Staff Dashboard</h1>
                <small style={{ opacity: 0.8 }}>
                  Welcome, {currentStaff?.name || 'Staff Member'}
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="text-end">
                <div className="small" style={{ opacity: 0.9 }}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="small" style={{ opacity: 0.7 }}>
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-fluid py-4">
        {/* Order Queue Management */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Package size={20} className="me-2" />
                  <h5 className="mb-0">Order Queue Management</h5>
                </div>
                <button
                  className="btn btn-light btn-sm d-flex align-items-center gap-2"
                  onClick={retrieveNextOrder}
                >
                  <Package size={16} />
                  Retrieve Next Order
                </button>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="text-center p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
                      <h6 className="text-primary mb-1">Queue Length</h6>
                      <h4 className="text-dark">{queueLength}</h4>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
                      <h6 className="text-success mb-1">Active Orders</h6>
                      <h4 className="text-dark">{orders.filter(o => o.status !== 'Delivered').length}</h4>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
                      <h6 className="text-info mb-1">Delivered Today</h6>
                      <h4 className="text-dark">{deliveredLog.length}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="row g-4 mb-4">
          {orders.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <Package size={48} className="text-muted mb-3" />
                  <h5 className="text-muted mb-2">No Active Orders</h5>
                  <p className="text-muted mb-3">Retrieve orders from the queue using the button above</p>
                </div>
              </div>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center" style={{ borderRadius: '16px 16px 0 0' }}>
                    <div className="d-flex align-items-center">
                      <div className="me-3 p-2 rounded" style={{ backgroundColor: '#f8fafc' }}>
                        <Package size={20} style={{ color: getStatusColor(order.status) }} />
                      </div>
                      <div>
                        <h6 className="mb-0">Order #{order.id}</h6>
                        <small className="text-muted">{order.restaurant}</small>
                      </div>
                    </div>
                    <span
                      className="badge px-3 py-2"
                      style={{
                        backgroundColor: getStatusColor(order.status) + '20',
                        color: getStatusColor(order.status),
                        borderRadius: '20px',
                        fontWeight: '500'
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                <div className="card-body">
                  {/* Customer Info */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <User size={16} className="me-2 text-muted" />
                      <strong>Customer:</strong> {order.customer}
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <Phone size={16} className="me-2 text-muted" />
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="d-flex align-items-start mb-2">
                      <MapPin size={16} className="me-2 text-muted mt-1" />
                      <span>{order.address}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <DollarSign size={16} className="me-2 text-muted" />
                      <strong>${order.total}</strong>
                    </div>
                  </div>

                  {/* Driver Assignment */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Truck size={16} className="me-2" />
                      <strong>Driver Assignment</strong>
                    </div>

                    {order.assignedDriver ? (
                      <div className="d-flex align-items-center p-2 bg-success bg-opacity-10 rounded">
                        <CheckCircle size={16} className="me-2 text-success" />
                        <span className="text-success">Assigned to {order.assignedDriver.name}</span>
                      </div>
                    ) : (
                      <div>
                        <select
                          className="form-select form-select-sm"
                          onChange={(e) => e.target.value && assignDriver(order.id, e.target.value)}
                          defaultValue=""
                          style={{
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0',
                            padding: '0.5rem',
                            fontSize: '0.9rem'
                          }}
                        >
                          <option value="">Select a driver...</option>
                          {availableDrivers.map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} ({driver.vehicle}) - {driver.deliveries} deliveries
                            </option>
                          ))}
                        </select>
                        {availableDrivers.length === 0 && (
                          <small className="text-muted mt-1 d-block">
                            No active drivers available. Please contact admin to add drivers.
                          </small>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delivery Recording */}
                  {order.status === 'Assigned to Driver' && (
                    <div className="border-top pt-3" style={{ marginTop: '1rem', borderColor: '#e9ecef !important' }}>
                      <h6 className="d-flex align-items-center mb-3">
                        <CheckCircle size={16} className="me-2 text-success" />
                        Record Delivery
                      </h6>

                      <div className="row g-2">
                        <div className="col-md-6">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Delivery amount ($)"
                            value={deliveryAmount}
                            onChange={(e) => setDeliveryAmount(e.target.value)}
                            step="0.01"
                            style={{
                              borderRadius: '8px',
                              border: '2px solid #e2e8f0',
                              padding: '0.5rem'
                            }}
                          />
                        </div>
                        <div className="col-md-6">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Notes (optional)"
                            value={deliveryNotes}
                            onChange={(e) => setDeliveryNotes(e.target.value)}
                            style={{
                              borderRadius: '8px',
                              border: '2px solid #e2e8f0',
                              padding: '0.5rem'
                            }}
                          />
                        </div>
                        <div className="col-12">
                          <button
                            className="btn btn-success btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                            onClick={() => recordDelivery(order.id)}
                            style={{
                              borderRadius: '8px',
                              fontWeight: '500',
                              padding: '0.6rem'
                            }}
                          >
                            <CheckCircle size={16} />
                            Mark as Delivered
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Delivery Log */}
        {deliveredLog.length > 0 && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-success text-white">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <CheckCircle size={20} className="me-2" />
                      <h5 className="mb-0">Delivery Log ({filteredDeliveredLog.length})</h5>
                    </div>
                    <span className="badge bg-white text-success">
                      Total: {deliveredLog.length} orders
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  {/* Search and Filter Controls */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by Order ID or Customer Name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setSearchTerm("")}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="btn-group w-100" role="group">
                        <button
                          type="button"
                          className={`btn ${dateFilter === 'all' ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => setDateFilter('all')}
                        >
                          All Time
                        </button>
                        <button
                          type="button"
                          className={`btn ${dateFilter === 'today' ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => setDateFilter('today')}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          className={`btn ${dateFilter === 'week' ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => setDateFilter('week')}
                        >
                          Last 7 Days
                        </button>
                        <button
                          type="button"
                          className={`btn ${dateFilter === 'month' ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => setDateFilter('month')}
                        >
                          Last 30 Days
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Table */}
                  <div style={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                    overflowX: 'auto'
                  }}>
                    {filteredDeliveredLog.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-2">No deliveries found matching your criteria</p>
                      </div>
                    ) : (
                      <table className="table table-hover table-striped">
                        <thead className="table-success sticky-top">
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Driver</th>
                            <th>Amount</th>
                            <th>Delivered At</th>
                            <th>Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDeliveredLog.map((delivery, index) => (
                            <tr key={index}>
                              <td>
                                <strong className="text-success">#{delivery.orderId}</strong>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <User size={16} className="me-2 text-muted" />
                                  {delivery.customer}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <Truck size={16} className="me-2 text-muted" />
                                  {delivery.driver}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <DollarSign size={16} className="text-success" />
                                  <strong>{delivery.amount.toFixed(2)}</strong>
                                </div>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {new Date(delivery.deliveredAt).toLocaleDateString()}<br/>
                                  {new Date(delivery.deliveredAt).toLocaleTimeString()}
                                </small>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <MapPin size={16} className="me-2 text-muted" />
                                  <small>{delivery.address || 'N/A'}</small>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-3 text-center text-muted">
        <small>© 2024 FrontDash Staff Operations</small>
      </footer>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword
          autoOpen={true}
          onSaved={(message) => {
            setShowChangePassword(false);
            showNotification(message || 'Password changed successfully!', 'success');
            // If this was first login, update the flag
            const staffData = JSON.parse(localStorage.getItem('currentStaff') || '{}');
            if (staffData.isFirstLogin) {
              staffData.isFirstLogin = false;
              localStorage.setItem('currentStaff', JSON.stringify(staffData));
              setCurrentStaff(staffData);
            }
          }}
          onCancel={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
