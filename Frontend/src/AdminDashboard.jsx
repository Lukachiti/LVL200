import React, { useState, useEffect } from 'react';

function AdminDashboard({ token, onProductAdded, onProductDeleted }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'CPUs',
    
    price: '',
    rating: '5.0',
    image: '',
    tag: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
    setMessage('');

    fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
        rating: parseFloat(formData.rating)
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to add product');
        return data;
      })
      .then((newProduct) => {
        setMessage('✅ Component successfully uploaded to database!');
        setFormData({ name: '', description: '', category: 'CPUs', price: '', rating: '5.0', image: '', tag: '' });
        
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

    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;

    setMessage('');

    fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to delete product');
        return data;
      })
      .then(() => {
        setMessage('🗑️ Component wiped from database successfully.');
        
        // Remove from dashboard view state
        setProducts((prev) => prev.filter((p) => (p._id !== id && p.id !== id)));
        // Remove from main store view state
        if (onProductDeleted) onProductDeleted(product);
      })
      .catch((err) => {
        setMessage(`❌ Delete Error: ${err.message}`);
      });
  };

  return (
    <div style={{position: 'fixed', top: '0', right: '0',  background: '#1c2333', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
      <h2 style={{ color: '#00f2fe', marginBottom: '1.5rem' }}>AMex Inventory Management</h2>

      {message && <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)' }}>{message}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem', marginBottom: '2.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: '#9ca3af' }}>Component Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', background: '#121826', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} placeholder="e.g. NVIDIA RTX 5090 Ti" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#9ca3af' }}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#121826', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
              <option value="CPUs">CPUs</option>
              <option value="GPUs">GPUs</option>
              <option value="Motherboards">Motherboards</option>
              <option value="Cooling">Cooling</option>
              <option value="RAM">RAM</option>
              <option value="Storage">Storage</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#9ca3af' }}>Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#121826', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} placeholder="Enter a brief description of the component..." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#9ca3af' }}>Price ($ USD)</label>
            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', background: '#121826', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} placeholder="999.99" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#9ca3af' }}>Review Score Rating</label>
            <input type="number" step="0.1" max="5" name="rating" value={formData.rating} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#121826', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#9ca3af' }}>Display Tag / Badge</label>
            <input type="text" name="tag" value={formData.tag} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#121826', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} placeholder="e.g. Free Shipping, Promo" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: '#9ca3af' }}>Image Asset URL</label>
          <input type="text" name="image" value={formData.image} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#121826', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} placeholder="https://images.unsplash.com/..." />
        </div>

        <button type="submit" style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', border: 'none', color: '#000', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}>
          Push Product To Storefront Inventory
        </button>
      </form>

      <h3 style={{ color: '#00f2fe', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginBottom: '1rem' }}>📦 Live Stock Items ({products.length})</h3>
      
      {loading ? (
        <p>Retrieving local stock list...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {products.map((product) => (
            <div key={product._id || product.id} style={{ background: '#121826', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', padding: '0.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <img 
                  src={product.image || "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400"} 
                  alt={product.name} 
                  style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} 
                />
                <span style={{ fontSize: '0.75rem', color: '#4facfe', textTransform: 'uppercase', fontWeight: 'bold' }}>{product.category}</span>
                <h4 style={{ margin: '0.2rem 0', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.4rem' }}>{product.name}</h4>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', height: '2.4rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.description || 'No description provided.'}</p>
                <p style={{ margin: '0.4rem 0', fontWeight: 'bold', color: '#00f2fe' }}>${product.price?.toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(product)}
                style={{ width: '100%', padding: '0.4rem', background: '#dc2626', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' }}
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