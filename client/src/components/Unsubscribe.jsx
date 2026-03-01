import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Unsubscribe.css';

const API_URL = 'http://localhost:3001/api';

function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if email is in URL params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/emails/unsubscribe`, { email });
      setStatus('success');
      setMessage(response.data.message || 'You have been successfully unsubscribed from our mailing list.');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="unsubscribe-page">
      <div className="container">
        <div className="unsubscribe-content">
          {status !== 'success' ? (
            <>
              <div className="unsubscribe-header">
                <h1>Email Preferences</h1>
                <p>We understand. Enter your email below to unsubscribe from our communications.</p>
              </div>

              <form onSubmit={handleUnsubscribe} className="unsubscribe-form">
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

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Unsubscribing...' : 'Unsubscribe'}
                </button>

                {status === 'error' && (
                  <div className="error-message">
                    <p>{message}</p>
                  </div>
                )}
              </form>

              <div className="unsubscribe-note">
                <p>You will no longer receive communications from Maison Hoodie. You may still receive correspondence related to your orders.</p>
              </div>
            </>
          ) : (
            <div className="success-content">
              <div className="success-icon">✓</div>
              <h2>Successfully Unsubscribed</h2>
              <p>{message}</p>
              <p className="feedback-text">We value your perspective. Your feedback helps us refine our experience.</p>
              <a href="mailto:concierge@maisonhoodie.com" className="btn btn-secondary">Share Feedback</a>
              <a href="/" className="back-link">Return to the Maison</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Unsubscribe;
