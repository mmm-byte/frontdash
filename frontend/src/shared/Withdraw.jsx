import React, { useState } from "react";
import WithdrawModal from "./WithdrawModal";
import SuccessModal from "./WithdrawSuccess";
import api from "../utils/api";
import "../styles/withdraw.css";

const Withdraw = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = () => {
    setShowModal(true);
    setError("");
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    try {
      // Get restaurant ID from localStorage
      const restaurantId = localStorage.getItem('currentRestaurantId');

      if (!restaurantId) {
        setError('Restaurant ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Create withdrawal request in database
      const response = await api.restaurants.createRequest({
        restaurantID: parseInt(restaurantId),
        requestType: 'WITHDRAWAL',
        notes: 'Restaurant withdrawal request'
      });

      if (response.success) {
        setShowModal(false);
        setShowSuccess(true);

        // Auto-hide success after 2.5s
        setTimeout(() => {
          setShowSuccess(false);
        }, 2500);
      } else {
        setError(response.message || 'Failed to submit withdrawal request');
      }
    } catch (err) {
      console.error('Error submitting withdrawal request:', err);
      setError(err.message || 'Failed to submit withdrawal request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h5>Withdraw from FrontDash</h5>
      <p className="text-muted mb-3">
        Submit a withdrawal request to stop receiving orders and remove your restaurant from the platform.
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <button
        className="btn btn-danger mt-3"
        onClick={handleWithdraw}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Withdraw'}
      </button>

      {showModal && (
        <WithdrawModal
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      )}

      {showSuccess && <SuccessModal />}
    </div>
  );
};

export default Withdraw;
