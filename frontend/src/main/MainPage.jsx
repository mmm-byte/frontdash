import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RestaurantCard from "../user/RestaurantCard";
import ToastNotification from "../shared/ToastNotification";
import api from "../utils/api";
import "../styles/mainpage.css";

const categories = [
  { label: "Pizza", image: "/images/pizza.jpg", icon: "bi-pie-chart-fill" },
  { label: "Burgers", image: "/images/burger.jpg", icon: "bi-fire" },
  { label: "Sushi", image: "/images/sushi.jpg", icon: "bi-egg-fried" },
  { label: "Tacos", image: "/images/taco.jpg", icon: "bi-stars" },
];

const MainPage = () => {
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "warning" });

  const loadRestaurants = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await api.restaurants.getAll("APPROVED");
      if (response?.success && response.data) {
        setRestaurants(response.data.map((restaurant) => ({
          id: restaurant.restaurantID,
          name: restaurant.name,
          address: `${restaurant.street}, ${restaurant.city}, ${restaurant.state} ${restaurant.zip}`,
          image: restaurant.pictureUrl || "/images/restaurant-default.jpg",
          open: true,
          tags: restaurant.tags || [],
        })));
      } else {
        setRestaurants([]);
      }
    } catch (error) {
      console.error("Failed to load restaurants:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesCategory = !selectedCategory
      || restaurant.tags.length === 0
      || restaurant.tags.some((tag) => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  }), [restaurants, search, selectedCategory]);

  const showClosedToast = (restaurant) => {
    setToast({ show: true, message: `${restaurant.name} is currently closed. Try again later.`, type: "warning" });
  };

  return (
    <main className="frontdash-page">
      <section className="frontdash-hero">
        <div className="frontdash-hero-glow frontdash-hero-glow-one" />
        <div className="frontdash-hero-glow frontdash-hero-glow-two" />
        <div className="container frontdash-hero-grid">
          <div className="frontdash-hero-copy">
            <span className="frontdash-eyebrow"><span /> GOOD FOOD, RIGHT AROUND YOU</span>
            <h1><span>Make tonight</span><span>a little <em>tastier.</em></span></h1>
            <p>Find a new favorite, build your order, and let the good part of your day come to you.</p>
            <form className="frontdash-search" onSubmit={(event) => event.preventDefault()} role="search">
              <i className="bi bi-search" aria-hidden="true" />
              <input
                aria-label="Search restaurants"
                placeholder="What are you craving?"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><i className="bi bi-x-lg" /></button>}
              <a href="#restaurants" className="frontdash-search-submit" aria-label="Find restaurants"><i className="bi bi-arrow-right" /></a>
            </form>
            <div className="frontdash-hero-meta">
              <span><i className="bi bi-clock" /> A few taps to happy</span>
              <span><i className="bi bi-heart" /> Made for your cravings</span>
            </div>
          </div>
          <div className="frontdash-hero-art" aria-label="A selection of freshly prepared dishes" role="img">
            <div className="frontdash-food-orbit orbit-one" />
            <div className="frontdash-food-orbit orbit-two" />
            <div className="frontdash-food-photo frontdash-food-photo-main"><img src="/images/burger.jpg" alt="Freshly made burger" /></div>
            <div className="frontdash-food-photo frontdash-food-photo-small"><img src="/images/taco.jpg" alt="Colorful tacos" /></div>
            <div className="frontdash-food-note"><span className="frontdash-note-icon"><i className="bi bi-stars" /></span><span><strong>Your next favorite</strong><small>is closer than you think</small></span></div>
            <span className="frontdash-art-spark spark-one">✧</span><span className="frontdash-art-spark spark-two">✦</span>
          </div>
        </div>
        <a className="frontdash-scroll-cue" href="#discover"><span /> SCROLL TO DISCOVER</a>
      </section>

      <section className="frontdash-discover container" id="discover">
        <div className="frontdash-section-heading">
          <div><span className="frontdash-kicker">THE SHORTLIST</span><h2>What sounds good?</h2></div>
          <p>Pick a craving. We’ll find the rest.</p>
        </div>
        <div className="frontdash-categories" aria-label="Filter by food category">
          {categories.map((category) => (
            <button
              key={category.label}
              type="button"
              className={`frontdash-category${selectedCategory === category.label ? " is-active" : ""}`}
              onClick={() => setSelectedCategory((current) => current === category.label ? "" : category.label)}
              aria-pressed={selectedCategory === category.label}
            >
              <span className="frontdash-category-image"><img src={category.image} alt="" /><i className={`bi ${category.icon}`} /></span>
              <span>{category.label}</span><i className="bi bi-arrow-up-right frontdash-category-arrow" />
            </button>
          ))}
          {selectedCategory && <button type="button" className="frontdash-clear-filter" onClick={() => setSelectedCategory("")}>Clear filter <i className="bi bi-x" /></button>}
        </div>
      </section>

      <section className="frontdash-restaurants container" id="restaurants">
        <div className="frontdash-section-heading frontdash-restaurant-heading">
          <div><span className="frontdash-kicker">GOOD THINGS ARE COOKING</span><h2>{search ? `Results for “${search}”` : "Around the table"}</h2></div>
          {!loading && !loadError && <span className="frontdash-result-count">{filteredRestaurants.length} {filteredRestaurants.length === 1 ? "place" : "places"}</span>}
        </div>
        {loading ? (
          <div className="frontdash-loading" role="status"><span className="frontdash-loader" /><span>Finding something delicious…</span></div>
        ) : loadError ? (
          <div className="frontdash-empty-state">
            <span className="frontdash-empty-icon"><i className="bi bi-wifi-off" /></span><h3>We lost the menu for a moment.</h3>
            <p>Give it another try in a few seconds.</p><button type="button" className="frontdash-retry" onClick={loadRestaurants}>Try again <i className="bi bi-arrow-repeat" /></button>
          </div>
        ) : filteredRestaurants.length ? (
          <div className="row g-4 frontdash-restaurant-grid">
            {filteredRestaurants.map((restaurant) => <div className="col-lg-4 col-md-6" key={restaurant.id}><RestaurantCard restaurant={restaurant} onClosedClick={showClosedToast} /></div>)}
          </div>
        ) : (
          <div className="frontdash-empty-state">
            <span className="frontdash-empty-icon"><i className="bi bi-emoji-smile" /></span>
            <h3>{restaurants.length ? "Nothing on the menu for that search." : "The table is waiting for you."}</h3>
            <p>{restaurants.length ? "Try another craving or clear your filters." : "Restaurants can join the neighborhood and start serving."}</p>
            {restaurants.length ? <button type="button" className="frontdash-retry" onClick={() => { setSearch(""); setSelectedCategory(""); }}>Clear search <i className="bi bi-arrow-right" /></button> : <Link className="frontdash-retry" to="/restaurant-registration">List your restaurant <i className="bi bi-arrow-up-right" /></Link>}
          </div>
        )}
      </section>

      <section className="frontdash-partner-band">
        <div className="container frontdash-partner-inner"><span className="frontdash-partner-mark"><i className="bi bi-shop" /></span><div><span className="frontdash-kicker">GOOD FOOD STARTS WITH GOOD PEOPLE</span><h2>Have a restaurant?</h2><p>Bring your menu to the neighborhood.</p></div><Link to="/restaurant-registration" className="frontdash-partner-link">Join FrontDash <i className="bi bi-arrow-up-right" /></Link></div>
      </section>

      <footer className="frontdash-footer"><div className="container"><Link to="/" className="frontdash-footer-brand"><span className="frontdash-brand-icon">F</span>FrontDash</Link><span>Good food. Good days. © {new Date().getFullYear()} FrontDash</span><Link to="/customer-registration">Join the table <i className="bi bi-arrow-up-right" /></Link></div></footer>
      <ToastNotification show={toast.show} message={toast.message} type={toast.type} setShow={(show) => setToast((current) => ({ ...current, show }))} />
    </main>
  );
};

export default MainPage;
