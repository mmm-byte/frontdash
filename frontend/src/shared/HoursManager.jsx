import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../utils/api";

const HoursManager = ({ restaurantId, onSaved }) => {
  const [hours, setHours] = useState({
    Monday: "9:00 AM - 9:00 PM",
    Tuesday: "9:00 AM - 9:00 PM",
    Wednesday: "9:00 AM - 9:00 PM",
    Thursday: "9:00 AM - 9:00 PM",
    Friday: "9:00 AM - 11:00 PM",
    Saturday: "10:00 AM - 11:00 PM",
    Sunday: "10:00 AM - 8:00 PM",
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newHours, setNewHours] = useState("");
  const [startTime, setStartTime] = useState("9:00 AM");
  const [endTime, setEndTime] = useState("9:00 PM");
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    const periods = ['AM', 'PM'];

    for (let period of periods) {
      for (let hour = 1; hour <= 12; hour++) {
        for (let min of ['00', '30']) {
          times.push(`${hour}:${min} ${period}`);
        }
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Load hours from database
  useEffect(() => {
    const loadHours = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.restaurants.getById(restaurantId);
        if (response.success && response.data?.hoursJson) {
          const parsedHours = JSON.parse(response.data.hoursJson);

          // Normalize hours data - handle both string and object formats
          const normalizedHours = {};
          Object.keys(parsedHours).forEach(day => {
            const dayHours = parsedHours[day];
            if (typeof dayHours === 'string') {
              // Already in string format
              normalizedHours[day] = dayHours;
            } else if (typeof dayHours === 'object' && dayHours !== null) {
              // Convert object format {open, close} to string
              if (dayHours.open && dayHours.close) {
                normalizedHours[day] = `${dayHours.open} - ${dayHours.close}`;
              } else {
                normalizedHours[day] = "Closed";
              }
            } else {
              normalizedHours[day] = "Closed";
            }
          });

          setHours(normalizedHours);
        }
      } catch (error) {
        console.error('Error loading hours:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHours();
  }, [restaurantId]);

  const dayEmojis = {
    Monday: "📅",
    Tuesday: "📅",
    Wednesday: "📅",
    Thursday: "📅",
    Friday: "🎉",
    Saturday: "🎊",
    Sunday: "😴"
  };

  const handleOpenModal = (day) => {
    setSelectedDay(day);
    const dayHours = hours[day];

    // Parse hours into start and end times
    if (typeof dayHours === 'string') {
      if (dayHours === "Closed") {
        setIsClosed(true);
        setStartTime("9:00 AM");
        setEndTime("9:00 PM");
      } else {
        setIsClosed(false);
        // Parse "9:00 AM - 9:00 PM" format
        const parts = dayHours.split(' - ');
        if (parts.length === 2) {
          setStartTime(parts[0].trim());
          setEndTime(parts[1].trim());
        } else {
          // Handle special cases like "24 Hours"
          setStartTime("9:00 AM");
          setEndTime("9:00 PM");
        }
      }
      setNewHours(dayHours);
    } else if (typeof dayHours === 'object' && dayHours !== null) {
      setStartTime(dayHours.open || "9:00 AM");
      setEndTime(dayHours.close || "9:00 PM");
      setNewHours(`${dayHours.open} - ${dayHours.close}`);
      setIsClosed(false);
    } else {
      setStartTime("9:00 AM");
      setEndTime("9:00 PM");
      setNewHours("9:00 AM - 9:00 PM");
      setIsClosed(false);
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDay(null);
    setNewHours("");
    setIsClosed(false);
  };

  const handleSave = async () => {
    if (selectedDay) {
      const hoursToSave = isClosed ? "Closed" : `${startTime} - ${endTime}`;
      const updatedHours = { ...hours, [selectedDay]: hoursToSave };

      try {
        // Save to database - send as hoursJson string
        const response = await api.restaurants.update(restaurantId, {
          hoursJson: JSON.stringify(updatedHours)
        });

        if (response.success) {
          setHours(updatedHours);
          if (onSaved) onSaved(`Hours updated for ${selectedDay}`);
        } else {
          alert('Failed to update hours: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error updating hours:', error);
        alert('Failed to update hours. Please try again.');
      }
    }
    handleCloseModal();
  };

  const getDayStatus = (dayHours) => {
    if (typeof dayHours === 'string') {
      return dayHours === "Closed" ? "closed" : "open";
    } else if (typeof dayHours === 'object' && dayHours !== null) {
      return "open";
    }
    return "closed";
  };

  const getStatusColor = (status) => {
    return status === "closed" ? "#f44336" : "#4caf50";
  };

  const formatHoursDisplay = (dayHours) => {
    if (typeof dayHours === 'string') {
      return dayHours;
    } else if (typeof dayHours === 'object' && dayHours !== null) {
      if (dayHours.open && dayHours.close) {
        return `${dayHours.open} - ${dayHours.close}`;
      }
    }
    return "Closed";
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-4">
        <h4
          style={{
            color: "#2d5016",
            fontWeight: "700",
            marginBottom: "5px"
          }}
        >
          🕒 Opening Hours
        </h4>
        <p style={{ color: "#4a7c59", margin: "0" }}>
          Configure your restaurant's operating schedule
        </p>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading hours...</span>
          </div>
          <p className="mt-2 text-muted">Loading hours...</p>
        </div>
      )}

      {!loading && (
      <>

      {/* Quick Stats */}
      <div className="row mb-4">
        <div className="col-md-4">
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
            <h3 style={{ margin: "0", fontWeight: "700" }}>
              {Object.values(hours).filter(h => h !== "Closed").length}
            </h3>
            <p style={{ margin: "0", opacity: "0.9" }}>Days Open</p>
          </div>
        </div>
        <div className="col-md-4">
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
              {Object.values(hours).filter(h => h !== "Closed").length * 10}h
            </h3>
            <p style={{ margin: "0", opacity: "0.9" }}>~Weekly Hours</p>
          </div>
        </div>
        <div className="col-md-4">
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
              {Object.values(hours).filter(h => h === "Closed").length}
            </h3>
            <p style={{ margin: "0", opacity: "0.9" }}>Days Closed</p>
          </div>
        </div>
      </div>

      {/* Hours List */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(76, 175, 80, 0.1)",
          boxShadow: "0 10px 30px rgba(76, 175, 80, 0.08)",
          overflow: "hidden"
        }}
      >
        {Object.entries(hours).map(([day, time], index) => {
          const status = getDayStatus(time);
          const statusColor = getStatusColor(status);
          const displayTime = formatHoursDisplay(time);

          return (
            <div
              key={day}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 25px",
                borderBottom: index < Object.entries(hours).length - 1 ? "1px solid rgba(76, 175, 80, 0.1)" : "none",
                transition: "all 0.3s ease",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(76, 175, 80, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Day Info */}
              <div className="d-flex align-items-center">
                <div
                  style={{
                    fontSize: "1.5rem",
                    marginRight: "15px"
                  }}
                >
                  {dayEmojis[day]}
                </div>
                <div>
                  <h6
                    style={{
                      color: "#2d5016",
                      fontWeight: "700",
                      margin: "0",
                      fontSize: "1.1rem"
                    }}
                  >
                    {day}
                  </h6>
                  <div className="d-flex align-items-center mt-1">
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: statusColor,
                        marginRight: "8px"
                      }}
                    />
                    <span
                      style={{
                        color: statusColor,
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        textTransform: "uppercase"
                      }}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hours Info */}
              <div className="d-flex align-items-center">
                <div className="text-end me-3">
                  <div
                    style={{
                      color: "#2d5016",
                      fontWeight: "600",
                      fontSize: "1rem"
                    }}
                  >
                    {displayTime}
                  </div>
                  {displayTime !== "Closed" && (
                    <small style={{ color: "#4a7c59" }}>
                      {day === "Friday" || day === "Saturday" ? "Extended hours" : "Regular hours"}
                    </small>
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={() => handleOpenModal(day)}
                  style={{
                    background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 16px",
                    fontWeight: "600",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(76, 175, 80, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.2)";
                  }}
                >
                  ✏️ Edit
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Hours Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
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
            <Modal.Title style={{ fontWeight: "700", fontSize: "1.3rem" }}>
              {dayEmojis[selectedDay]} Edit Hours for {selectedDay}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ padding: "30px" }}>
            <Form>
              {/* Closed Toggle */}
              <Form.Group className="mb-4">
                <Form.Check
                  type="switch"
                  id="closed-switch"
                  label="Closed all day"
                  checked={isClosed}
                  onChange={(e) => setIsClosed(e.target.checked)}
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#2d5016"
                  }}
                />
              </Form.Group>

              {!isClosed && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontWeight: "600",
                        color: "#2d5016",
                        marginBottom: "10px"
                      }}
                    >
                      Opening Time
                    </Form.Label>
                    <Form.Select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e8f5e8",
                        padding: "12px 16px",
                        fontSize: "1rem",
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
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label
                      style={{
                        fontWeight: "600",
                        color: "#2d5016",
                        marginBottom: "10px"
                      }}
                    >
                      Closing Time
                    </Form.Label>
                    <Form.Select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e8f5e8",
                        padding: "12px 16px",
                        fontSize: "1rem",
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
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </Form.Select>
                    <Form.Text style={{ color: "#4a7c59", marginTop: "8px", display: "block" }}>
                      💡 Select opening and closing times from the dropdowns
                    </Form.Text>
                  </Form.Group>
                </>
              )}

              {/* Quick Preset Buttons */}
              {!isClosed && (
                <div style={{ marginTop: "20px" }}>
                  <small style={{
                    color: "#4a7c59",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "10px"
                  }}>
                    Quick Presets:
                  </small>
                  <div className="d-flex flex-wrap gap-2">
                    {[
                      { label: "9:00 AM - 9:00 PM", start: "9:00 AM", end: "9:00 PM" },
                      { label: "10:00 AM - 10:00 PM", start: "10:00 AM", end: "10:00 PM" },
                      { label: "11:00 AM - 11:00 PM", start: "11:00 AM", end: "11:00 PM" },
                      { label: "8:00 AM - 5:00 PM", start: "8:00 AM", end: "5:00 PM" }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setStartTime(preset.start);
                          setEndTime(preset.end);
                        }}
                        style={{
                          background: (startTime === preset.start && endTime === preset.end)
                            ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
                            : "rgba(76, 175, 80, 0.1)",
                          color: (startTime === preset.start && endTime === preset.end) ? "white" : "#4caf50",
                          border: "1px solid rgba(76, 175, 80, 0.2)",
                          borderRadius: "20px",
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              💾 Save Hours
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
      </>
      )}
    </div>
  );
};

export default HoursManager;
