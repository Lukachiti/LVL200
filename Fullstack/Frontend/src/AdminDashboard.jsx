import React, { useState } from 'react';

function AdminDashboard({ token, onProductAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'CPUs',
    price: '',
    rating: '5.0',
    image: '',
    tag: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Secure token header passed here
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
        setFormData({ name: '', category: 'CPUs', price: '', rating: '5.0', image: '', tag: '' });
        if (onProductAdded) onProductAdded(newProduct);
      })
      .catch((err) => {
        setMessage(`❌ Error: ${err.message}`);
      });
  };

  return (
    <div style={{ background: '#1c2333', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', marginTop: '2rem' }}>
      <h2 style={{ color: '#00f2fe', marginBottom: '1.5rem' }}>🔧 AMEX Inventory Management System</h2>
      
      {message && <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)' }}>{message}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
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
    </div>
  );
}

export default AdminDashboard;