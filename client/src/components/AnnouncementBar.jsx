import { useState, useEffect } from 'react';
import axios from 'axios';
import './AnnouncementBar.css';

const API_URL = 'http://localhost:3001/api';

function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState([
    "Complimentary Shipping on Orders Over $100",
    "New Édition Limitée — Discover the Collection",
    "Handcrafted Luxury — Each Piece Individually Numbered",
    "Private Access — Join the Maison for Exclusive Previews",
    "Atelier-Quality Materials — Crafted to Last"
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fetch marketing content
    axios.get(`${API_URL}/marketing`)
      .then(res => {
        if (res.data.announcements && res.data.announcements.length > 0) {
          setAnnouncements(res.data.announcements);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="announcement-bar">
      <div className="announcement-text">
        {announcements[currentIndex]}
      </div>
      <button className="announcement-close" onClick={() => setIsVisible(false)}>×</button>
    </div>
  );
}

export default AnnouncementBar;
