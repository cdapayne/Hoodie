import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css';

const API_URL = 'http://localhost:3001/api';

function Checkout({ sessionId, onCartUpdate }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('square');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [sessionId]);

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

  const calculateTotal = () => {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 10;
    return subtotal + shipping;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setProcessing(true);

    try {
      const total = calculateTotal();
      let response;

      if (paymentMethod === 'square') {
        // In production, this would get a payment nonce from Square's payment form
        response = await axios.post(`${API_URL}/payment/square`, {
          amount: total,
          nonce: 'mock-square-nonce',
          sessionId
        });
      } else {
        // In production, this would use PayPal's SDK
        response = await axios.post(`${API_URL}/payment/paypal`, {
          amount: total,
          orderId: 'PAYPAL-' + Date.now(),
          sessionId
        });
      }

      if (response.data.success) {
        // Subscribe email
        await axios.post(`${API_URL}/emails`, { email });
        
        setOrderId(response.data.orderId);
        setOrderComplete(true);
        onCartUpdate();
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
          <h2>Order Confirmed!</h2>
          <p>Thank you for your purchase!</p>
          <p className="order-id">Order ID: {orderId}</p>
          <p className="confirmation-message">
            A confirmation email has been sent to {email}
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 10;
  const total = calculateTotal();

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handlePayment}>
              <h2>Contact Information</h2>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <h2 className="mt-4">Payment Method</h2>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    value="square"
                    checked={paymentMethod === 'square'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Credit Card (Square)</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>PayPal</span>
                </label>
              </div>

              {paymentMethod === 'square' && (
                <div className="payment-info">
                  <p className="info-text">
                    💳 In production, a secure Square payment form would appear here
                  </p>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="payment-info">
                  <p className="info-text">
                    💰 In production, PayPal checkout buttons would appear here
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-large"
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.items.map(item => (
                <div key={item.productId} className="summary-item">
                  <span>{item.name} × {item.quantity}</span>
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
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
