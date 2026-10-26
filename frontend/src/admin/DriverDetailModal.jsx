import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Truck, Phone, User, Shield, CheckCircle } from 'lucide-react';

const DriverDetailModal = ({ show, onHide, driver, onEdit, onRemove }) => {
  if (!driver) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'busy': return 'warning';
      case 'offline': return 'danger';
      default: return 'primary';
    }
  };

  const getVehicleInfo = (vehicleType) => {
    switch (vehicleType?.toLowerCase()) {
      case 'motorcycle':
        return { color: '#1e40af', bg: '#dbeafe', icon: '🏍️' };
      case 'car':
        return { color: '#475569', bg: '#f1f5f9', icon: '🚗' };
      case 'van':
        return { color: '#4338ca', bg: '#e0e7ff', icon: '🚐' };
      case 'truck':
        return { color: '#374151', bg: '#f3f4f6', icon: '🚚' };
      default:
        return { color: '#6b7280', bg: '#f3f4f6', icon: '🚗' };
    }
  };

  const vehicleInfo = getVehicleInfo(driver.vehicle);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <Truck className="me-2" size={24} />
          Driver Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row>
          <Col md={4} className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#e2e8f0',
                borderRadius: '50%',
                fontSize: '48px',
                color: '#64748b'
              }}
            >
              <User size={60} />
            </div>
            <h5 className="fw-bold text-dark">{driver.name}</h5>
            <p className="text-muted mb-2">Professional Driver</p>
            <Badge bg={getStatusColor(driver.status)} className="px-3 py-2">
              <CheckCircle size={14} className="me-1" />
              {driver.status ? driver.status.charAt(0).toUpperCase() + driver.status.slice(1) : 'Active'}
            </Badge>
          </Col>

          <Col md={8}>
            <div className="mb-4">
              <h6 className="text-muted mb-3">Contact Information</h6>
              <div className="d-flex align-items-center mb-3">
                <Phone size={16} className="text-primary me-2" />
                <strong className="me-2">Phone:</strong>
                <span>{driver.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-3">Vehicle Information</h6>
              <div className="d-flex align-items-center mb-3">
                <div
                  className="me-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: vehicleInfo.bg,
                    borderRadius: '8px',
                    fontSize: '20px'
                  }}
                >
                  {vehicleInfo.icon}
                </div>
                <div>
                  <div className="fw-bold" style={{ color: vehicleInfo.color }}>
                    {driver.vehicle ? driver.vehicle.charAt(0).toUpperCase() + driver.vehicle.slice(1) : 'Not specified'}
                  </div>
                  <small className="text-muted">Vehicle Type</small>
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <Shield size={16} className="text-primary me-2" />
                <strong className="me-2">License:</strong>
                <code className="bg-light p-2 rounded">{driver.license || 'Not provided'}</code>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        {onEdit && (
          <Button variant="primary" onClick={() => { onEdit(driver); onHide(); }}>
            Edit Driver
          </Button>
        )}
        {onRemove && (
          <Button variant="outline-danger" onClick={() => { onRemove(driver); onHide(); }}>
            Remove Driver
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DriverDetailModal;
