import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TrustBadges from './TrustBadges';
import './Checkout.css';

const API_URL = 'http://localhost:3001/api';

function Checkout({ sessionId, onCartUpdate }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('square');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  useEffect(() => {
    fetchCart();
  }, [sessionId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart/${sessionId}`);
      setCart(response.data);
      if (response.data.items.length === 0) {
        navigate('/cart');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;

  const handlePayment = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (!form.firstName || !form.lastName || !form.address || !form.city || !form.state || !form.zip) {
      alert('Please fill in all required shipping fields');
      return;
    }

    setProcessing(true);

    try {
      let response;

      if (paymentMethod === 'square') {
        response = await axios.post(`${API_URL}/payment/square`, {
          amount: total,
          nonce: 'mock-square-nonce',
          sessionId,
          shippingAddress: form
        });
      } else {
        response = await axios.post(`${API_URL}/payment/paypal`, {
          amount: total,
          orderId: 'PAYPAL-' + Date.now(),
          sessionId,
          shippingAddress: form
        });
      }

      if (response.data.success) {
        await axios.post(`${API_URL}/emails`, { email: form.email });
        
        setOrderId(response.data.orderId);
        setOrderNumber(response.data.orderNumber || response.data.orderId.slice(0, 8).toUpperCase());
        setOrderComplete(true);
        onCartUpdate();
        // Clear abandoned cart tracking
        localStorage.removeItem('lastCartUpdate');
        localStorage.removeItem('abandonedCartDismissed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading checkout...</div>;
  }

  if (orderComplete) {
    return (
      <div className="container">
        <div className="order-complete">
          <div className="success-icon">✓</div>
          <h2>Order Confirmed</h2>
          <p>Thank you for choosing Maison Hoodie, {form.firstName}.</p>
          <p className="order-id">Order #{orderNumber}</p>
          <p className="confirmation-message">
            A confirmation email has been sent to <strong>{form.email}</strong>
          </p>
          <div className="order-next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>You will receive a confirmation email shortly</li>
              <li>Your order will be carefully packaged within 1–2 business days</li>
              <li>Tracking details will be sent to your email</li>
            </ul>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Continue Exploring
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>
        <div className="checkout-progress">
          <span className="progress-step active">1. Information</span>
          <span className="progress-divider">→</span>
          <span className="progress-step">2. Payment</span>
          <span className="progress-divider">→</span>
          <span className="progress-step">3. Confirmation</span>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handlePayment}>
              <h2>Contact Information</h2>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
              </div>

              <h2 className="mt-4">Shipping Address</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Address *</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} required placeholder="123 Main St" />
              </div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input type="text" name="state" value={form.state} onChange={handleChange} required placeholder="CA" />
                </div>
                <div className="form-group">
                  <label>ZIP *</label>
                  <input type="text" name="zip" value={form.zip} onChange={handleChange} required placeholder="90210" />
                </div>
              </div>
              <div className="form-group">
                <label>Phone (Optional)</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" />
              </div>

              <h2 className="mt-4">Payment Method</h2>
              <div className="payment-methods">
                <label className="payment-option">
                  <input type="radio" value="square" checked={paymentMethod === 'square'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span>💳 Credit Card (Square)</span>
                </label>
                <label className="payment-option">
                  <input type="radio" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span>💰 PayPal</span>
                </label>
              </div>

              <div className="payment-info">
                <p className="info-text">
                  {paymentMethod === 'square' 
                    ? '💳 In production, a secure Square payment form would appear here'
                    : '💰 In production, PayPal checkout buttons would appear here'}
                </p>
              </div>

              <button type="submit" className="btn btn-primary btn-large" disabled={processing}>
                {processing ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
              </button>

              <div className="checkout-guarantees">
                <span>Secure Payment</span>
                <span>30-Day Returns</span>
                <span>Concierge Support</span>
              </div>
            </form>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.items.map(item => (
                <div key={item.productId} className="summary-item">
                  <div className="summary-item-info">
                    {(item.featuredImage || item.imageUrl) && (
                      <img src={item.featuredImage || item.imageUrl} alt={item.name} className="summary-item-img" />
                    )}
                    <div>
                      <span className="summary-item-name">{item.name}</span>
                      <span className="summary-item-qty">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{shipping === 0 ? <span className="free-tag">FREE</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <TrustBadges variant="mini" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
