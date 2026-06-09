import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard({ token, onProductAdded, onProductDeleted }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "CPUs",
    price: "",
    rating: "5.0",
    image: "",
    tag: "",
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch failure:", err);
        setLoading(false);
      });
  };

  // Automatically load the inventory view when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
        rating: parseFloat(formData.rating),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to add product");
        return data;
      })
      .then((newProduct) => {
        setMessage("✅ Component successfully uploaded to database!");
        setFormData({
          name: "",
          description: "",
          category: "CPUs",
          price: "",
          rating: "5.0",
          image: "",
          tag: "",
        });

        // Update dashboard view state
        setProducts((prev) => [newProduct, ...prev]);
        // Update main store state
        if (onProductAdded) onProductAdded(newProduct);
      })
      .catch((err) => {
        setMessage(`❌ Error: ${err.message}`);
      });
  };

  const handleDelete = (product) => {
    const id = product._id || product.id;
    if (!id) return;

    if (!window.confirm(`Are you sure you want to delete ${product.name}?`))
      return;

    setMessage("");

    fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to delete product");
        return data;
      })
      .then(() => {
        setMessage("Component wiped from database successfully.");

        // Remove from dashboard view state
        setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
        // Remove from main store view state
        if (onProductDeleted) onProductDeleted(product);
      })
      .catch((err) => {
        setMessage(`❌ Delete Error: ${err.message}`);
      });
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2 className="admin-title">AMex Inventory Management</h2>
        <Link to="/" className="admin-back-btn">
          ← Back to Store
        </Link>
      </div>

      {message && <div className="admin-message">{message}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label className="form-label">Component Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g. NVIDIA RTX 5090 Ti"
          />
        </div>

        <div className="form-grid-2x2">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
            >
              <option value="CPUs">CPUs</option>
              <option value="GPUs">GPUs</option>
              <option value="Motherboards">Motherboards</option>
              <option value="Cooling">Cooling</option>
              <option value="RAM">RAM</option>
              <option value="Storage">Storage</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter a brief description..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Price ($ USD)</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="999.99"
            />
          </div>
        </div>

        <div className="form-grid-2x2">
          <div className="form-group">
            <label className="form-label">Review Score Rating</label>
            <input
              type="number"
              step="0.1"
              max="5"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Display Tag / Badge</label>
            <input
              type="text"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. Free Shipping, Promo"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Image Asset URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="form-input"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <button type="submit" className="admin-submit-btn">
          Push Product To Storefront Inventory
        </button>
      </form>

      <h3 className="inventory-section-title">
        Live Stock Items ({products.length})
      </h3>

      {loading ? (
        <p className="loading-text">Retrieving local stock list...</p>
      ) : (
        <div className="inventory-grid">
          {products.map((product) => (
            <div key={product._id || product.id} className="inventory-card">
              <div>
                <img
                  src={
                    product.image ||
                    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400"
                  }
                  alt={product.name}
                  className="inventory-card-image"
                />
                <span className="inventory-card-category">
                  {product.category}
                </span>
                <h4 className="inventory-card-name">{product.name}</h4>
                <p className="inventory-card-description">
                  {product.description || "No description provided."}
                </p>
                <p className="inventory-card-price">
                  ${product.price?.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(product)}
                className="inventory-delete-btn"
              >
                Delete Asset
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
