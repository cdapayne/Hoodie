import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CountdownTimer from './CountdownTimer';
import TrustBadges from './TrustBadges';
import './StoreFront.css';

const API_URL = 'http://localhost:3001/api';

function StoreFront({ sessionId, onCartUpdate }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [shippingDeal, setShippingDeal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [addedToCart, setAddedToCart] = useState(null);
  const [hero, setHero] = useState({
    eyebrow: 'Nouvelle Collection',
    title: 'MAISON HOODIE',
    subtitle: 'Curated Luxury Streetwear',
    tagline: 'Where haute couture meets urban artistry. Each piece, a numbered edition.',
    ctaText: 'Explore the Collection',
    ctaLink: '#products'
  });
  const [countdownLabel, setCountdownLabel] = useState('Exclusive Access Ends In');

  useEffect(() => {
    fetchProducts();
    checkShippingDeals();
    fetchMarketing();
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
    } catch (error) { /* ignore */ }
  };

  const fetchMarketing = async () => {
    try {
      const response = await axios.get(`${API_URL}/marketing`);
      if (response.data.hero) {
        setHero(response.data.hero);
      }
      if (response.data.countdownTimer?.label) {
        setCountdownLabel(response.data.countdownTimer.label);
      }
    } catch (error) { /* ignore */ }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post(`${API_URL}/cart/${sessionId}`, {
        productId,
        quantity: 1
      });
      onCartUpdate();
      setAddedToCart(productId);
      setTimeout(() => setAddedToCart(null), 2000);
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
      alert('Error subscribing to newsletter');
    }
  };

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return ['all', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stock':
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      default:
        // featured = limited edition first
        filtered.sort((a, b) => (b.isLimited ? 1 : 0) - (a.isLimited ? 1 : 0));
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="loading-skeleton">
        <div className="skeleton-hero" />
        <div className="container">
          <div className="skeleton-grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card"><div className="skeleton-img" /><div className="skeleton-text" /><div className="skeleton-text short" /></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="storefront">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">{hero.eyebrow}</span>
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          <p className="hero-tagline">{hero.tagline}</p>
          <a href={hero.ctaLink} className="btn btn-hero">{hero.ctaText}</a>
        </div>
      </section>

      {/* Countdown Timer */}
      <CountdownTimer label={countdownLabel} />

      {/* Shipping Deal Banner */}
      {shippingDeal && (
        <div className="deal-banner">
          {shippingDeal.message}
        </div>
      )}

      {/* Trust Badges */}
      <TrustBadges />

      {/* Product Grid */}
      <section className="products-section" id="products">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Curated Selection</span>
            <h2 className="section-title">The Collection</h2>
            <div className="section-divider"></div>
          </div>

          {/* Search & Filters */}
          <div className="shop-controls">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>
            <div className="filter-controls">
              <div className="category-filters">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A–Z</option>
                <option value="stock">Low Stock First</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-results">
              <p>No products found matching "{searchQuery}"</p>
              <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>Clear Filters</button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  {product.isLimited && <div className="limited-badge">Édition Limitée</div>}
                  {product.isLowStock && <div className="stock-alert">{product.urgencyMessage}</div>}
                  <div className="product-viewers">
                    {Math.floor(Math.random() * 20) + 5} viewing now
                  </div>
                  <div className="product-image" onClick={() => navigate(`/product/${product.id}`)} style={{cursor: 'pointer'}}>
                    {product.featuredImage || product.imageUrl ? (
                      <img src={product.featuredImage || product.imageUrl} alt={product.name} />
                    ) : (
                      <div className="placeholder-image">{product.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name" onClick={() => navigate(`/product/${product.id}`)} style={{cursor: 'pointer'}}>
                      {product.name}
                    </h3>
                    <p className="product-description">{product.description}</p>
                    {product.reviews && product.reviews.length > 0 && (
                      <div className="product-rating">
                        {'★'.repeat(Math.round(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length))}
                        {'☆'.repeat(5 - Math.round(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length))}
                        <span>({product.reviews.length})</span>
                      </div>
                    )}
                    <div className="product-footer">
                      <span className="product-price">${product.price.toFixed(2)}</span>
                      <span className={`product-stock ${product.isLowStock ? 'low-stock' : ''}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="product-actions">
                      <button
                        className={`btn btn-primary ${addedToCart === product.id ? 'btn-added' : ''}`}
                        onClick={() => addToCart(product.id)}
                        disabled={product.stock === 0}
                      >
                        {addedToCart === product.id ? '✓ Added!' : product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => navigate(`/product/${product.id}`)}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <span className="newsletter-eyebrow">Insider Access</span>
            <h2>Join the Maison</h2>
            <p>Be the first to discover new collections, private events, and exclusive offers reserved for our inner circle.</p>
            {emailSubmitted ? (
              <div className="success">✓ Welcome to the Maison. Your exclusive access code awaits in your inbox.</div>
            ) : (
              <form onSubmit={subscribeEmail} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="newsletter-input"
                />
                <button type="submit" className="btn btn-primary">
                  Request Access
                </button>
              </form>
            )}
            <p className="newsletter-disclaimer">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StoreFront;
