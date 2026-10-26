// src/pages/RestaurantRegistration.jsx
import React, { useMemo, useRef, useState } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../shared/SuccessModal';
import api from '../utils/api';
import '../styles/validation.css';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'];

const RestaurantRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    picture: '',
    building: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    contactPerson: '',
    email: '',
    hours: {
      monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: ''
    },
    menu: [],
  });
  const [menuItem, setMenuItem] = useState({ name: '', picture: '', price: '', availability: 'AVAILABLE' });
  const [errors, setErrors] = useState({});
  const [menuError, setMenuError] = useState('');
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const bannerRef = useRef(null);

  const timeOptions = useMemo(() => {
    const opts = [];
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const ampm = h < 12 ? 'AM' : 'PM';
        const hr = h % 12 === 0 ? 12 : h % 12;
        opts.push(`${hr}:${pad(m)} ${ampm}`);
      }
    }
    return opts;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Limit phone to 10 digits
    if (name === 'phone') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleHourChange = (day, val) => {
    setFormData(prev => ({ ...prev, hours: { ...prev.hours, [day]: val } }));
    if (errors.hours) setErrors(prev => { const n = { ...prev }; delete n.hours; return n; });
  };

  const handleMenuChange = (e) => {
    const { name, value } = e.target;
    setMenuItem(prev => ({ ...prev, [name]: value }));
  };

  const handleRestaurantImageUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) setFormData(prev => ({ ...prev, picture: URL.createObjectURL(f) }));
  };
  const handleMenuImageUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) setMenuItem(prev => ({ ...prev, picture: URL.createObjectURL(f) }));
  };

  const addMenuItem = () => {
    setMenuError('');
    if (!menuItem.name.trim()) return setMenuError('Menu item name is required');
    if (!menuItem.picture.trim()) return setMenuError('Menu item picture is required');
    const priceNum = parseFloat(menuItem.price);
    if (isNaN(priceNum) || priceNum <= 0) return setMenuError('Menu item price must be a positive number');
    setFormData(prev => ({ ...prev, menu: [...prev.menu, { ...menuItem, price: priceNum }] }));
    setMenuItem({ name: '', picture: '', price: '', availability: 'AVAILABLE' });
    if (errors.menu) setErrors(prev => { const n = { ...prev }; delete n.menu; return n; });
  };

  const validateForm = () => {
    const e = {};
    const phoneDigits = formData.phone.replace(/\D/g, '');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    // Restaurant name validation - Title Case required
    if (!formData.name.trim()) {
      e.name = 'Restaurant name is required';
    } else if (formData.name.trim().length < 3) {
      e.name = 'Restaurant name must be at least 3 characters';
    } else {
      const nameWords = formData.name.trim().split(/\s+/);
      const isValidTitleCase = nameWords.every(word => {
        if (word.length === 0) return true;
        return /^[A-Z][a-z]*$/.test(word);
      });
      if (!isValidTitleCase) {
        e.name = 'Restaurant name must be in Title Case (e.g., "Pizza Palace")';
      }
    }

    // Building number validation
    if (!formData.building.trim()) {
      e.building = 'Building number is required';
    } else if (!/^[0-9]+[A-Za-z]?$/.test(formData.building.trim())) {
      e.building = 'Enter valid building number (e.g., 123 or 123A)';
    }

    // Street validation - Allow common street formats
    if (!formData.street.trim()) {
      e.street = 'Street is required';
    } else if (formData.street.trim().length < 3) {
      e.street = 'Street name must be at least 3 characters';
    } else {
      const streetPattern = /^[0-9]*\s*[A-Z]?\.?\s*[A-Z][a-z]*(\s+[A-Z][a-z]*|\s+[A-Z]\.?)*$/;
      // This pattern allows:
      // - Optional number at start (5750)
      // - Optional single letter (E, W, N, S) with or without period
      // - Title Case words (University, Blvd)
      // - Abbreviations with period (St., Ave., Blvd.)
      if (!streetPattern.test(formData.street.trim())) {
        e.street = 'Street must use proper format (e.g., "Main Street" or "5750 E University Blvd.")';
      }
    }

    // City validation - Title Case required
    if (!formData.city.trim()) {
      e.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      e.city = 'City name must be at least 2 characters';
    } else {
      const cityWords = formData.city.trim().split(/\s+/);
      const isValidTitleCase = cityWords.every(word => {
        if (word.length === 0) return true;
        return /^[A-Z][a-z]*$/.test(word);
      });
      if (!isValidTitleCase) {
        e.city = 'City must be in Title Case (e.g., "San Antonio")';
      }
    }

    // State validation
    if (!formData.state.trim()) {
      e.state = 'State is required';
    }

    // ZIP validation
    if (!formData.zip.trim()) {
      e.zip = 'ZIP is required';
    } else if (!/^\d{5}$/.test(formData.zip.trim())) {
      e.zip = 'ZIP must be exactly 5 digits';
    }

    // Phone validation
    if (!phoneDigits) {
      e.phone = 'Phone number is required';
    } else if (phoneDigits.length !== 10) {
      e.phone = 'Phone must be exactly 10 digits';
    } else if (!/^[1-9]\d{9}$/.test(phoneDigits)) {
      e.phone = 'Phone cannot start with 0';
    }

    // Contact person validation - Title Case required
    if (!formData.contactPerson.trim()) {
      e.contactPerson = 'Contact person is required';
    } else if (formData.contactPerson.trim().length < 2) {
      e.contactPerson = 'Contact person name must be at least 2 characters';
    } else {
      const nameWords = formData.contactPerson.trim().split(/\s+/);
      const isValidTitleCase = nameWords.every(word => {
        if (word.length === 0) return true;
        return /^[A-Z][a-z]*$/.test(word);
      });
      if (!isValidTitleCase) {
        e.contactPerson = 'Contact person must be in Title Case (e.g., "John Doe")';
      }
    }

    // Email validation
    if (!emailOk) {
      e.email = 'Enter a valid email (name@domain.tld)';
    }

    // Menu validation
    if (formData.menu.length === 0) {
      e.menu = 'Add at least one menu item';
    }

    // Hours validation
    const partialHours = Object.entries(formData.hours || {}).some(([_, val]) => {
      if (!val) return false;
      const parts = val.split(' - ').map(s => s.trim());
      return parts.length !== 2 || !parts[0] || !parts[1];
    });
    if (partialHours) e.hours = 'Please provide both opening and closing times for each open day';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmittedAttempt(true);
    if (!validateForm()) {
      setTimeout(() => bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
      return;
    }

    try {
      // Prepare data for API
      const registrationData = {
        name: formData.name,
        building: formData.building,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        phone: formData.phone,
        contactPerson: formData.contactPerson,
        email: formData.email,
        hours: formData.hours,
        menu: formData.menu,
        picture: formData.picture
      };

      // Call the API
      const response = await api.restaurants.register(registrationData);

      if (response.success) {
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigate('/');
        }, 3500);
      }
    } catch (error) {
      console.error('Registration error:', error);

      // Check if it's a duplicate name error
      if (error.message && error.message.includes('already exists')) {
        setErrors(prev => ({ ...prev, name: 'A restaurant with this name already exists or is pending.' }));
      } else {
        setErrors(prev => ({ ...prev, submit: error.message || 'Failed to submit registration. Please try again.' }));
      }

      setTimeout(() => bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  };

  return (
    <div className="container mt-5">
      <Card className="shadow-lg p-4">
        <h2 className="mb-3 text-center">Restaurant Registration</h2>
        {submittedAttempt && Object.keys(errors).length > 0 && (
          <div ref={bannerRef} className="alert" style={{ background: '#ffe5e5', border: '2px solid #ef4444', color: '#b91c1c', fontWeight: 600 }}>
            A few required fields are missing. Please complete all highlighted fields.
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Basic Details */}
          <Form.Group className="mb-3 position-relative">
            <Form.Label>Restaurant Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={submittedAttempt && !!errors.name}
              placeholder="e.g., Pizza Palace (Title Case)"
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Picture <small className="text-muted">(optional)</small></Form.Label>
            <div className="d-flex gap-2">
              <Form.Control name="picture" value={formData.picture} onChange={handleChange} placeholder="Image URL" />
              <Form.Control type="file" accept="image/*" onChange={handleRestaurantImageUpload} />
            </div>
            {formData.picture && <img src={formData.picture} alt="preview" style={{ height: 80, marginTop: 8 }} />}
          </Form.Group>

          {/* Address */}
          <h5 className="mt-3">Street Address <span className="text-danger">*</span></h5>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Control
                name="building"
                value={formData.building}
                onChange={handleChange}
                isInvalid={submittedAttempt && !!errors.building}
                placeholder="e.g., 123 or 123A"
              />
              <Form.Control.Feedback type="invalid">{errors.building}</Form.Control.Feedback>
            </Col>
            <Col md>
              <Form.Control
                name="street"
                value={formData.street}
                onChange={handleChange}
                isInvalid={submittedAttempt && !!errors.street}
                placeholder="e.g., Main Street or 5750 E University Blvd."
              />
              <Form.Control.Feedback type="invalid">{errors.street}</Form.Control.Feedback>
            </Col>
            <Col md>
              <Form.Control
                name="city"
                value={formData.city}
                onChange={handleChange}
                isInvalid={submittedAttempt && !!errors.city}
                placeholder="San Antonio (Title Case)"
              />
              <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
            </Col>
            <Col md>
              <Form.Select
                name="state"
                value={formData.state}
                onChange={handleChange}
                isInvalid={submittedAttempt && !!errors.state}
              >
                <option value="">State</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
            </Col>
            <Col md>
              <Form.Control
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                isInvalid={submittedAttempt && !!errors.zip}
                placeholder="ZIP"
              />
              <Form.Control.Feedback type="invalid">{errors.zip}</Form.Control.Feedback>
            </Col>
          </Row>

          {/* Contact */}
          <Form.Group className="mb-3">
            <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
            <Form.Control
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              isInvalid={submittedAttempt && !!errors.phone}
              placeholder="10 digits, no leading 0"
            />
            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Contact Person <span className="text-danger">*</span></Form.Label>
            <Form.Control
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              isInvalid={submittedAttempt && !!errors.contactPerson}
              placeholder="John Doe (Title Case)"
            />
            <Form.Control.Feedback type="invalid">{errors.contactPerson}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={submittedAttempt && !!errors.email}
              placeholder="name@domain.com"
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          {/* Hours */}
          <h5 className="mt-3">Hours of Operation <span className="text-danger">*</span></h5>
          {errors.hours && <div className="text-danger mb-2">{errors.hours}</div>}
          {Object.keys(formData.hours).map(day => (
            <Form.Group key={day} className="mb-2">
              <Form.Label className="text-capitalize">{day}</Form.Label>
              <Row>
                <Col md>
                  <Form.Select value={(formData.hours[day] || '').split(' - ')[0] || ''} onChange={(e)=>{
                    const open = e.target.value;
                    const close = (formData.hours[day] || '').split(' - ')[1] || '';
                    handleHourChange(day, open && close ? `${open} - ${close}` : open ? `${open} - ` : '');
                  }}>
                    <option value="">Closed</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                </Col>
                <Col md>
                  <Form.Select value={(formData.hours[day] || '').split(' - ')[1] || ''} onChange={(e)=>{
                    const close = e.target.value;
                    const open = (formData.hours[day] || '').split(' - ')[0] || '';
                    handleHourChange(day, open && close ? `${open} - ${close}` : close ? ` - ${close}` : '');
                  }}>
                    <option value="">Select close</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                </Col>
              </Row>
            </Form.Group>
          ))}

          {/* Menu */}
          <h5 className="mt-4">Menu</h5>
          <Row className="mb-2">
            <Col><small className="text-muted">Item Name <span className="text-danger">*</span></small></Col>
            <Col><small className="text-muted">Picture <span className="text-danger">*</span></small></Col>
            <Col><small className="text-muted">Price <span className="text-danger">*</span></small></Col>
            <Col><small className="text-muted">Availability</small></Col>
            <Col />
          </Row>
          <Row className="mb-3">
            <Col><Form.Control name="name" value={menuItem.name} onChange={handleMenuChange} placeholder="e.g., Margherita"/></Col>
            <Col>
              <div className="d-flex gap-2">
                <Form.Control name="picture" value={menuItem.picture} onChange={handleMenuChange} placeholder="Image URL" />
                <Form.Control type="file" accept="image/*" onChange={handleMenuImageUpload} />
              </div>
            </Col>
            <Col><Form.Control name="price" type="number" value={menuItem.price} onChange={handleMenuChange} placeholder="9.99"/></Col>
            <Col>
              <Form.Select name="availability" value={menuItem.availability} onChange={handleMenuChange}>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="UNAVAILABLE">UNAVAILABLE</option>
              </Form.Select>
            </Col>
            <Col>
              <Button variant="success" onClick={addMenuItem}>Add</Button>
            </Col>
          </Row>
          {menuError && <div className="text-danger mb-3">{menuError}</div>}

          {formData.menu.length > 0 && (
            <ul className="list-group mb-3">
              {formData.menu.map((it, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{it.name} - ${it.price} ({it.availability})</span>
                  <Button size="sm" variant="outline-danger" onClick={()=> setFormData(prev => ({ ...prev, menu: prev.menu.filter((_,i)=>i!==idx) }))}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
          {errors.menu && <div className="alert alert-danger mb-3" style={{ fontSize: 14 }}>{errors.menu}</div>}

          <Button type="submit" className="btn btn-gradient-brand mt-2">Register Restaurant</Button>
        </Form>
      </Card>

      <SuccessModal show={showModal} message="Your registration request has been sent to the admin. You will be notified once approved." />
    </div>
  );
};

export default RestaurantRegistration;
