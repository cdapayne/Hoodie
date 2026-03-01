import { useState } from 'react';
import axios from 'axios';
import './OrderTracking.css';

const API_URL = 'http://localhost:3001/api';

function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await axios.get(`${API_URL}/orders/track`, {
        params: { orderNumber, email }
      });
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Order not found. Please check your order number and email.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status.toLowerCase());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-tracking-page">
      <div className="container">
        <div className="tracking-header">
          <h1>Order Status</h1>
          <p>Enter your details to view your order's journey</p>
        </div>

        <div className="tracking-form-container">
          <form onSubmit={handleTrackOrder} className="tracking-form">
            <div className="form-group">
              <label htmlFor="orderNumber">Order Number</label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., ORD-1234567890"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>

        {order && (
          <div className="order-details">
            <div className="order-header">
              <h2>Order #{order.orderNumber}</h2>
              <span className={`status-badge status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div className="order-info">
              <div className="info-row">
                <span className="label">Order Date:</span>
                <span className="value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="info-row">
                <span className="label">Total:</span>
                <span className="value">${order.total.toFixed(2)}</span>
              </div>
              {order.trackingNumber && (
                <div className="info-row">
                  <span className="label">Tracking Number:</span>
                  <span className="value tracking-number">{order.trackingNumber}</span>
                </div>
              )}
            </div>

            <div className="tracking-timeline">
              <h3>Order Status</h3>
              <div className="timeline">
                <div className={`timeline-step ${getStatusStep(order.status) >= 0 ? 'completed' : ''}`}>
                  <div className="step-marker"></div>
                  <div className="step-content">
                    <h4>Order Placed</h4>
                    <p>Your order has been received</p>
                  </div>
                </div>

                <div className={`timeline-step ${getStatusStep(order.status) >= 1 ? 'completed' : ''}`}>
                  <div className="step-marker"></div>
                  <div className="step-content">
                    <h4>Processing</h4>
                    <p>We're preparing your items</p>
                  </div>
                </div>

                <div className={`timeline-step ${getStatusStep(order.status) >= 2 ? 'completed' : ''}`}>
                  <div className="step-marker"></div>
                  <div className="step-content">
                    <h4>Shipped</h4>
                    <p>Your order is on the way</p>
                  </div>
                </div>

                <div className={`timeline-step ${getStatusStep(order.status) >= 3 ? 'completed' : ''}`}>
                  <div className="step-marker"></div>
                  <div className="step-content">
                    <h4>Delivered</h4>
                    <p>Your Maison Hoodie piece has arrived</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-items">
              <h3>Order Items</h3>
              <div className="items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <h4>{item.productName}</h4>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="shipping-address">
              <h3>Shipping Address</h3>
              <p>{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;
