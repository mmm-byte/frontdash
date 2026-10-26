import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/restaurantCard.css";

const RestaurantCard = ({ restaurant, onClosedClick }) => {
  const navigate = useNavigate();

  const openMenu = () => {
    if (restaurant.open === false) {
      onClosedClick?.(restaurant);
      return;
    }
    navigate("/customer-menu", { state: { restaurant } });
  };

  return (
    <article className="frontdash-restaurant-card">
      <button className="frontdash-restaurant-image" type="button" onClick={openMenu} aria-label={`Explore ${restaurant.name} menu`}>
        <img
          src={restaurant.image}
          alt={`${restaurant.name} dishes`}
          loading="lazy"
          onError={(event) => { event.currentTarget.src = "/images/pizza.jpg"; }}
        />
        <span className={`frontdash-open-badge${restaurant.open === false ? " is-closed" : ""}`}>
          <span />{restaurant.open === false ? "Closed" : "Taking orders"}
        </span>
      </button>
      <div className="frontdash-restaurant-info">
        <div className="frontdash-restaurant-name-row"><h3>{restaurant.name}</h3><span className="frontdash-restaurant-spark"><i className="bi bi-stars" /></span></div>
        <p><i className="bi bi-geo-alt" aria-hidden="true" />{restaurant.address}</p>
        <button className="frontdash-menu-link" type="button" onClick={openMenu}>Explore menu <i className="bi bi-arrow-up-right" /></button>
      </div>
    </article>
  );
};

export default RestaurantCard;
