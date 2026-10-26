import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Badge } from "react-bootstrap";
import api from "../utils/api";

const MenuManager = ({ restaurantId }) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    availability: "Available",
    image: "",
    category: "Main Course",
    description: ""
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const categories = ["Main Course", "Appetizers", "Sides", "Beverages", "Desserts"];

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Load menu items from database
  useEffect(() => {
    const loadMenu = async () => {
      // Use prop or fallback to localStorage
      const effectiveRestaurantId = restaurantId || localStorage.getItem('currentRestaurantId');

      if (!effectiveRestaurantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.restaurants.getMenu(effectiveRestaurantId);

        if (response.success && response.data) {
          // Transform database format to UI format
          const formattedMenu = response.data.map(item => ({
            id: item.itemID,
            name: item.name,
            price: parseFloat(item.price),
            availability: item.availability === 'AVAILABLE' ? 'Available' : 'Unavailable',
            image: item.pictureUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
            category: item.category || "Main Course",
            description: item.description || ""
          }));
          setMenu(formattedMenu);
        } else {
        }
      } catch (error) {
        console.error('MenuManager: Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [restaurantId]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        price: "",
        availability: "Available",
        image: "",
        category: "Main Course",
        description: ""
      });
    }
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Validate item name - must be at least 5 letters, proper title case (first letter of each word capitalized)
  const validateItemName = (name) => {
    if (!name || name.trim().length < 5) {
      return 'Item name must be at least 5 characters long';
    }

    // Check if it contains only letters, spaces, and common food characters
    if (!/^[A-Za-z\s'-]+$/.test(name)) {
      return 'Item name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Split into words and check title case
    const words = name.trim().split(/\s+/);
    for (const word of words) {
      if (!word) continue;

      // First letter must be uppercase
      if (word[0] !== word[0].toUpperCase()) {
        return `Each word must start with a capital letter. "${word}" should be "${word[0].toUpperCase() + word.slice(1).toLowerCase()}"`;
      }

      // Rest of the letters must be lowercase
      if (word.length > 1 && word.slice(1) !== word.slice(1).toLowerCase()) {
        return `Only the first letter of each word should be capitalized. "${word}" should be "${word[0] + word.slice(1).toLowerCase()}"`;
      }
    }

    return null; // Valid
  };

  const handleSave = async () => {
    const errors = {};

    // Validate name
    if (!formData.name) {
      errors.name = 'Item name is required';
    } else {
      const nameError = validateItemName(formData.name);
      if (nameError) {
        errors.name = nameError;
      }
    }

    // Validate price
    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    // If there are errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      if (editingItem) {
        // Update existing item in database
        const response = await api.menu.update(editingItem.id, {
          name: formData.name,
          pictureUrl: formData.image,
          price: parseFloat(formData.price),
          availability: formData.availability === 'Available' ? 'AVAILABLE' : 'UNAVAILABLE',
          description: formData.description,
          category: formData.category
        });

        if (response.success) {
          // Update in UI
          setMenu(menu.map((m) =>
            m.id === editingItem.id
              ? { ...formData, id: editingItem.id, price: parseFloat(formData.price) }
              : m
          ));
          showToast(`✅ "${formData.name}" updated successfully!`, 'success');
        } else {
          showToast('❌ Failed to update menu item', 'error');
          return;
        }
      } else {
        // Create new item in database
        const effectiveRestaurantId = restaurantId || localStorage.getItem('currentRestaurantId');

        if (!effectiveRestaurantId) {
          alert('Restaurant ID not found. Please log in again.');
          return;
        }

        const response = await api.menu.create({
          restaurantIdFk: parseInt(effectiveRestaurantId),
          name: formData.name,
          pictureUrl: formData.image,
          price: parseFloat(formData.price),
          availability: formData.availability === 'Available' ? 'AVAILABLE' : 'UNAVAILABLE',
          description: formData.description,
          category: formData.category
        });

        if (response.success) {
          // Add to UI with the returned ID from the created menu item
          const newItem = {
            id: response.data.itemID,
            name: response.data.name,
            image: response.data.pictureUrl,
            price: parseFloat(response.data.price),
            availability: response.data.availability === 'AVAILABLE' ? 'Available' : 'Unavailable',
            description: response.data.description,
            category: formData.category
          };
          setMenu([...menu, newItem]);
          showToast(`✅ "${formData.name}" added successfully!`, 'success');
        } else {
          showToast('❌ Failed to create menu item', 'error');
          return;
        }
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving menu item:', error);
      showToast('❌ Failed to save menu item. Please try again.', 'error');
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await api.menu.delete(itemToDelete.id);

      if (response.success) {
        setMenu(menu.filter((m) => m.id !== itemToDelete.id));
        showToast(`✅ "${itemToDelete.name}" deleted successfully!`, 'success');
      } else {
        showToast('❌ Failed to delete menu item', 'error');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showToast('❌ Failed to delete menu item. Please try again.', 'error');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Main Course": "#4caf50",
      "Appetizers": "#66bb6a",
      "Sides": "#81c784",
      "Beverages": "#a5d6a7",
      "Desserts": "#c8e6c9"
    };
    return colors[category] || "#4caf50";
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4
            style={{
              color: "#2d5016",
              fontWeight: "700",
              marginBottom: "5px"
            }}
          >
            🍽️ Menu Management
          </h4>
          <p style={{ color: "#4a7c59", margin: "0" }}>
            Manage your restaurant's delicious offerings
          </p>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          style={{
            background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontWeight: "600",
            boxShadow: "0 8px 20px rgba(76, 175, 80, 0.3)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 25px rgba(76, 175, 80, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 8px 20px rgba(76, 175, 80, 0.3)";
          }}
        >
          ➕ Add New Item
        </Button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading menu...</span>
          </div>
          <p className="mt-2 text-muted">Loading menu items...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && menu.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🍽️</div>
          <h5 style={{ color: "#4a7c59", marginBottom: "10px" }}>No menu items yet</h5>
          <p style={{ color: "#6b7280" }}>Click "Add New Item" to add your first menu item</p>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && menu.length > 0 && (
      <div className="row mb-4">
        <div className="col-md-3">
          <div
            style={{
              background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
              borderRadius: "15px",
              padding: "20px",
              color: "white",
              textAlign: "center",
              boxShadow: "0 8px 25px rgba(76, 175, 80, 0.2)"
            }}
          >
            <h3 style={{ margin: "0", fontWeight: "700" }}>{menu.length}</h3>
            <p style={{ margin: "0", opacity: "0.9" }}>Total Items</p>
          </div>
        </div>
        <div className="col-md-3">
          <div
            style={{
              background: "linear-gradient(135deg, #66bb6a 0%, #81c784 100%)",
              borderRadius: "15px",
              padding: "20px",
              color: "white",
              textAlign: "center",
              boxShadow: "0 8px 25px rgba(102, 187, 106, 0.2)"
            }}
          >
            <h3 style={{ margin: "0", fontWeight: "700" }}>
              {menu.filter(item => item.availability === "Available").length}
            </h3>
            <p style={{ margin: "0", opacity: "0.9" }}>Available</p>
          </div>
        </div>
        <div className="col-md-3">
          <div
            style={{
              background: "linear-gradient(135deg, #81c784 0%, #a5d6a7 100%)",
              borderRadius: "15px",
              padding: "20px",
              color: "white",
              textAlign: "center",
              boxShadow: "0 8px 25px rgba(129, 199, 132, 0.2)"
            }}
          >
            <h3 style={{ margin: "0", fontWeight: "700" }}>
              {new Set(menu.map(item => item.category)).size}
            </h3>
            <p style={{ margin: "0", opacity: "0.9" }}>Categories</p>
          </div>
        </div>
        <div className="col-md-3">
          <div
            style={{
              background: "linear-gradient(135deg, #a5d6a7 0%, #c8e6c9 100%)",
              borderRadius: "15px",
              padding: "20px",
              color: "#2d5016",
              textAlign: "center",
              boxShadow: "0 8px 25px rgba(165, 214, 167, 0.2)"
            }}
          >
            <h3 style={{ margin: "0", fontWeight: "700" }}>
              ${(menu.reduce((sum, item) => sum + item.price, 0)).toFixed(2)}
            </h3>
            <p style={{ margin: "0", opacity: "0.8" }}>Total Value</p>
          </div>
        </div>
      </div>
      )}

      {/* Menu Items Grid */}
      {!loading && menu.length > 0 && (
      <div className="row g-4">
        {menu.map((item) => (
          <div key={item.id} className="col-md-6 col-lg-4">
            <Card
              style={{
                borderRadius: "20px",
                border: "1px solid rgba(76, 175, 80, 0.1)",
                boxShadow: "0 10px 30px rgba(76, 175, 80, 0.08)",
                overflow: "hidden",
                transition: "all 0.3s ease",
                height: "100%"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(76, 175, 80, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(76, 175, 80, 0.08)";
              }}
            >
              <div style={{ position: "relative" }}>
                <Card.Img
                  variant="top"
                  src={item.image || "https://via.placeholder.com/300x200"}
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <Badge
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: getCategoryColor(item.category),
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: "600"
                  }}
                >
                  {item.category}
                </Badge>
              </div>

              <Card.Body className="d-flex flex-column">
                <Card.Title
                  style={{
                    color: "#2d5016",
                    fontWeight: "700",
                    fontSize: "1.2rem",
                    marginBottom: "8px"
                  }}
                >
                  {item.name}
                </Card.Title>

                <Card.Text
                  style={{
                    color: "#4a7c59",
                    fontSize: "0.9rem",
                    marginBottom: "10px",
                    flexGrow: 1
                  }}
                >
                  {item.description || "Delicious menu item"}
                </Card.Text>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: "700",
                      color: "#4caf50"
                    }}
                  >
                    ${item.price.toFixed(2)}
                  </span>
                  <Badge
                    bg={item.availability === "Available" ? "success" : "danger"}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "20px",
                      fontSize: "0.8rem"
                    }}
                  >
                    {item.availability}
                  </Badge>
                </div>

                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenModal(item)}
                    style={{
                      background: "linear-gradient(135deg, #66bb6a 0%, #81c784 100%)",
                      border: "none",
                      borderRadius: "10px",
                      padding: "8px 16px",
                      fontWeight: "600",
                      flex: 1
                    }}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(item)}
                    style={{
                      background: "linear-gradient(135deg, #f44336 0%, #e57373 100%)",
                      border: "none",
                      borderRadius: "10px",
                      padding: "8px 16px",
                      fontWeight: "600",
                      flex: 1
                    }}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <div
          style={{
            background: "linear-gradient(145deg, #ffffff 0%, #f8fcf8 100%)",
            borderRadius: "20px",
            border: "1px solid rgba(76, 175, 80, 0.1)",
            boxShadow: "0 20px 60px rgba(76, 175, 80, 0.1)",
            overflow: "hidden"
          }}
        >
          <Modal.Header
            closeButton
            style={{
              background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
              color: "white",
              border: "none",
              padding: "25px 30px"
            }}
          >
            <Modal.Title style={{ fontWeight: "700", fontSize: "1.5rem" }}>
              {editingItem ? "✏️ Edit Menu Item" : "➕ Add Menu Item"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ padding: "30px" }}>
            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#2d5016" }}>
                      Food Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter food name (e.g., Chicken Burger)"
                      isInvalid={!!validationErrors.name}
                      style={{
                        borderRadius: "12px",
                        border: `2px solid ${validationErrors.name ? '#dc3545' : '#e8f5e8'}`,
                        padding: "12px 16px",
                        transition: "all 0.3s ease"
                      }}
                      onFocus={(e) => {
                        if (!validationErrors.name) {
                          e.target.style.borderColor = "#4caf50";
                          e.target.style.boxShadow = "0 4px 20px rgba(76, 175, 80, 0.1)";
                        }
                      }}
                      onBlur={(e) => {
                        if (!validationErrors.name) {
                          e.target.style.borderColor = "#e8f5e8";
                          e.target.style.boxShadow = "none";
                        }
                      }}
                    />
                    {validationErrors.name && (
                      <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                        {validationErrors.name}
                      </Form.Control.Feedback>
                    )}
                    <Form.Text className="text-muted">
                      Min 5 characters. First letter of each word must be capital (e.g., "Chicken Burger" not "chicken burger" or "CHICKEN BURGER")
                    </Form.Text>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#2d5016" }}>
                      Price ($) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      isInvalid={!!validationErrors.price}
                      style={{
                        borderRadius: "12px",
                        border: `2px solid ${validationErrors.price ? '#dc3545' : '#e8f5e8'}`,
                        padding: "12px 16px",
                        transition: "all 0.3s ease"
                      }}
                      onFocus={(e) => {
                        if (!validationErrors.price) {
                          e.target.style.borderColor = "#4caf50";
                          e.target.style.boxShadow = "0 4px 20px rgba(76, 175, 80, 0.1)";
                        }
                      }}
                      onBlur={(e) => {
                        if (!validationErrors.price) {
                          e.target.style.borderColor = "#e8f5e8";
                          e.target.style.boxShadow = "none";
                        }
                      }}
                    />
                    {validationErrors.price && (
                      <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                        {validationErrors.price}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#2d5016" }}>
                      Category
                    </Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e8f5e8",
                        padding: "12px 16px"
                      }}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "600", color: "#2d5016" }}>
                      Availability
                    </Form.Label>
                    <Form.Select
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e8f5e8",
                        padding: "12px 16px"
                      }}
                    >
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: "600", color: "#2d5016" }}>
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the dish..."
                  style={{
                    borderRadius: "12px",
                    border: "2px solid #e8f5e8",
                    padding: "12px 16px",
                    transition: "all 0.3s ease",
                    resize: "none"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4caf50";
                    e.target.style.boxShadow = "0 4px 20px rgba(76, 175, 80, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e8f5e8";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: "600", color: "#2d5016" }}>
                  Image URL
                </Form.Label>
                <Form.Control
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    borderRadius: "12px",
                    border: "2px solid #e8f5e8",
                    padding: "12px 16px",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4caf50";
                    e.target.style.boxShadow = "0 4px 20px rgba(76, 175, 80, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e8f5e8";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer style={{ padding: "20px 30px", border: "none" }}>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              style={{
                borderRadius: "12px",
                padding: "10px 20px",
                fontWeight: "600",
                background: "#f5f5f5",
                border: "none",
                color: "#666"
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              style={{
                background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                border: "none",
                borderRadius: "12px",
                padding: "10px 20px",
                fontWeight: "600",
                boxShadow: "0 6px 20px rgba(76, 175, 80, 0.3)"
              }}
            >
              {editingItem ? "Update Item" : "Add Item"}
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <div style={{ borderRadius: "15px", overflow: "hidden" }}>
          <Modal.Header
            closeButton
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
              color: "white",
              border: "none"
            }}
          >
            <Modal.Title style={{ fontWeight: "700" }}>🗑️ Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: "25px", fontSize: "16px" }}>
            {itemToDelete && (
              <>
                <p style={{ marginBottom: "15px" }}>Are you sure you want to delete this menu item?</p>
                <div style={{
                  background: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "10px",
                  borderLeft: "4px solid #ff6b6b"
                }}>
                  <strong style={{ color: "#333", fontSize: "18px" }}>{itemToDelete.name}</strong>
                  <div style={{ color: "#666", marginTop: "5px" }}>
                    ${parseFloat(itemToDelete.price).toFixed(2)} • {itemToDelete.category}
                  </div>
                </div>
                <p style={{ marginTop: "15px", color: "#dc3545", fontWeight: "500" }}>
                  ⚠️ This action cannot be undone.
                </p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "none", padding: "20px" }}>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              style={{
                borderRadius: "10px",
                padding: "8px 20px",
                fontWeight: "600"
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              style={{
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
                border: "none",
                borderRadius: "10px",
                padding: "8px 20px",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)"
              }}
            >
              Delete Item
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: toast.type === 'success'
              ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
              : "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
            color: "white",
            padding: "15px 25px",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
            zIndex: 9999,
            fontWeight: "600",
            fontSize: "16px",
            animation: "slideIn 0.3s ease-out"
          }}
        >
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MenuManager;
