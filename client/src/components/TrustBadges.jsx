import './TrustBadges.css';

function TrustBadges({ variant = 'full' }) {
  if (variant === 'mini') {
    return (
      <div className="trust-badges-mini">
        <span>Secure Payment</span>
        <span>Complimentary Shipping</span>
        <span>Authenticated</span>
      </div>
    );
  }

  return (
    <div className="trust-badges">
      <div className="trust-badge">
        <div className="badge-icon">◆</div>
        <div className="badge-text">
          <strong>Secure Payment</strong>
          <span>Encrypted transactions</span>
        </div>
      </div>
      <div className="trust-badge">
        <div className="badge-icon">◆</div>
        <div className="badge-text">
          <strong>Complimentary Shipping</strong>
          <span>On orders over $100</span>
        </div>
      </div>
      <div className="trust-badge">
        <div className="badge-icon">◆</div>
        <div className="badge-text">
          <strong>Atelier Quality</strong>
          <span>Handcrafted excellence</span>
        </div>
      </div>
      <div className="trust-badge">
        <div className="badge-icon">◆</div>
        <div className="badge-text">
          <strong>Concierge Service</strong>
          <span>Personal assistance</span>
        </div>
      </div>
    </div>
  );
}

export default TrustBadges;
