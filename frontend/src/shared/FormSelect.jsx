import React from 'react';

const FormSelect = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  options = [],
  className = '',
  placeholder = 'Select...',
  ...props
}) => {
  const getValidationClass = () => {
    if (touched && error) return 'is-invalid';
    if (touched && !error && value) return 'is-valid';
    return '';
  };

  return (
    <div className={`mb-3 ${className}`}>
      <label className="form-label fw-semibold text-dark">
        {label}
      </label>
      <select
        name={name}
        className={`form-select form-control-lg rounded-3 ${getValidationClass()}`}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {touched && error && (
        <div className="invalid-feedback">{error}</div>
      )}
    </div>
  );
};

export default FormSelect;
