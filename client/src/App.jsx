import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StoreFront from './components/StoreFront';
import AdminPanel from './components/AdminPanel';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import './App.css';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem('sessionId');
    if (existing) return existing;
    const newId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', newId);
    return newId;
  });

  const updateCartCount = () => {
    fetch(`http://localhost:3001/api/cart/${sessionId}`)
      .then(res => res.json())
      .then(cart => {
        const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      })
      .catch(err => console.error('Error fetching cart:', err));
  };

  useEffect(() => {
    updateCartCount();
  }, [sessionId]);

  return (
    <Router>
      <div className="app">
        <nav className="main-nav">
          <div className="nav-container">
            <Link to="/" className="brand">HOODIE</Link>
            <div className="nav-links">
              <Link to="/">Shop</Link>
              <Link to="/admin">Admin</Link>
              <Link to="/cart" className="cart-link">
                Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<StoreFront sessionId={sessionId} onCartUpdate={updateCartCount} />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/cart" element={<Cart sessionId={sessionId} onCartUpdate={updateCartCount} />} />
          <Route path="/checkout" element={<Checkout sessionId={sessionId} onCartUpdate={updateCartCount} />} />
        </Routes>

        <footer className="main-footer">
          <div className="footer-content">
            <p>&copy; 2026 HOODIE - Premium Pop-Up Fashion</p>
            <p>Limited designs • Exclusive collections • High fashion for all</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
