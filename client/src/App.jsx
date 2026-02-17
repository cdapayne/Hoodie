import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import StoreFront from './components/StoreFront';
import AdminPanel from './components/AdminPanel';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import ProductPage from './components/ProductPage';
import FAQ from './components/FAQ';
import OrderTracking from './components/OrderTracking';
import Unsubscribe from './components/Unsubscribe';
import AnnouncementBar from './components/AnnouncementBar';
import SocialProofToast from './components/SocialProofToast';
import WelcomePopup from './components/WelcomePopup';
import CookieConsent from './components/CookieConsent';
import AbandonedCartModal from './components/AbandonedCartModal';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem('sessionId');
    if (existing) return existing;
    const newId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', newId);
    return newId;
  });

  const updateCartCount = () => {
    fetch(`${API_URL}/cart/${sessionId}`)
      .then(res => res.json())
      .then(cart => {
        const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      })
      .catch(err => console.error('Error fetching cart:', err));
  };

  useEffect(() => {
    updateCartCount();
    // Fetch products for SocialProofToast
    axios.get(`${API_URL}/products`)
      .then(res => setProducts(res.data))
      .catch(() => {});
  }, [sessionId]);

  return (
    <Router>
      <div className="app">
        {/* Announcement Bar - top of page */}
        <AnnouncementBar />

        <nav className="main-nav">
          <div className="nav-container">
            <Link to="/" className="brand">MAISON HOODIE</Link>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
            <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
              <Link to="/track-order" onClick={() => setMobileMenuOpen(false)}>Track Order</Link>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
              <Link to="/cart" className="cart-link" onClick={() => setMobileMenuOpen(false)}>
                Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<StoreFront sessionId={sessionId} onCartUpdate={updateCartCount} />} />
          <Route path="/product/:productId" element={<ProductPage sessionId={sessionId} onCartUpdate={updateCartCount} />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/track-order" element={<OrderTracking />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/cart" element={<Cart sessionId={sessionId} onCartUpdate={updateCartCount} />} />
          <Route path="/checkout" element={<Checkout sessionId={sessionId} onCartUpdate={updateCartCount} />} />
        </Routes>

        <footer className="main-footer">
          <div className="footer-content">
            <div className="footer-brand">MAISON HOODIE</div>
            <p className="footer-tagline">Curated Luxury Streetwear</p>
            <div className="footer-grid">
              <div className="footer-col">
                <h4>Collections</h4>
                <Link to="/">All Collections</Link>
                <Link to="/faq">Maison FAQ</Link>
              </div>
              <div className="footer-col">
                <h4>Client Services</h4>
                <Link to="/track-order">Order Tracking</Link>
                <Link to="/unsubscribe">Communication Preferences</Link>
              </div>
              <div className="footer-col">
                <h4>La Maison</h4>
                <span>Luxury Streetwear Atelier</span>
                <span>Limited Editions · Exclusive Designs</span>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} MAISON HOODIE — All Rights Reserved</p>
              <div className="footer-payment-icons">
                <span>Visa</span>
                <span>Mastercard</span>
                <span>American Express</span>
                <span>PayPal</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Global overlays & toasts */}
        {products.length > 0 && <SocialProofToast products={products} />}
        <WelcomePopup />
        <CookieConsent />
        <AbandonedCartModal sessionId={sessionId} />
      </div>
    </Router>
  );
}

export default App;
