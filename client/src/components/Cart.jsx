import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TrustBadges from './TrustBadges';
import './Cart.css';

const API_URL = 'http://localhost:3001/api';
const FREE_SHIPPING_THRESHOLD = 100;

function Cart({ sessionId, onCartUpdate }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [shippingDeal, setShippingDeal] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    fetchProducts();
  }, [sessionId]);

  useEffect(() => {
    if (cart.items.length > 0) {
      checkShippingDeals();
    }
  }, [cart]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart/${sessionId}`);
      setCart(response.data);
      setLoading(false);
      // Track cart activity for abandoned cart recovery
      if (response.data.items && response.data.items.length > 0) {
        localStorage.setItem('lastCartUpdate', Date.now().toString());
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) { /* ignore */ }
  };

  const checkShippingDeals = async () => {
    const total = calculateSubtotal();
    try {
      const response = await axios.get(`${API_URL}/shipping-deals?total=${total}`);
      setShippingDeal(response.data);
    } catch (error) { /* ignore */ }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`${API_URL}/cart/${sessionId}/item/${productId}`);
      fetchCart();
      onCartUpdate();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`${API_URL}/cart/${sessionId}/item/${productId}`, { quantity: newQuantity });
      fetchCart();
      onCartUpdate();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const applyPromoCode = async () => {
    setPromoError('');
    try {
      const response = await axios.post(`${API_URL}/promo/validate`, { code: promoCode });
      setAppliedPromo(response.data);
    } catch (error) {
      setPromoError(error.response?.data?.error || 'Invalid promo code');
      setAppliedPromo(null);
    }
  };

  const calculateSubtotal = () => cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    const sub = calculateSubtotal();
    return appliedPromo.type === 'percentage' ? sub * (appliedPromo.value / 100) : Math.min(appliedPromo.value, sub);
  };

  const getShippingCost = () => {
    const sub = calculateSubtotal();
    if (sub >= FREE_SHIPPING_THRESHOLD) return 0;
    if (shippingDeal && shippingDeal.discount > 0) return Math.max(0, 10 - shippingDeal.discount);
    return 10;
  };

  const getRecommendedProducts = () => {
    const ids = cart.items.map(i => i.productId);
    return products.filter(p => !ids.includes(p.id) && p.stock > 0).slice(0, 3);
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <div className="empty-cart-icon">—</div>
          <h2>Your Bag is Empty</h2>
          <p>Discover our curated collection of luxury pieces.</p>
          <Link to="/" className="btn btn-primary">Explore Collection</Link>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const shippingCost = getShippingCost();
  const total = subtotal - discount + shippingCost;
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const recommended = getRecommendedProducts();

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Bag ({cart.items.length} {cart.items.length === 1 ? 'piece' : 'pieces'})</h1>

        {/* Free Shipping Progress Bar */}
        <div className="shipping-progress-container">
          {subtotal >= FREE_SHIPPING_THRESHOLD ? (
            <p className="shipping-progress-text shipping-unlocked">✓ You've unlocked <strong>complimentary shipping</strong></p>
          ) : (
            <p className="shipping-progress-text">Add <strong>${amountToFreeShipping.toFixed(2)}</strong> more for <strong>complimentary shipping</strong></p>
          )}
          <div className="shipping-progress-bar">
            <div className="shipping-progress-fill" style={{ width: `${shippingProgress}%` }} />
          </div>
          <div className="shipping-progress-labels">
            <span>$0</span>
            <span>$100 — Complimentary Shipping</span>
          </div>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="item-image" onClick={() => navigate(`/product/${item.productId}`)} style={{cursor:'pointer'}}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="placeholder-image">{item.name.charAt(0)}</div>
                  )}
                </div>
                <div className="item-details">
                  <h3 onClick={() => navigate(`/product/${item.productId}`)} style={{cursor:'pointer'}}>{item.name}</h3>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div className="item-total">
                  <p className="total-price">${(item.price * item.quantity).toFixed(2)}</p>
                  <button className="btn-remove" onClick={() => removeItem(item.productId)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>

            {/* Promo Code */}
            <div className="promo-code-section">
              <div className="promo-input-row">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="promo-input"
                />
                <button className="btn promo-apply" onClick={applyPromoCode}>Apply</button>
              </div>
              {promoError && <p className="promo-error">{promoError}</p>}
              {appliedPromo && (
                <p className="promo-success">✓ {appliedPromo.code} — {appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : `$${appliedPromo.value}`} off!</p>
              )}
            </div>

            <div className="summary-row"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
            {appliedPromo && (
              <div className="summary-row discount-row"><span>Discount ({appliedPromo.code}):</span><span>-${discount.toFixed(2)}</span></div>
            )}
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{shippingCost === 0 ? <span className="free-shipping-tag">FREE</span> : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total-row"><span>Total:</span><span>${total.toFixed(2)}</span></div>

            <button className="btn btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>

            <TrustBadges variant="mini" />

            <Link to="/" className="continue-shopping">← Continue Shopping</Link>
          </div>
        </div>

        {/* Recommended Products */}
        {recommended.length > 0 && (
          <div className="cart-recommendations">
            <h3>You May Also Appreciate</h3>
            <div className="rec-grid">
              {recommended.map(product => (
                <div key={product.id} className="rec-card" onClick={() => navigate(`/product/${product.id}`)}>
                  <div className="rec-image">
                    {product.featuredImage || product.imageUrl ? (
                      <img src={product.featuredImage || product.imageUrl} alt={product.name} />
                    ) : (
                      <div className="placeholder-image">{product.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="rec-info">
                    <p className="rec-name">{product.name}</p>
                    <p className="rec-price">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
