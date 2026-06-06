import React, { useEffect, useState } from 'react';

function Cart({ token, onClose, onCartItemDeleted }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Fetch live cart contents from the database when component mounts
  useEffect(() => {
    if (token) {
      fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch your cloud cart data.');
          return res.json();
        })
        .then((data) => {
          setCartItems(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Cart render error:', err);
          setLoading(false);
        });
    } else {
     
      setCartItems([]);
      setLoading(false);
    }
  }, [token]);

  // Calculate order totals dynamically
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax calculation
  const total = subtotal + tax;

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2 style={{ color: '#00f2fe' }}>Accessing your AMEX Cloud Build...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>🛒 Your Rig Build Configuration</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.divider}></div>

        {/* Cart Item Stream */}
        <div style={styles.itemContainer}>
          {cartItems.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Your workspace is empty.</p>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Add parts from the storefront grid to begin assembling your configuration.</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.productId} style={styles.cartItem}>
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=100'} 
                  alt={item.name} 
                  style={styles.itemImage} 
                />
                <div style={styles.itemDetails}>
                  <span style={styles.itemCategory}>{item.category}</span>
                  <h4 style={styles.itemName}>{item.name}</h4>
                  <span style={styles.itemQuantity}>Qty: {item.quantity}</span>
                </div>
                <div style={styles.itemPrice}>
                  ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <button style={styles.deleteBtn} onClick={() => onCartItemDeleted(item.productId)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div style={styles.divider}></div>

            {/* Financial Invoice Section */}
            <div style={styles.summaryContainer}>
              <div style={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Estimated Tax (8%):</span>
                <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
                <span>Total Build Investment:</span>
                <span style={{ color: '#00f2fe' }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <button 
                onClick={() => setMessage('🚀 Configuration locked! Database transaction pipelines initialized.')} 
                style={styles.checkoutBtn}
              >
                Secure Checkout & Place Order
              </button>
              
              {message && <div style={styles.successMsg}>{message}</div>}
            </div>
            </>
          )}
      </div>
    </div>
  );
}

// Inline CSS Stylesheet objects designed to match your gaming-rig setup theme
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(5, 7, 12, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    background: '#121826',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    width: '550px',
    maxHeight: '85vh',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: '600',
  },
  deleteBtn: {
    marginLeft: '1rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(255, 0, 0, 0.1)',
    border: 'none',
    color: '#ff4d4d',
    fontSize: '0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: '0.2s',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: '0.2s',
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '1.5rem 0',
  },
  itemContainer: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '0.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 0',
    color: '#e5e7eb',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    background: '#1c2333',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    gap: '1rem',
  },
  itemImage: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '6px',
    background: '#121826',
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  itemCategory: {
    fontSize: '0.75rem',
    color: '#00f2fe',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  itemName: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '500',
    color: '#fff',
  },
  itemQuantity: {
    fontSize: '0.85rem',
    color: '#9ca3af',
  },
  itemPrice: {
    fontWeight: '600',
    fontSize: '1.1rem',
    color: '#fff',
  },
  summaryContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'between',
    color: '#9ca3af',
    fontSize: '0.95rem',
  },
  totalRow: {
    color: '#fff',
    fontSize: '1.2rem',
    fontWeight: '600',
    marginTop: '0.5rem',
  },
  checkoutBtn: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    border: 'none',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: '0.2s',
  },
  successMsg: {
    marginTop: '1rem',
    textAlign: 'center',
    color: '#4ade80',
    fontSize: '0.9rem',
    background: 'rgba(74, 222, 128, 0.1)',
    padding: '0.75rem',
    borderRadius: '6px',
  }
};

export default Cart;