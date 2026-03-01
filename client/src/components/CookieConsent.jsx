import { useState, useEffect } from 'react';
import './CookieConsent.css';

function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('hoodie_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('hoodie_cookie_consent', 'accepted');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('hoodie_cookie_consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>
          We use cookies to curate your experience, personalize content,
          and refine our services. By selecting "Accept", you consent to our use of cookies.
        </p>
      </div>
      <div className="cookie-actions">
        <button className="btn cookie-decline" onClick={decline}>Decline</button>
        <button className="btn cookie-accept" onClick={accept}>Accept All</button>
      </div>
    </div>
  );
}

export default CookieConsent;
