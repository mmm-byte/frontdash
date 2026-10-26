import React from 'react';

const CardTypeSelector = ({ selectedCardType, onCardTypeChange }) => {
  const cardTypes = [
    { value: 'visa', label: 'Visa', color: '#1a1f71' },
    { value: 'mastercard', label: 'Mastercard', color: '#eb001b' },
    { value: 'discover', label: 'Discover', color: '#ff6000' },
    { value: 'amex', label: 'American Express', color: '#006fcf' }
  ];

  return (
    <div className="col-12">
      <label className="form-label fw-semibold text-dark">
        <i className="bi bi-credit-card me-2 text-muted"></i>
        Card Type
      </label>
      <div className="row g-2">
        {cardTypes.map((card) => (
          <div key={card.value} className="col-6">
            <input
              type="radio"
              className="btn-check"
              name="cardTypeRadio"
              id={card.value}
              value={card.value}
              checked={selectedCardType === card.value}
              onChange={onCardTypeChange}
            />
            <label
              className={`btn btn-outline-secondary w-100 ${selectedCardType === card.value ? 'active' : ''}`}
              htmlFor={card.value}
              style={{
                borderColor: selectedCardType === card.value ? card.color : '#dee2e6',
                backgroundColor: selectedCardType === card.value ? card.color : 'transparent',
                color: selectedCardType === card.value ? 'white' : '#6c757d'
              }}
            >
              {card.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardTypeSelector;
