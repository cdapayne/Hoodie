import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';

const API_URL = 'http://localhost:3001/api';

function Cart({ sessionId, onCartUpdate }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [shippingDeal, setShippingDeal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
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
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  const checkShippingDeals = async () => {
    const total = calculateTotal();
    try {
      const response = await axios.get(`${API_URL}/shipping-deals?total=${total}`);
      setShippingDeal(response.data);
    } catch (error) {
      console.error('Error fetching shipping deals:', error);
    }
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

  const calculateSubtotal = () => {
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingCost = shippingDeal ? Math.max(0, 10 - shippingDeal.discount) : 10;
    return subtotal + shippingCost;
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Add some items from our collection!</p>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const shippingCost = shippingDeal ? Math.max(0, 10 - shippingDeal.discount) : 10;
  const total = calculateTotal();

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Your Cart</h1>
        
        {shippingDeal && (
          <div className="shipping-deal-banner">
            🎉 {shippingDeal.message}
          </div>
        )}

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="item-image">
                  <div className="placeholder-image">{item.name.charAt(0)}</div>
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                </div>
                <div className="item-total">
                  <p className="total-price">${(item.price * item.quantity).toFixed(2)}</p>
                  <button 
                    className="btn-remove"
                    onClick={() => removeItem(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>
                {shippingDeal && shippingDeal.discount > 0 ? (
                  <>
                    <span className="original-price">${10.toFixed(2)}</span>
                    ${shippingCost.toFixed(2)}
                  </>
                ) : (
                  `$${shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="summary-row total-row">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
            <Link to="/" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
