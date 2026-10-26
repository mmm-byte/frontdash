import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FoodItemCard from "./FoodItemCard";
import CartSidebar from "../shared/CartSidebar";
import AddressModal from "../shared/AddressModal";
import ToastNotification from "../shared/ToastNotification";
import api from "../utils/api";

const CustomerMenuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const restaurant = location.state?.restaurant || { name: "Restaurant" };
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load menu items from database
  useEffect(() => {
    const loadMenuItems = async () => {
      const restaurantId = restaurant.restaurantID || restaurant.id;

      if (!restaurantId) {
        console.error('No restaurant ID provided', restaurant);
        setLoading(false);
        return;
      }

      try {
        const response = await api.restaurants.getMenu(restaurantId);

        if (response.data && Array.isArray(response.data)) {
          // Map database items to expected format
          const formattedItems = response.data.map(item => ({
            id: item.itemID,
            name: item.name,
            image: item.pictureUrl || "/images/food-default.jpg",
            price: parseFloat(item.price),
            available: item.availability === 'AVAILABLE',
            description: item.description || '',
            category: item.category || 'Menu' // Use category from database if available
          }));
          setFoodItems(formattedItems);
        } else {
          console.error('Invalid menu response format:', response);
        }
      } catch (error) {
        console.error('Failed to load menu items:', error);
        setToast({ message: 'Failed to load menu items', type: 'danger', visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, [restaurant.id]);

  const categories = ['All', ...new Set(foodItems.map(item => item.category))];
  const filteredFoodItems = selectedCategory === 'All' ? foodItems : foodItems.filter(item => item.category === selectedCategory);

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleAddToCart = (item, quantity = 1) => {
    const existingItem = cart.find(cartItem => cartItem.name === item.name);
    if (existingItem) {
      setCart(prev => prev.map(cartItem =>
        cartItem.name === item.name
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart(prev => [...prev, { ...item, quantity }]);
    }
    showToast(`${quantity} ${item.name}${quantity > 1 ? 's' : ''} added to cart`);
  };

  const handleRemoveFromCart = (itemName) => {
    setCart(prev => prev.filter(item => item.name !== itemName));
    showToast(`${itemName} removed from cart`, "error");
  };

  const handleGoToCart = () => {
    if (cart.length === 0) {
      setToast({ message: 'Please add at least one item to continue', type: 'warning', visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
      return;
    }
    // Always take user to the Review Order page; they can add address there
    navigate("/customer-cart", { state: { cart, deliveryAddress, restaurant } });
  };

  return (
    <div className="min-vh-100 bg-light">
      <ToastNotification message={toast.message} type={toast.type} visible={toast.visible} />

      {/* Header */}
      <div className="page-hero gradient-yellow">
        <div className="container">
          <h1 className="text-center mb-4 display-4 fw-bold" style={{
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em'
          }}>
            {restaurant.name}
          </h1>

          {/* Category Filter */}
          <div className="d-flex justify-content-center">
            <div
              className="bg-white rounded-pill shadow-soft p-1"
              style={{
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`btn rounded-pill px-4 py-2 mx-1 ${
                    selectedCategory === category
                      ? 'btn-primary text-white'
                      : 'btn-light text-dark'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: selectedCategory === category
                      ? 'linear-gradient(45deg, #667eea, #764ba2)'
                      : 'transparent',
                    transform: selectedCategory === category ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: selectedCategory === category
                      ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                      : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category) {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category) {
                      e.target.style.background = 'transparent';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row">
          {/* Menu Items */}
          <div className={`${cart.length > 0 ? 'col-lg-9' : 'col-12'}`}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading menu items...</p>
              </div>
            ) : foodItems.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🍽️</div>
                <h3 style={{ color: '#2c3e50', fontWeight: '700' }}>No menu items available</h3>
                <p style={{ color: '#6c757d' }}>This restaurant hasn't added any items yet.</p>
              </div>
            ) : (
              <div className="row">
                {filteredFoodItems.map((item, index) => (
                  <div key={item.id || index} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                    <FoodItemCard item={item} onAdd={(quantity) => handleAddToCart(item, quantity)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          {cart.length > 0 && (
            <div className="col-lg-3">
              <CartSidebar
                cart={cart}
                deliveryAddress={deliveryAddress}
                onRemove={handleRemoveFromCart}
                onGoToCart={handleGoToCart}
              />
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <AddressModal
          isOpen={showAddressModal}
          address={deliveryAddress || {}}
          onClose={() => setShowAddressModal(false)}
          onSave={(address) => {
            setDeliveryAddress(address);
            setShowAddressModal(false);
            navigate("/customer-cart", { state: { cart, deliveryAddress: address, restaurant } });
          }}
        />
      )}
    </div>
  );
};

export default CustomerMenuPage;
