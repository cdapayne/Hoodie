import { useState, useEffect } from 'react';
import axios from 'axios';
import './StoreFront.css';

const API_URL = 'http://localhost:3001/api';

function StoreFront({ sessionId, onCartUpdate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [shippingDeal, setShippingDeal] = useState(null);

  useEffect(() => {
    fetchProducts();
    checkShippingDeals();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const checkShippingDeals = async () => {
    try {
      const response = await axios.get(`${API_URL}/shipping-deals?total=100`);
      setShippingDeal(response.data);
    } catch (error) {
      console.error('Error fetching shipping deals:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post(`${API_URL}/cart/${sessionId}`, {
        productId,
        quantity: 1
      });
      onCartUpdate();
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.error || 'Error adding to cart');
    }
  };

  const subscribeEmail = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/emails`, { email });
      setEmailSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Error subscribing to newsletter');
    }
  };

  if (loading) {
    return <div className="loading">Loading exclusive collection...</div>;
  }

  return (
    <div className="storefront">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">LIMITED EDITION</h1>
          <p className="hero-subtitle">Exclusive Pop-Up Collection</p>
          <p className="hero-tagline">High fashion, accessible to all</p>
        </div>
      </section>

      {/* Shipping Deal Banner */}
      {shippingDeal && (
        <div className="deal-banner">
          🎉 {shippingDeal.message}
        </div>
      )}

      {/* Product Grid */}
      <section className="products-section">
        <div className="container">
          <h2 className="section-title">Our Collection</h2>
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                {product.isLimited && (
                  <div className="limited-badge">LIMITED EDITION</div>
                )}
                {product.isLowStock && (
                  <div className="stock-alert">⚡ {product.urgencyMessage}</div>
                )}
                <div className="product-image">
                  <div className="placeholder-image">
                    {product.name.charAt(0)}
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <span className="product-stock">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Get exclusive access to new drops and special offers</p>
            {emailSubmitted ? (
              <div className="success">✓ Thank you for subscribing!</div>
            ) : (
              <form onSubmit={subscribeEmail} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="newsletter-input"
                />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default StoreFront;
