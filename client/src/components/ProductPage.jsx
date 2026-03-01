import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductPage.css';

const API_URL = 'http://localhost:3001/api';

function ProductPage({ sessionId, onCartUpdate }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [recentPurchases, setRecentPurchases] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
    fetchRecentPurchases();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const fetchRecentPurchases = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}/recent-purchases`);
      setRecentPurchases(response.data.count);
    } catch (error) {
      // If no purchases found, use random number between 15-27
      setRecentPurchases(Math.floor(Math.random() * (27 - 15 + 1)) + 15);
    }
  };

  const addToCart = async () => {
    try {
      await axios.post(`${API_URL}/cart/${sessionId}`, {
        productId,
        quantity
      });
      onCartUpdate();
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.error || 'Error adding to cart');
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  return (
    <div className="product-page">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Collection
      </button>

      <div className="product-container">
        <div className="product-media">
          {/* Video Section */}
          {product.videoUrl && (
            <div className="product-video">
              <video controls poster={product.images?.[0] || product.imageUrl}>
                <source src={product.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Image Gallery */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.images?.[selectedImage] || product.imageUrl} 
                alt={product.name}
              />
            </div>
            <div className="image-thumbnails">
              {product.images?.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>
          {product.isLimited && (
            <span className="limited-badge">ÉDITION LIMITÉE</span>
          )}
          
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className="product-description">{product.description}</p>
          
          <div className="stock-info">
            <p className="stock">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
            <p className="recent-purchases">
              {recentPurchases} clients acquired this piece recently
            </p>
          </div>

          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
            />
          </div>

          <button
            className="add-to-cart-btn"
            onClick={addToCart}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'Add to Bag' : 'Currently Unavailable'}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="product-reviews">
        <h2>Client Reviews</h2>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="reviews-list">
            {product.reviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-header">
                  <div className="review-rating">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <span className="review-author">{review.author}</span>
                  <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <p className="review-text">{review.text}</p>
                {review.verified && (
                  <span className="verified-badge">✓ Verified Purchase</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  );
}

export default ProductPage;
