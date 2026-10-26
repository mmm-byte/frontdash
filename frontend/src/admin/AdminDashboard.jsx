import React, { useEffect, useState } from "react";
import { Settings, FileText, Users, Truck, CheckCircle, User, MapPin, DollarSign } from "lucide-react";
import RequestsCards from "./RequestsCards";
import WithdrawalRequests from "./WithdrawalRequests";
import StaffManagement from "./StaffManagement";
import DriverManagement from "./DriverManagement";
import CustomerRegistrationsManager from "./CustomerRegistrationsManager";
import ToastNotification from "../shared/ToastNotification";
import { isUsernameValid, generateTempPassword } from "../utils/security";
import api from "../utils/api";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[character]));

const AdminDashboard = () => {
  // State for restaurant requests - load from API
  const [restaurantRequests, setRestaurantRequests] = useState([]);

  // State for withdrawal requests - load from API
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // State for staff and drivers
  const [staffList, setStaffList] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Delivery log state
  const [deliveredLog, setDeliveredLog] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success"
  });

  // Fetch drivers from API on mount
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await api.drivers.getAll();
        if (response && response.success && response.data) {
          // Format driver data to include full name
          const formattedDrivers = response.data.map(driver => ({
            ...driver,
            name: `${driver.firstName} ${driver.lastName}`,
            first_name: driver.firstName,
            last_name: driver.lastName
          }));
          setDrivers(formattedDrivers);
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setDrivers([]);
      }
    };
    fetchDrivers();
  }, []);

  // Save drivers to localStorage whenever drivers state changes (removed - using database now)
  // useEffect(() => {
  //   localStorage.setItem('drivers', JSON.stringify(drivers));
  // }, [drivers]);

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
    // Load pending restaurant requests from API
    const fetchPendingRequests = async () => {
      try {
        const response = await api.restaurants.getAllRequests();

        if (response && response.success && response.data) {

          // Filter for PENDING REGISTRATION requests only
          const pendingRegistrations = response.data.filter(
            r => r.status === 'PENDING' && r.requestType === 'REGISTRATION'
          );


          // Fetch restaurant details for each request
          const formatted = await Promise.all(pendingRegistrations.map(async (r) => {
            let restaurantDetails = null;
            let menuItems = [];
            if (r.restaurantIdFk) {
              try {
                const restaurantResponse = await api.restaurants.getById(r.restaurantIdFk);
                if (restaurantResponse.success && restaurantResponse.data) {
                  restaurantDetails = restaurantResponse.data;
                }

                // Fetch menu items
                try {
                  const menuResponse = await api.restaurants.getMenu(r.restaurantIdFk);
                  if (menuResponse.success && menuResponse.data) {
                    menuItems = menuResponse.data;
                  }
                } catch (menuError) {
                  console.error(`Error fetching menu for restaurant ${r.restaurantIdFk}:`, menuError);
                }
              } catch (error) {
                console.error(`Error fetching restaurant ${r.restaurantIdFk}:`, error);
              }
            }

            const formattedRequest = {
              id: r.requestID,
              name: r.restaurantName || `Restaurant ${r.restaurantIdFk}`,
              status: 'Pending',
              submittedDate: new Date(r.submittedAt).toISOString().split('T')[0],
              requestType: 'Registration',
              restaurantID: r.restaurantIdFk,
              payload: {
                ...restaurantDetails,
                ...r,
                restaurant: restaurantDetails,
                menuItems: menuItems
              }
            };

            return formattedRequest;
          }));

          setRestaurantRequests(formatted);

          // Filter for PENDING WITHDRAWAL requests
          const pendingWithdrawals = response.data.filter(
            r => r.status === 'PENDING' && r.requestType === 'WITHDRAWAL'
          );


          const formattedWithdrawals = pendingWithdrawals.map(r => ({
            id: r.requestID,
            name: r.restaurantName || `Restaurant ${r.restaurantIdFk}`,
            status: 'Pending',
            submittedDate: new Date(r.submittedAt).toISOString().split('T')[0],
            requestType: 'Withdrawal',
            restaurantID: r.restaurantIdFk,
            payload: r
          }));
          setWithdrawalRequests(formattedWithdrawals);
        } else {
          console.error('[AdminDashboard] Invalid response structure:', response);
        }
      } catch (error) {
        console.error('Error fetching pending restaurant requests:', error);
      }
    };

    fetchPendingRequests();

    // Seed staff accounts once, and migrate any legacy hashed entries back to plaintext per requirements
    (async () => {
      try {
        const existing = JSON.parse(localStorage.getItem('staffAccounts') || '[]');
        let list = existing;
        if (!Array.isArray(list) || list.length === 0) {
          const seedBase = [
            { fullName: 'John Doe', username: 'doe23', email: 'john@example.com' },
            { fullName: 'Jane Smith', username: 'smith45', email: 'jane@example.com' }
          ];
          // Generate compliant passwords and store as plaintext per updated requirements
          const seeded = [];
          for (const s of seedBase) {
            let username = s.username;
            if (!isUsernameValid('staff', username)) {
              const base = (s.fullName.split(' ').slice(-1)[0] || 'st').slice(0, 2).toLowerCase();
              username = `${base}${Math.floor(Math.random() * 900 + 100)}`;
            }
            // Set known, policy-compliant demo passwords so you can log in
            let password = 'StaffPass1!';
            if (s.fullName.toLowerCase().includes('john')) password = 'JohnPass1!';
            if (s.fullName.toLowerCase().includes('jane')) password = 'JanePass1!';
            seeded.push({ ...s, username, password, addedDate: new Date().toISOString() });
          }
          list = seeded;
        } else {
          // Migrate any records that only have `passwordHash` to a new plaintext temp password
          list = list.map((s) => {
            if (!s.password && s.passwordHash) {
              return { ...s, password: generateTempPassword(8) };
            }
            return s;
          });
        }
        localStorage.setItem('staffAccounts', JSON.stringify(list));
        setStaffList(list);
      } catch {}
    })();
    loadDeliveredOrders();
  }, []);

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

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

  const setToastShow = (show) => {
    setToast(prev => ({ ...prev, show }));
  };

  // Handlers for stat panel clicks
  const handleStaffClick = () => {
    document.getElementById('staff-management')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDriverClick = () => {
    document.getElementById('driver-management')?.scrollIntoView({ behavior: 'smooth' });
  };

  const pendingRegCount = restaurantRequests.filter(r => r.status === "Pending").length;
  const pendingWithdrawals = withdrawalRequests.filter(r => r.status === "Pending").length;

  const statPanelStyle = {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: 16,
    padding: '14px 16px',
    boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center'
  };

  const footerStyle = {
    backgroundColor: '#0f172a',
    color: '#cbd5e1',
    borderTop: '1px solid #1e293b'
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="page-hero gradient-yellow">
        <div className="container py-4 py-md-5">
          <div className="text-center mb-4">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.18)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
            }}>
              <Settings size={28} />
            </div>
            <h1 className="mb-1 fw-bold">Admin Dashboard</h1>
            <p className="mb-0" style={{ opacity: 0.9 }}>Complete platform management and control center</p>
          </div>

          {/* Compact Quick Stats */}
          <div className="row g-3 g-md-4 justify-content-center">
            <div className="col-12 col-sm-6 col-lg-3">
              <div style={statPanelStyle}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(59,130,246,0.12)', color: '#1d4ed8', marginRight: 12
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '1.75rem', lineHeight: 1, color: '#1f2937' }}>{pendingRegCount}</div>
                  <small className="text-muted">Pending Registrations</small>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div style={statPanelStyle}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(245,158,11,0.12)', color: '#b45309', marginRight: 12
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '1.75rem', lineHeight: 1, color: '#1f2937' }}>{pendingWithdrawals}</div>
                  <small className="text-muted">Pending Withdrawals</small>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div
                style={statPanelStyle}
                onClick={handleStaffClick}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(99,102,241,0.12)', color: '#4338ca', marginRight: 12
                }}>
                  <Users size={20} />
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '1.75rem', lineHeight: 1, color: '#1f2937' }}>{staffList.length}</div>
                  <small className="text-muted">Staff Members</small>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div
                style={statPanelStyle}
                onClick={handleDriverClick}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(16,185,129,0.12)', color: '#047857', marginRight: 12
                }}>
                  <Truck size={20} />
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '1.75rem', lineHeight: 1, color: '#1f2937' }}>{drivers.length}</div>
                  <small className="text-muted">Active Drivers</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-5">
        {/* Restaurant Registration Requests */}
        <RequestsCards
          title="Restaurant Registration Requests"
          requests={restaurantRequests}
          setRequests={setRestaurantRequests}
          triggerToast={triggerToast}
          icon={<FileText size={24} />}
          onApprove={async (req) => {
            try {
              // Auto-generate username from restaurant name (4 letters + 2 digits format)
              // Extract only letters from restaurant name, limit to 4 letters
              const nameLetters = req.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 4);
              // Ensure we have at least 2 letters (fallback to 'rest' if needed)
              const letterPart = nameLetters.length >= 2 ? nameLetters : 'rest';
              // Pad with random letters if less than 4 characters
              const paddedLetters = letterPart.length < 4
                ? letterPart + 'abcdefghijklmnopqrstuvwxyz'.substring(0, 4 - letterPart.length)
                : letterPart.substring(0, 4);
              // Add 2 random digits at the end
              const username = `${paddedLetters}${Math.floor(10 + Math.random() * 90)}`;

              // Auto-generate temporary password
              const tempPassword = generateTempPassword();

              // Approve the restaurant request with credentials (single API call)
              try {
                const response = await api.restaurants.processRequest(req.id, 'APPROVE', '', {
                  username: username,
                  password: tempPassword
                });

                if (response.success) {
                  // Create a styled popup modal
                  const modal = document.createElement('div');
                  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
                  modal.innerHTML = `
                    <div style="background: white; border-radius: 16px; padding: 32px; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                      <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <h3 style="color: #1f2937; margin: 0 0 8px; font-size: 24px; font-weight: 600;">Restaurant Approved!</h3>
                        <p style="color: #6b7280; margin: 0;">Account credentials have been generated</p>
                      </div>

                      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <div style="margin-bottom: 16px;">
                          <label style="display: block; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Restaurant Name</label>
                          <div style="color: #1f2937; font-size: 16px; font-weight: 500;">${escapeHtml(req.name)}</div>
                        </div>
                        <div style="margin-bottom: 16px;">
                          <label style="display: block; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Username</label>
                          <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; font-family: 'Courier New', monospace; color: #1f2937; font-size: 15px; font-weight: 600;">${username}</div>
                        </div>
                        <div>
                          <label style="display: block; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Temporary Password · copy now</label>
                          <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; font-family: 'Courier New', monospace; color: #1f2937; font-size: 15px; font-weight: 600;">${tempPassword}</div>
                        </div>
                      </div>

                      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin-bottom: 20px; display: flex; align-items: start; gap: 10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <div style="flex: 1;">
                          <div style="color: #065f46; font-weight: 600; font-size: 14px; margin-bottom: 2px;">Share these credentials securely</div>
                          <div style="color: #047857; font-size: 13px;">This temporary password appears once. Send it directly to the restaurant and ask them to change it after signing in.</div>
                        </div>
                      </div>

                      <button onclick="this.closest('[style*=fixed]').remove()" style="width: 100%; background: linear-gradient(135deg, #1e293b, #334155); color: white; border: none; border-radius: 8px; padding: 12px 24px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        Close
                      </button>
                    </div>
                  `;
                  document.body.appendChild(modal);

                  triggerToast(`Restaurant "${req.name}" approved successfully!`, 'success');

                  // Remove from dashboard display (will only show PENDING requests)
                  setRestaurantRequests(prev => prev.filter(r => r.id !== req.id));

                } else {
                  triggerToast('Failed to approve restaurant: ' + response.message, 'error');
                }
              } catch (error) {
                console.error('Error approving restaurant:', error);
                triggerToast('Error approving restaurant: ' + error.message, 'error');
              }
            } catch (error) {
              console.error('Error in onApprove:', error);
              triggerToast('Failed to approve restaurant', 'error');
            }
          }}
          onReject={async (req) => {
            try {
              // Reject the restaurant request
              const response = await api.restaurants.processRequest(req.id, 'REJECT', 'Rejected by admin');

              if (response.success) {
                // Remove from dashboard display (will only show PENDING requests)
                setRestaurantRequests(prev => prev.filter(r => r.id !== req.id));

                triggerToast(`Restaurant "${req.name}" rejected`, 'warning');
              } else {
                triggerToast('Failed to reject restaurant: ' + response.message, 'error');
              }
            } catch (error) {
              console.error('Error in onReject:', error);
              triggerToast('Failed to reject restaurant: ' + error.message, 'error');
            }
          }}
        />

        {/* Restaurant Withdrawal Requests */}
        <WithdrawalRequests
          requests={withdrawalRequests}
          setRequests={setWithdrawalRequests}
          onApprove={(req) => {
            triggerToast(`${req.name} withdrawal approved successfully`, 'success');
          }}
          onReject={(req) => {
            triggerToast(`${req.name} withdrawal request rejected`, 'warning');
          }}
        />

        {/* Customer Registrations Section */}
        <div className="mb-5">
          <CustomerRegistrationsManager
            onApproval={() => triggerToast('Customer registration approved successfully!', 'success')}
          />
        </div>

        {/* Staff Management Section */}
        <div id="staff-management">
          <StaffManagement
            staffList={staffList}
            setStaffList={setStaffList}
            triggerToast={triggerToast}
          />
        </div>

        {/* Driver Management Section */}
        <div id="driver-management">
          <DriverManagement
            drivers={drivers}
            setDrivers={setDrivers}
            triggerToast={triggerToast}
          />
        </div>

        {/* Delivery Log */}
        {deliveredLog.length > 0 && (
          <div className="row mt-4">
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

      {/* Enhanced Footer */}
      <footer style={footerStyle} className="py-4 mt-5">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#334155',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem'
                }}>
                  <Settings size={16} style={{ color: '#cbd5e1' }} />
                </div>
                <div>
                  <p className="mb-0 fw-medium" style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                    © 2024 Admin Dashboard. All rights reserved.
                  </p>
                  <small style={{ color: '#94a3b8' }}>
                    Secure administrative platform
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <p className="mb-0" style={{ fontSize: '0.875rem' }}>
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <small style={{ color: '#94a3b8' }}>
                System operational
              </small>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        setShow={setToastShow}
      />
    </div>
  );
};

export default AdminDashboard;
