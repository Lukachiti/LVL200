import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./cart.css";

function Cart({ token, onCartItemDeleted }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch live cart contents from the database when component mounts
  useEffect(() => {
    if (token) {
      fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch your cloud cart data.");
          return res.json();
        })
        .then((data) => {
          setCartItems(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Cart render error:", err);
          setLoading(false);
        });
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [token]);

  // Calculate order totals dynamically
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08; // 8% tax calculation
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="cart-loading">
        <h2>Accessing your AMEX Cloud Build...</h2>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      {/* Header */}
      <div className="cart-header">
        <h2 className="cart-title">🛒 Your Rig Build Configuration</h2>
        <Link to="/" className="cart-close-btn">
          ✕
        </Link>
      </div>

      <div className="cart-divider"></div>

      {/* Cart Item Stream */}
      <div className="cart-item-container">
        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <p>Your workspace is empty.</p>
            <span className="cart-empty-subtitle">
              Add parts from the storefront grid to begin assembling your
              configuration.
            </span>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.productId} className="cart-item">
              <img
                src={
                  item.image ||
                  "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=100"
                }
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <span className="cart-item-category">{item.category}</span>
                <h4 className="cart-item-name">{item.name}</h4>
                <span className="cart-item-quantity">Qty: {item.quantity}</span>
              </div>
              <div className="cart-item-price-block">
                <span className="cart-item-price">
                  $
                  {(item.price * item.quantity).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <button
                  className="cart-delete-btn"
                  onClick={() => onCartItemDeleted(item.productId)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <>
          <div className="cart-divider"></div>

          {/* Financial Invoice Section */}
          <div className="cart-summary-container">
            <div className="cart-summary-row">
              <span>Subtotal:</span>
              <span>
                $
                {subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="cart-summary-row">
              <span>Estimated Tax (8%):</span>
              <span>
                ${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="cart-summary-row cart-total-row">
              <span>Total Build Investment:</span>
              <span className="cart-accent-total">
                $
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <button
              onClick={() =>
                setMessage(
                  "🚀 Configuration locked! Database transaction pipelines initialized.",
                )
              }
              className="cart-checkout-btn"
            >
              Secure Checkout & Place Order
            </button>

            {message && <div className="cart-success-msg">{message}</div>}
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;