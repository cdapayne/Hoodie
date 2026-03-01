import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './WelcomePopup.css';

const API_URL = 'http://localhost:3001/api';

function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const prizes = [
    { label: '10% OFF', code: 'MAISON10', color: '#2c2420' },
    { label: '15% OFF', code: 'LUXE15', color: '#1a1a1a' },
    { label: 'FREE SHIP', code: 'ATELIER', color: '#3d3530' },
    { label: '5% OFF', code: 'SALON5', color: '#4a4540' },
    { label: '20% OFF', code: 'PRIVÉ20', color: '#2c2420' },
    { label: '10% OFF', code: 'MAISON', color: '#1a1a1a' },
  ];

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hoodie_popup_seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Exit-intent detection
  useEffect(() => {
    const hasSeenExit = sessionStorage.getItem('hoodie_exit_shown');
    if (hasSeenExit) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !show) {
        sessionStorage.setItem('hoodie_exit_shown', 'true');
        setShow(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [show]);

  const handleSpin = useCallback(async () => {
    if (!email || isSpinning) return;
    setIsSpinning(true);
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const segmentAngle = 360 / prizes.length;
    const newRotation = 360 * 5 + (prizeIndex * segmentAngle) + segmentAngle / 2;
    setRotation(newRotation);

    setTimeout(async () => {
      setSpinResult(prizes[prizeIndex]);
      setIsSpinning(false);
      try {
        await axios.post(`${API_URL}/emails`, { email });
      } catch (err) { /* ignore */ }
    }, 4000);
  }, [email, isSpinning, prizes]);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('hoodie_popup_seen', Date.now().toString());
  };

  const handleSubmitDirect = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await axios.post(`${API_URL}/emails`, { email });
      setSubmitted(true);
    } catch (err) { /* ignore */ }
  };

  if (!show) return null;

  return (
    <div className="popup-overlay" onClick={handleClose}>
      <div className="popup-container" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={handleClose}>×</button>

        {!spinResult && !submitted ? (
          <div className="popup-content">
            <div className="popup-left">
              <div className="spin-wheel-container">
                <div className="spin-pointer">▼</div>
                <div
                  className="spin-wheel"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {prizes.map((prize, i) => (
                    <div
                      key={i}
                      className="spin-segment"
                      style={{
                        transform: `rotate(${i * (360 / prizes.length)}deg)`,
                        background: prize.color
                      }}
                    >
                      <span>{prize.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="popup-right">
              <h2>Private Access</h2>
              <p>Enter your email to unlock an exclusive privilege reserved for new members of the Maison.</p>
              <form onSubmit={(e) => { e.preventDefault(); handleSpin(); }}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary spin-btn"
                  disabled={isSpinning || !email}
                >
                  {isSpinning ? 'Revealing...' : 'REVEAL MY OFFER'}
                </button>
              </form>
              <p className="popup-small">We respect your privacy. Unsubscribe anytime.</p>
              <button className="popup-skip" onClick={handleClose}>Continue without offer</button>
            </div>
          </div>
        ) : spinResult ? (
          <div className="popup-result">
            <div className="confetti-bg">◆</div>
            <h2>Your Exclusive Privilege</h2>
            <p>You've unlocked <strong>{spinResult.label}</strong></p>
            <div className="discount-code-box">
              <span className="discount-label">Your Private Code</span>
              <span className="discount-code">{spinResult.code}</span>
            </div>
            <p className="popup-small">Present this code at checkout to redeem your offer.</p>
            <button className="btn btn-primary" onClick={handleClose}>Explore the Collection</button>
          </div>
        ) : (
          <div className="popup-result">
            <h2>Welcome to the Maison</h2>
            <p>You've been granted <strong>10% OFF</strong> your first acquisition.</p>
            <div className="discount-code-box">
              <span className="discount-label">Your Private Code</span>
              <span className="discount-code">MAISON10</span>
            </div>
            <button className="btn btn-primary" onClick={handleClose}>Explore the Collection</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomePopup;
