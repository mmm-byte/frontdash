import React, { useState, useEffect } from "react";
import { Key, Lock, X, CheckCircle2, XCircle } from "lucide-react";
import { isPasswordValid } from "../utils/security";
import api from "../utils/api";

const ChangePassword = ({ onSaved, onCancel, autoOpen = false }) => {
  const [showModal, setShowModal] = useState(autoOpen);
  const [formData, setFormData] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-open modal if autoOpen prop is true
  useEffect(() => {
    if (autoOpen) {
      setShowModal(true);
    }
  }, [autoOpen]);

  // Password validation checks
  const getPasswordValidation = (password) => {
    return {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    };
  };

  const handleOpenModal = () => {
    setFormData({ current: "", newPass: "", confirmPass: "" });
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
    setSuccess("");
    if (onCancel) {
      onCancel();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on input change
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    const { current, newPass, confirmPass } = formData;
    if (!current || !newPass || !confirmPass) {
      setError('All fields are required.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('New password and confirm password must match.');
      return;
    }
    if (!isPasswordValid(newPass)) {
      setError('Password must be at least 6 chars with uppercase, lowercase, and a number.');
      return;
    }

    // Call the API to change password in database
    try {
      const response = await api.auth.changePassword(current, newPass, confirmPass);

      if (response.success) {
        setSuccess('Password updated successfully.');
        if (onSaved) onSaved('Password updated successfully');
        setTimeout(() => {
          handleCloseModal();
        }, 800);
      } else {
        setError(response.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      if (err.message === 'Current password is incorrect') {
        setError('Current password is incorrect.');
      } else if (err.errors) {
        // Handle validation errors from backend
        const errorMessages = err.errors.map(e => e.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(err.message || 'Unable to update password.');
      }
    }
  };

  const validation = getPasswordValidation(formData.newPass);

  return (
    <div className="text-center">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h3>
        <p className="text-gray-600 text-sm mb-6">Manage your account password securely</p>

        <button
          className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            border: 'none'
          }}
          onClick={handleOpenModal}
        >
          <Key className="w-5 h-5" />
          Change Password
        </button>
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ margin: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto" style={{ maxHeight: '90vh', overflow: 'auto' }}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                    <Key className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                    <p className="text-gray-600 text-sm mt-1">Enter your current and new password</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-1.5 transition-all flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5">
              {/* Current Password */}
              <div className="flex items-start gap-4">
                <label className="text-sm font-semibold text-gray-700 text-right pt-3 w-40 flex-shrink-0">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <input
                    type="password"
                    name="current"
                    value={formData.current}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="flex items-start gap-4">
                <label className="text-sm font-semibold text-gray-700 text-right pt-3 w-40 flex-shrink-0">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <input
                    type="password"
                    name="newPass"
                    value={formData.newPass}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                    placeholder="Enter new password"
                  />

                  {/* Password Requirements */}
                  {formData.newPass && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full">
                      <p className="text-xs font-semibold text-gray-700 mb-3 text-left">Password Requirements:</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-left">
                          {validation.minLength ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={validation.minLength ? "text-green-700 font-medium" : "text-gray-600"}>
                            At least 6 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-left">
                          {validation.hasUpperCase ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={validation.hasUpperCase ? "text-green-700 font-medium" : "text-gray-600"}>
                            At least one uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-left">
                          {validation.hasLowerCase ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={validation.hasLowerCase ? "text-green-700 font-medium" : "text-gray-600"}>
                            At least one lowercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-left">
                          {validation.hasNumber ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={validation.hasNumber ? "text-green-700 font-medium" : "text-gray-600"}>
                            At least one number
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex items-start gap-4">
                <label className="text-sm font-semibold text-gray-700 text-right pt-3 w-40 flex-shrink-0">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <input
                    type="password"
                    name="confirmPass"
                    value={formData.confirmPass}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                    placeholder="Confirm new password"
                  />
                  {formData.confirmPass && formData.newPass !== formData.confirmPass && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Passwords do not match
                    </p>
                  )}
                  {formData.confirmPass && formData.newPass === formData.confirmPass && (
                    <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Passwords match
                    </p>
                  )}
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-start gap-4">
                  <div className="w-40 flex-shrink-0"></div>
                  <div className="flex-1 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 flex-1">{error}</p>
                  </div>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-4">
                  <div className="w-40 flex-shrink-0"></div>
                  <div className="flex-1 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800 flex-1">{success}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-5 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.current || !formData.newPass || !formData.confirmPass || !isPasswordValid(formData.newPass) || formData.newPass !== formData.confirmPass}
                className="flex-1 px-5 py-3 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  border: 'none'
                }}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
