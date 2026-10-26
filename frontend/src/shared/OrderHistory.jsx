import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const OrderHistory = ({ restaurantId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, cancelled

  useEffect(() => {
    loadOrders();
  }, [restaurantId, filter]);

  const loadOrders = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      // Use the restaurant-specific endpoint for security
      const response = await api.orders.getByRestaurant(restaurantId);

      if (response.success && response.data) {
        let filteredOrders = response.data;

        // Filter based on selected status
        if (filter === 'completed') {
          filteredOrders = response.data.filter(o => o.status === 'DELIVERED');
        } else if (filter === 'cancelled') {
          filteredOrders = response.data.filter(o => o.status === 'CANCELLED');
        }

        // Sort by date (newest first)
        filteredOrders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));

        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error('Error loading order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { color: '#ff9800', bg: '#fff3e0', label: '⏳ Pending' },
      'PREPARING': { color: '#2196f3', bg: '#e3f2fd', label: '👨‍🍳 Preparing' },
      'READY_FOR_PICKUP': { color: '#4caf50', bg: '#e8f5e9', label: '✅ Ready' },
      'OUT_FOR_DELIVERY': { color: '#9c27b0', bg: '#f3e5f5', label: '🚚 Delivering' },
      'DELIVERED': { color: '#4caf50', bg: '#e8f5e9', label: '✓ Delivered' },
      'CANCELLED': { color: '#f44336', bg: '#ffebee', label: '✗ Cancelled' }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];

    return (
      <span style={{
        background: config.bg,
        color: config.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={{ color: '#2d5016', fontWeight: '700', margin: 0 }}>
          📦 Order History
        </h4>

        {/* Filter Buttons */}
        <div className="btn-group" role="group">
          {['all', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter(f)}
              style={{
                fontSize: '0.85rem',
                padding: '6px 16px',
                textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: '3rem', opacity: 0.3 }}>📦</div>
          <p style={{ color: '#666', marginTop: '20px' }}>
            No orders found
          </p>
        </div>
      ) : (
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {orders.map(order => (
            <div
              key={order.orderID}
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '15px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Order Header */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 style={{ color: '#2d5016', fontWeight: '600', marginBottom: '5px' }}>
                    Order #{order.orderID}
                  </h6>
                  <small style={{ color: '#666' }}>
                    {formatDate(order.orderTime)}
                  </small>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Customer Info */}
              <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#333' }}>
                  <strong>Customer:</strong> {order.contactName || 'N/A'}
                </p>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#333' }}>
                  <strong>Phone:</strong> {order.contactPhone || 'N/A'}
                </p>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#333' }}>
                  <strong>Address:</strong> {order.streetName}, {order.city}
                </p>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <small style={{ color: '#666', fontWeight: '600' }}>Items:</small>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ marginTop: '5px', fontSize: '0.85rem' }}>
                      • {item.itemName} (x{item.quantity}) - ${parseFloat(item.unitPriceSnapshot).toFixed(2)}
                    </div>
                  ))}
                </div>
              )}

              {/* Order Total */}
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  Payment: {order.paymentMethod}
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#4caf50' }}>
                  Total: ${parseFloat(order.grandTotal).toFixed(2)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
