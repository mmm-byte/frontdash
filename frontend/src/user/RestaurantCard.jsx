import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
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
        {restaurant.isDemo && <span className="frontdash-open-badge is-preview">Sample listing</span>}
        {restaurant.open === false && <span className="frontdash-open-badge is-closed">Closed</span>}
      </button>
      <div className="frontdash-restaurant-info">
        <div className="frontdash-restaurant-name-row"><h3>{restaurant.name}</h3></div>
        {(restaurant.cuisine || restaurant.tags?.length > 0) && <div className="frontdash-restaurant-cuisine">{restaurant.cuisine || restaurant.tags.join(" · ")}</div>}
        {restaurant.address && <p><MapPin size={13} aria-hidden="true" />{restaurant.address}</p>}
        <button className="frontdash-menu-link" type="button" onClick={openMenu}>View menu <ArrowUpRight size={15} /></button>
      </div>
    </article>
  );
};

export default RestaurantCard;
