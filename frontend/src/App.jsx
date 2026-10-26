import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './main/MainPage';
import CustomerCartPage from './user/CustomerCartPage';
import CustomerMainPage from './user/CustomerMainPage';
import CustomerMenuPage from './user/CustomerMenuPage';
import CustomerPaymentPage from './user/CustomerPaymentPage';
import CustomerRegistration from './user/CustomerRegistration';
import RestaurantDashboard from './shared/RestaurantDashboard';
import AdminDashboard from './admin/AdminDashboard';
import StaffDashboard from './staff/StaffDashboard';
import RestaurantRegistration from './pages/RestaurantRegistration';
import ChangePasswordPage from './shared/ChangePasswordPage';
import TopNav from './main/TopNav';

// Inside <Routes>



function App() {
  return (
    <Router>
      <TopNav />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/customer-login" element={<CustomerMainPage />} />
        <Route path="/customer-menu" element={<CustomerMenuPage />} />
        <Route path="/customer-cart" element={<CustomerCartPage />} />
        <Route path="/customer-payment" element={<CustomerPaymentPage />} />
        <Route path="/customer-registration" element={<CustomerRegistration />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/restaurant-registration" element={<RestaurantRegistration />} />
      </Routes>
    </Router>
  );
}

export default App;
