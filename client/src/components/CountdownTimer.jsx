import { useState, useEffect } from 'react';
import './CountdownTimer.css';

function CountdownTimer({ endTime, label = "Flash Sale Ends In" }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const end = endTime ? new Date(endTime) : getNextMidnight();
    const diff = Math.max(0, end - Date.now());
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  }

  function getNextMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    return midnight;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="countdown-timer">
      <span className="countdown-label">{label}</span>
      <div className="countdown-digits">
        <div className="countdown-block">
          <span className="countdown-number">{pad(timeLeft.hours)}</span>
          <span className="countdown-unit">HRS</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-block">
          <span className="countdown-number">{pad(timeLeft.minutes)}</span>
          <span className="countdown-unit">MIN</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-block">
          <span className="countdown-number">{pad(timeLeft.seconds)}</span>
          <span className="countdown-unit">SEC</span>
        </div>
      </div>
    </div>
  );
}

export default CountdownTimer;
