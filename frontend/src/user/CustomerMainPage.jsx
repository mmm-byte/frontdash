// src/components/CustomerMainPage.jsx
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const CustomerMainPage = () => {
  const navigate = useNavigate();

  // Hardcoded restaurants
  const restaurants = [
    { name: 'Pasta Palace', logo: 'https://via.placeholder.com/100', status: 'Open' },
    { name: 'Burger Barn', logo: 'https://via.placeholder.com/100', status: 'Closed' },
    { name: 'Sushi World', logo: 'https://via.placeholder.com/100', status: 'Open' },
    { name: 'Taco Town', logo: 'https://via.placeholder.com/100', status: 'Open' }
  ];

  // Hardcoded orders (this would come from backend later)
  const [orders] = useState([
    { id: 101, restaurant: 'Pasta Palace', eta: '25 mins' },
    { id: 102, restaurant: 'Sushi World', eta: '40 mins' },
  ]);

  const handleViewMenu = () => {
    navigate('/customer-menu');
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Left: Restaurants */}
        <div className="col-md-9">
          <h2 className="mb-4 text-center">Available Restaurants</h2>
          <div className="row">
            {restaurants.map((restaurant, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div className="card shadow-sm h-100">
                  <img src={restaurant.logo} className="card-img-top" alt={restaurant.name} />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <h5 className="card-title">{restaurant.name}</h5>
                    <p className={`card-text ${restaurant.status === 'Open' ? 'text-success' : 'text-danger'}`}>
                      {restaurant.status}
                    </p>
                    <button
                      className="btn btn-warning mt-auto"
                      onClick={handleViewMenu}
                    >
                      View Menu
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Orders Sidebar */}
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-dark text-white">
              My Orders
            </div>
            <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {orders.length > 0 ? (
                <ul className="list-group">
                  {orders.map(order => (
                    <li key={order.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>#{order.id}</strong> <br />
                        <small>{order.restaurant}</small>
                      </div>
                      <span className="badge bg-success rounded-pill">{order.eta}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No active orders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMainPage;
