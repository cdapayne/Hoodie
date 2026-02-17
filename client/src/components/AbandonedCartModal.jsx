import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AbandonedCartModal.css';

function AbandonedCartModal({ sessionId }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Check for abandoned cart after 60 seconds of inactivity on a non-cart page
    const checkAbandonedCart = () => {
      const lastCartUpdate = localStorage.getItem('lastCartUpdate');
      const dismissed = localStorage.getItem('abandonedCartDismissed');
      const currentPath = window.location.pathname;

      // Don't show on cart or checkout pages
      if (currentPath === '/cart' || currentPath === '/checkout') return;

      // Don't show if already dismissed in this session
      if (dismissed) return;

      // Only show if there was cart activity
      if (!lastCartUpdate) return;

      const timeSinceUpdate = Date.now() - parseInt(lastCartUpdate);
      // Show after 60 seconds of not being on cart page
      if (timeSinceUpdate > 60000) {
        fetchCart();
      }
    };

    const timer = setTimeout(checkAbandonedCart, 30000); // Check after 30s on page
    const interval = setInterval(checkAbandonedCart, 60000); // Then every 60s

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [sessionId]);

  const fetchCart = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/cart/${sessionId}`);
      const cart = await res.json();
      if (cart.items && cart.items.length > 0) {
        setCartItems(cart.items);
        setShow(true);
      }
    } catch (err) {
      /* ignore */
    }
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('abandonedCartDismissed', 'true');
  };

  const goToCart = () => {
    setShow(false);
    navigate('/cart');
  };

  if (!show || cartItems.length === 0) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="abandoned-overlay" onClick={dismiss}>
      <div className="abandoned-modal" onClick={(e) => e.stopPropagation()}>
        <button className="abandoned-close" onClick={dismiss}>×</button>
        <div className="abandoned-icon">◆</div>
        <h2>Your Selections Await</h2>
        <p className="abandoned-subtitle">
          You have {cartItems.length} piece{cartItems.length > 1 ? 's' : ''} reserved, valued at <strong>${total.toFixed(2)}</strong>
        </p>
        <div className="abandoned-items">
          {cartItems.slice(0, 3).map((item, i) => (
            <div key={i} className="abandoned-item">
              <span className="abandoned-item-name">{item.name}</span>
              <span className="abandoned-item-price">${item.price.toFixed(2)}</span>
            </div>
          ))}
          {cartItems.length > 3 && (
            <p className="abandoned-more">+{cartItems.length - 3} more items</p>
          )}
        </div>
        <div className="abandoned-offer">
          Private offer — use code <strong>RETOUR10</strong> for 10% off
        </div>
        <button className="btn btn-primary abandoned-cta" onClick={goToCart}>
          Return to Your Bag
        </button>
        <button className="abandoned-dismiss" onClick={dismiss}>
          Continue browsing
        </button>
      </div>
    </div>
  );
}

export default AbandonedCartModal;
