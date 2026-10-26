import React from 'react';

const FormInput = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  type = "text",
  placeholder = "",
  icon = null,
  maxLength = null,
  className = "",
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
        {icon && <i className={`bi bi-${icon} me-2 text-muted`}></i>}
        {label}
      </label>
      <input
        type={type}
        name={name}
        className={`form-control form-control-lg rounded-3 ${getValidationClass()}`}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        spellCheck="false"
        {...props}
      />
      {touched && error && (
        <div className="invalid-feedback">{error}</div>
      )}
    </div>
  );
};

export default FormInput;
