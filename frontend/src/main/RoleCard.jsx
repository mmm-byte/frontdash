// src/components/RoleCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const RoleCard = ({ title, description, loginLink, registerLink, color }) => {
  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column justify-content-center">
          <h3 className="card-title mb-3">{title}</h3>
          <p className="card-text">{description}</p>
          <div className="d-flex justify-content-around mt-auto">
            {loginLink && (
              <Link to={loginLink} className={`btn btn-${color}`}>
                Login
              </Link>
            )}
            {registerLink && (
              <Link to={registerLink} className={`btn btn-outline-${color}`}>
                Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
