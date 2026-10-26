import React, { useMemo } from 'react';

const VirtualCardPreview = ({ formData, selectedCardType, cardType }) => {
  const getCardColor = useMemo(() => {
    const currentType = selectedCardType || cardType;
    const colors = {
      visa: 'linear-gradient(45deg, #1a1f71, #0f4c75)',
      mastercard: 'linear-gradient(45deg, #eb001b, #ff5f00)',
      amex: 'linear-gradient(45deg, #006fcf, #0077be)',
      discover: 'linear-gradient(45deg, #ff6000, #ff8500)'
    };
    return colors[currentType] || 'linear-gradient(45deg, #374151, #1f2937)';
  }, [cardType, selectedCardType]);

  const getCardIcon = useMemo(() => {
    const currentType = selectedCardType || cardType;
    const icons = {
      visa: 'VISA',
      mastercard: 'MC',
      amex: 'AMEX',
      discover: 'DISC'
    };
    return icons[currentType] || 'CARD';
  }, [cardType, selectedCardType]);

  return (
    <>
      <div className="mb-3">
        <div
          className="card-preview p-4 rounded-4 position-relative overflow-hidden shadow"
          style={{
            background: getCardColor,
            minHeight: '180px',
            border: '2px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Card Background Pattern */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%),
                linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)
              `,
              opacity: 0.8
            }}
          ></div>

          <div className="position-relative">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="p-2 bg-dark bg-opacity-25 rounded-2 backdrop-blur">
                <i className="bi bi-credit-card text-white fs-4"></i>
              </div>
              <div className="text-end">
                <div className="fw-bold text-uppercase small px-2 py-1 bg-dark bg-opacity-25 rounded-2 text-white backdrop-blur">
                  {getCardIcon}
                </div>
                <small className="text-white opacity-75 d-block mt-1 fw-medium">Debit/Credit</small>
              </div>
            </div>

            <div className="mb-3">
              <div
                className="fs-3 fw-bold font-monospace text-white"
                style={{
                  letterSpacing: '4px',
                  textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                }}
              >
                {formData.cardNumber || '•••• •••• •••• ••••'}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-end">
              <div>
                <small className="text-white opacity-75 d-block fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                  Cardholder Name
                </small>
                <div
                  className="fw-bold text-uppercase text-white"
                  style={{
                    textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                    fontSize: '0.9rem'
                  }}
                >
                  {formData.firstName || formData.lastName
                    ? `${formData.firstName} ${formData.lastName}`.trim()
                    : 'YOUR NAME'
                  }
                </div>
              </div>
              <div className="text-end">
                <small className="text-white opacity-75 d-block fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                  Expires
                </small>
                <div
                  className="fw-bold font-monospace text-white"
                  style={{
                    textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                    fontSize: '0.9rem'
                  }}
                >
                  {formData.expiry || 'MM/YY'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Preview Styles */}
      <style jsx>{`
        .card-preview {
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        .backdrop-blur {
          backdrop-filter: blur(10px);
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
};

export default VirtualCardPreview;
