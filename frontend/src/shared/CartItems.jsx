// src/components/CartItems.jsx
import React from "react";

const CartItems = ({ cart }) => {
  if (cart.length === 0) return <p>No items in cart.</p>;

  return (
    <ul className="list-group mb-3">
      {cart.map((item, idx) => (
        <li
          key={idx}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          {item.name} (x{item.quantity})
          <span>${(item.price * item.quantity).toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
};

export default CartItems;
