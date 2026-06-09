import React, { useState, useEffect } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";
import Cart from "./Cart";
import AuthModal from "./AuthModal";
import { Link } from "react-router-dom";
const CATEGORIES = [
  "All",
  "CPUs",
  "GPUs",
  "Motherboards",
  "Cooling",
  "RAM",
  "Storage",
];

function App() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
 
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authFormData, setAuthFormData] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false,
  });
  const [authError, setAuthError] = useState("");

  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  if (showAuthModal) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch failure:");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) {
      fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setCartItems(data);
        })
        .catch((err) => console.error("Error loading saved cart:", err));
    } else {
      setCartItems([]);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleProductDeleted = (deletedProduct) => {
    setProducts((prev) =>
      prev.filter(
        (p) => p._id !== deletedProduct._id && p.id !== deletedProduct.id,
      ),
    );
  };
  const handleCartItemDeleted = (deletedProductId) => {
    setCartItems((prev) =>
      prev.filter((item) => item.productId !== deletedProductId),
    );
  };

  const handleAddToCart = (product) => {
    if (!user || !token) {
      setAuthError(
        "Please create an account or sign in to save hardware items to your build profile!",
      );
      setShowAuthModal(true);
      return;
    }

    fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product._id || product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not back up cart to cloud storage");
        return res.json();
      })
      .then((updatedCart) => {
        setCartItems(updatedCart.items);
      })
      .catch((err) => console.error("Cart sync error:", err));
  };
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    
  };

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  if (loading) {
    return (
      <div className="global-loading-screen">
        <h2>Syncing with secure core database...</h2>
      </div>
    );
  }

  return (
    <div className="store-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">
          {/* Clicking the logo will now take the user back to the homepage */}
          <Link to="/" className="logo-link">
            <h1 className="logo-text">Amex</h1>
          </Link>
        </div>

        <div className="nav-links">
          <a href="#support" className="nav-link">
            Support
          </a>

          {user ? (
            <span
              className="nav-link nav-link-highlight"
              onClick={handleLogout}
            >
              Logout ({user.username})
            </span>
          ) : (
            /* Keep this as a modal trigger since an auth popup works great on any page */
            <span
              className="nav-link clickable-link"
              onClick={() => setShowAuthModal(true)}
            >
              Account
            </span>
          )}

          <a href="#brands" className="nav-link">
            Brands
          </a>

          {/* Dedicated page link for the shopping cart */}
          <Link to="/cart" className="nav-link">
            Cart ({totalCartCount})
          </Link>

          {/* Dedicated page link for the admin inventory panel */}
          {user?.isAdmin && (
            <Link to="/admin" className="nav-link nav-link-admin">
              Admin Panels
            </Link>
          )}
        </div>
      </nav>
      {/* Authentication Modal Overlay */}
      {showAuthModal && (
        <AuthModal
          isRegisterMode={isRegisterMode}
          setIsRegisterMode={setIsRegisterMode}
          authFormData={authFormData}
          setAuthFormData={setAuthFormData}
          setToken={setToken}
          setUser={setUser}
          setShowAuthModal={setShowAuthModal}
          setAuthError={setAuthError}
        />
      )}

      

      {/* Hero Banner Section */}
      <header className="hero-banner">
        <div className="hero-content">
          <span className="hero-tag">Next-Gen Performance</span>
          <h1>EMPOWER YOUR ULTIMATE RIG</h1>
          <p>
            Equip your battle station with top-tier components at unbeatable
            prices. Ultimate reliability, lightning speed.
          </p>
          <div className="hero-buttons">
            {/* Change your Explore Deals button to this: */}
            <button
              onClick={() => {
                document
                  .querySelector(".categories-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-primary"
            >
              Explore Deals
            </button>
          </div>
        </div>
      </header>

      {/* Categories Toolbar Selection */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Browse by Component</h2>
          <div className="divider"></div>
        </div>
        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid Renderer */}
      <main className="products-grid-container">
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product._id || product.id} className="product-card">
              <div className="product-image-wrapper">
                {product.tag && (
                  <span className="product-badge">{product.tag}</span>
                )}
                <img
                  src={
                    product.image ||
                    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400"
                  }
                  alt={product.name}
                  className="product-image"
                />
              </div>
              <div className="product-info">
                <span className="product-cat">{product.category}</span>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                  <span className="product-rating">
                    ⭐ {product.rating || "5.0"}
                  </span>
                  <span
                    className="product-price"
                    style={{
                      color: product.tag ? "#4CAF50" : "#ffffff",
                      fontWeight: "bold",
                    }}
                  >
                    ${product.price?.toLocaleString()}
                  </span>
                </div>
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Build
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="store-footer">
        <p>&copy; 2026 AMEX HARDWARE. Built for Enthusiasts.</p>
      </footer>
    </div>
  );
}

export default App;
