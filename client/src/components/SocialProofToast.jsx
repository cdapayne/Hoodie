import { useState, useEffect, useCallback } from 'react';
import './SocialProofToast.css';

const cities = [
  'New York', 'Paris', 'London', 'Milano', 'Dubai',
  'Tokyo', 'Los Angeles', 'Monaco', 'Hong Kong', 'Berlin',
  'Stockholm', 'Sydney', 'Miami', 'Toronto', 'Zürich',
  'Barcelona', 'Singapore', 'Vienna', 'Seoul', 'Amsterdam'
];

const firstNames = [
  'Sarah', 'Mike', 'Emma', 'James', 'Olivia', 'Liam', 'Sophia',
  'Noah', 'Ava', 'Jackson', 'Mia', 'Aiden', 'Isabella', 'Lucas',
  'Chloe', 'Mason', 'Ella', 'Ethan', 'Aria', 'Logan'
];

const timeAgo = [
  'Just now', 'Moments ago', '3 minutes ago',
  '8 minutes ago', '12 minutes ago', '18 minutes ago',
  '25 minutes ago', '35 minutes ago', '45 minutes ago',
  '1 hour ago'
];

function SocialProofToast({ products }) {
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState(null);

  const generateNotification = useCallback(() => {
    if (!products || products.length === 0) return;
    const product = products[Math.floor(Math.random() * products.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const name = firstNames[Math.floor(Math.random() * firstNames.length)];
    const time = timeAgo[Math.floor(Math.random() * timeAgo.length)];

    setNotification({
      name: `${name} from ${city}`,
      product: product.name,
      time,
      image: product.featuredImage || product.imageUrl
    });
    setShow(true);

    setTimeout(() => setShow(false), 5000);
  }, [products]);

  useEffect(() => {
    // Don't show on first 8 seconds
    const initialDelay = setTimeout(() => {
      generateNotification();
    }, 8000);

    const interval = setInterval(() => {
      generateNotification();
    }, 25000 + Math.random() * 15000); // random 25-40s interval

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [generateNotification]);

  if (!show || !notification) return null;

  return (
    <div className="social-proof-toast" onClick={() => setShow(false)}>
      <div className="toast-image">
        {notification.image ? (
          <img src={notification.image} alt="" />
        ) : (
          <span className="toast-icon">◆</span>
        )}
      </div>
      <div className="toast-content">
        <p className="toast-title">{notification.name}</p>
        <p className="toast-product">acquired <strong>{notification.product}</strong></p>
        <p className="toast-time">{notification.time}</p>
      </div>
      <div className="toast-verified">Verified</div>
    </div>
  );
}

export default SocialProofToast;
