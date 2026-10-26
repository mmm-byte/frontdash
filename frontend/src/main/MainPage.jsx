import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CookingPot, Fish, MapPin, Pizza, Search, Sandwich, X } from "lucide-react";
import RestaurantCard from "../user/RestaurantCard";
import ToastNotification from "../shared/ToastNotification";
import api from "../utils/api";
import { getDemoRestaurants } from "../utils/demoData";
import "../styles/mainpage.css";

const categories = [
  { label: "Pizza", icon: Pizza },
  { label: "Burgers", icon: Sandwich },
  { label: "Sushi", icon: Fish },
  { label: "Tacos", icon: CookingPot },
];

const MainPage = () => {
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "warning" });

  const loadRestaurants = async () => {
    setLoading(true);
    setDemoMode(false);
    try {
      const response = await api.restaurants.getAll("APPROVED");
      if (response?.success && response.data) {
        setRestaurants(response.data.map((restaurant) => ({
          id: restaurant.restaurantID,
          name: restaurant.name,
          address: [restaurant.street, restaurant.city, restaurant.state, restaurant.zip].filter(Boolean).join(", "),
          image: restaurant.pictureUrl || "/images/restaurant-default.jpg",
          tags: Array.isArray(restaurant.tags) ? restaurant.tags : [],
        })));
      } else {
        setRestaurants([]);
      }
    } catch (error) {
      console.error("Failed to load restaurants:", error);
      setRestaurants(getDemoRestaurants());
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => restaurants.filter((restaurant) => {
    const query = search.trim().toLowerCase();
    const searchableText = [
      restaurant.name,
      restaurant.address,
      ...(restaurant.tags || []),
      ...(restaurant.menu || []).map((item) => `${item.name} ${item.category}`),
    ].join(" ").toLowerCase();
    const matchesSearch = !query || searchableText.includes(query);
    const matchesCategory = !selectedCategory
      || (restaurant.tags || []).some((tag) => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  }), [restaurants, search, selectedCategory]);

  const submitSearch = (event) => {
    event.preventDefault();
    document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const showClosedToast = (restaurant) => {
    setToast({ show: true, message: `${restaurant.name} is currently closed. Try again later.`, type: "warning" });
  };

  return (
    <main className="frontdash-page">
      <section className="frontdash-storefront container">
        <div className="frontdash-delivery-location">
          <MapPin size={15} aria-hidden="true" />
          <span>Delivering near</span>
          <strong>Dallas, TX</strong>
        </div>

        <div className="frontdash-storefront-heading">
          <div>
            <span className="frontdash-kicker">LOCAL RESTAURANTS · EASY ORDERING</span>
            <h1>Find something good to eat.</h1>
            <p>Browse nearby menus, choose your meal, and build an order.</p>
          </div>
          <form className="frontdash-search" onSubmit={submitSearch} role="search">
            <Search size={19} aria-hidden="true" />
            <input
              aria-label="Search restaurants, dishes, or cuisines"
              placeholder="Restaurant, dish, or cuisine"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={16} /></button>}
            <button className="frontdash-search-submit" type="submit">Search</button>
          </form>
        </div>
      </section>

      <section className="frontdash-discover container" aria-label="Restaurant categories">
        <div className="frontdash-category-heading">
          <h2>Browse by cuisine</h2>
          {selectedCategory && <button type="button" className="frontdash-clear-filter" onClick={() => setSelectedCategory("")}>Clear filter <X size={14} /></button>}
        </div>
        <div className="frontdash-categories">
          {categories.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`frontdash-category${selectedCategory === label ? " is-active" : ""}`}
              onClick={() => setSelectedCategory((current) => current === label ? "" : label)}
              aria-pressed={selectedCategory === label}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="frontdash-restaurants container" id="restaurants">
        <div className="frontdash-section-heading frontdash-restaurant-heading">
          <div>
            <span className="frontdash-kicker">DALLAS, TEXAS</span>
            <h2>{search ? `Results for “${search}”` : selectedCategory ? `${selectedCategory} near you` : "Restaurants near you"}</h2>
          </div>
          {!loading && <span className="frontdash-result-count">{filteredRestaurants.length} {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"}</span>}
        </div>

        {demoMode && !loading && (
          <div className="frontdash-preview-notice">
            <span>Preview data</span>
            Restaurant listings and menus are sample content. Connect the API for live data and ordering.
          </div>
        )}

        {loading ? (
          <div className="frontdash-loading" role="status"><span className="frontdash-loader" /><span>Loading nearby restaurants…</span></div>
        ) : filteredRestaurants.length ? (
          <div className="row g-4 frontdash-restaurant-grid">
            {filteredRestaurants.map((restaurant) => (
              <div className="col-lg-4 col-md-6" key={restaurant.id}>
                <RestaurantCard restaurant={restaurant} onClosedClick={showClosedToast} />
              </div>
            ))}
          </div>
        ) : (
          <div className="frontdash-empty-state">
            <span className="frontdash-empty-icon"><Search size={20} /></span>
            <h3>{restaurants.length ? "No matching restaurants" : "No restaurants listed yet"}</h3>
            <p>{restaurants.length ? "Try another restaurant, dish, or cuisine." : "Restaurant listings will appear here when they are available."}</p>
            {restaurants.length > 0 && <button type="button" className="frontdash-retry" onClick={() => { setSearch(""); setSelectedCategory(""); }}>Clear filters</button>}
            {restaurants.length === 0 && <button type="button" className="frontdash-retry" onClick={loadRestaurants}>Reload listings</button>}
          </div>
        )}
      </section>

      <section className="frontdash-partner-band">
        <div className="container frontdash-partner-inner">
          <div><span className="frontdash-kicker">FOR RESTAURANTS</span><h2>Bring your menu online.</h2><p>Manage dishes, operating hours, and incoming orders.</p></div>
          <Link to="/restaurant-registration" className="frontdash-partner-link">Register your restaurant <ArrowUpRight size={16} /></Link>
        </div>
      </section>

      <footer className="frontdash-footer">
        <div className="container">
          <Link to="/" className="frontdash-footer-brand"><span className="frontdash-brand-icon">F</span>FrontDash</Link>
          <span>Restaurant ordering platform · Portfolio demo · © {new Date().getFullYear()}</span>
          <Link to="/customer-registration">Create an account <ArrowUpRight size={13} /></Link>
        </div>
      </footer>
      <ToastNotification show={toast.show} message={toast.message} type={toast.type} setShow={(show) => setToast((current) => ({ ...current, show }))} />
    </main>
  );
};

export default MainPage;
