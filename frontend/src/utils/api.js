// API Service for Food Delivery Application
// Centralized API calls with NEW Java Spring Boot Backend

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const NODE_API_URL = process.env.REACT_APP_NODE_API_URL || 'http://localhost:5001/api';

// Generic request function with optional baseUrl override
const request = async (endpoint, options = {}, baseUrl = API_URL) => {
  const config = {
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        message: data.message,
        errors: data.errors ? (Array.isArray(data.errors) ? data.errors.map(e => ({ field: e.field, msg: e.msg })) : data.errors) : null,
        fullResponse: data
      };
      // Create error with details attached
      const error = new Error(data.message || 'Request failed');
      error.errors = errorDetails.errors;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: (username, password, loginType) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, loginType })
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST'
    }),

  checkSession: () =>
    request('/auth/check-session'),

  changePassword: (currentPassword, newPassword, confirmPassword, usernameOverride) => {
    const username = usernameOverride || sessionStorage.getItem('username') ||
                    JSON.parse(localStorage.getItem('user') || '{}').username ||
                    JSON.parse(localStorage.getItem('currentStaff') || '{}').username;
    if (!username) {
      throw new Error('No username found in session. Please log in again.');
    }
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ username, currentPassword, newPassword, confirmPassword })
    });
  }
};

// Staff Management API
export const staffAPI = {
  getAll: () =>
    request('/staff'),

  getById: (id) =>
    request(`/staff/${id}`),

  create: (staffData) =>
    request('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    }),

  update: (id, staffData) =>
    request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData)
    }),

  delete: (id) =>
    request(`/staff/${id}`, {
      method: 'DELETE'
    }),

  createCredentials: (id, credentialsData) =>
    request(`/staff/${id}/credentials`, {
      method: 'POST',
      body: JSON.stringify(credentialsData)
    })
};

// Driver Management API
export const driverAPI = {
  getAll: (status) =>
    request(`/drivers${status ? `?status=${status}` : ''}`),

  getAvailable: () =>
    request('/drivers/available'),

  getById: (id) =>
    request(`/drivers/${id}`),

  create: (driverData) =>
    request('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData)
    }),

  update: (id, driverData) =>
    request(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData)
    }),

  fire: (id) =>
    request(`/drivers/${id}/fire`, {
      method: 'PATCH'
    }),

  rehire: (id) =>
    request(`/drivers/${id}/rehire`, {
      method: 'PATCH'
    }),

  delete: (id) =>
    request(`/drivers/${id}`, {
      method: 'DELETE'
    })
};

// Restaurant Management API
export const restaurantAPI = {
  register: (registrationData) =>
    request('/restaurants/register', {
      method: 'POST',
      body: JSON.stringify(registrationData)
    }),

  create: (restaurantData) =>
    request('/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurantData)
    }),

  delete: (id) =>
    request(`/restaurants/${id}`, {
      method: 'DELETE'
    }),

  getPending: () =>
    request('/restaurants/pending'),

  updateStatus: (id, status, credentials) =>
    request(`/restaurants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...credentials })
    }),

  getAll: (status) =>
    request(`/restaurants${status ? `?status=${status}` : ''}`),

  getById: (id) =>
    request(`/restaurants/${id}`),

  getMenu: (id) =>
    request(`/menu/restaurant/${id}`),

  update: (id, restaurantData) =>
    request(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(restaurantData)
    }),

  getOrders: (id) =>
    request(`/restaurants/${id}/orders`),

  // Restaurant requests
  getAllRequests: () =>
    request('/restaurants/requests'),

  createRequest: (requestData) =>
    request('/restaurants/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    }),

  processRequest: (id, action, notes, credentials = null) =>
    request(`/restaurants/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        action,
        notes,
        ...(credentials && { username: credentials.username, password: credentials.password })
      })
    })
};

// Menu Management API
export const menuAPI = {
  getById: (id) =>
    request(`/menu/${id}`),

  create: (menuItemData) =>
    request('/menu', {
      method: 'POST',
      body: JSON.stringify(menuItemData)
    }),

  update: (id, menuItemData) =>
    request(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuItemData)
    }),

  toggleAvailability: (id) =>
    request(`/menu/${id}/availability`, {
      method: 'PATCH'
    }),

  delete: (id) =>
    request(`/menu/${id}`, {
      method: 'DELETE'
    })
};

// Customer Management API
export const customerAPI = {
  register: (customerData) =>
    request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    }),

  getAll: () =>
    request('/customers'),

  getPending: () =>
    request('/customers/status/pending'),

  updateStatus: (id, status) =>
    request(`/customers/${id}/status?status=${status}`, {
      method: 'PATCH'
    }),

  getById: (id) =>
    request(`/customers/${id}`),

  getPaymentInfo: (id) =>
    request(`/customers/payment-info/${id}`),

  update: (id, customerData) =>
    request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    }, NODE_API_URL),

  getPoints: (id) =>
    request(`/customers/${id}/points`, {}, NODE_API_URL),

  verifyCard: (id, securityCode) =>
    request(`/customers/${id}/verify-card`, {
      method: 'POST',
      body: JSON.stringify({ securityCode })
    }, NODE_API_URL),

  lookup: (email, phone) =>
    request(`/customers/lookup/search?${email ? `email=${email}` : `phone=${phone}`}`),

  getOrders: (id) =>
    request(`/customers/${id}/orders`)
};

// Order Management API
export const orderAPI = {
  create: (orderData) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),

  getAll: (filters) => {
    const params = new URLSearchParams(filters);
    return request(`/orders${params.toString() ? `?${params}` : ''}`);
  },

  getByRestaurant: (restaurantId) =>
    request(`/orders/restaurant/${restaurantId}`),

  getById: (id) =>
    request(`/orders/${id}`),

  updateStatus: (id, status, staffID = null, driverID = null) => {
    const payload = { status };
    if (staffID) payload.staffID = staffID;
    if (driverID) payload.driverID = driverID;
    return request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  setEstimate: (id, estimatedDeliveryTime) =>
    request(`/orders/${id}/estimate`, {
      method: 'PATCH',
      body: JSON.stringify({ estimatedDeliveryTime })
    }),

  assignDriver: (id, driverID) =>
    request(`/orders/${id}/assign-driver`, {
      method: 'POST',
      body: JSON.stringify({ driverID })
    }),

  cancel: (id) =>
    request(`/orders/${id}/cancel`, {
      method: 'PATCH'
    })
};

// Points & Rewards API
export const pointsAPI = {
  getTransactions: (customerId) =>
    request(`/points/customers/${customerId}/transactions`),

  getBalance: (customerId) =>
    request(`/points/customers/${customerId}/balance`),

  earn: (customerId, points, orderID, reason) =>
    request('/points/earn', {
      method: 'POST',
      body: JSON.stringify({ customerID: customerId, points, orderID, reason })
    }),

  redeem: (customerId, points, orderID, reason) =>
    request('/points/redeem', {
      method: 'POST',
      body: JSON.stringify({ customerID: customerId, points, orderID, reason })
    }),

  adjust: (customerId, pointsDelta, reason) =>
    request('/points/adjust', {
      method: 'POST',
      body: JSON.stringify({ customerID: customerId, pointsDelta, reason })
    }),

  getSummary: () =>
    request('/points/summary')
};

// Health Check
export const healthCheck = () =>
  request('/health');

// Export all APIs
const api = {
  auth: authAPI,
  staff: staffAPI,
  drivers: driverAPI,
  restaurants: restaurantAPI,
  menu: menuAPI,
  customers: customerAPI,
  orders: orderAPI,
  points: pointsAPI,
  health: healthCheck
};

export default api;
