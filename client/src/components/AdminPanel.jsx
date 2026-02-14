import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const API_URL = 'http://localhost:3001/api';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'products') {
        const response = await axios.get(`${API_URL}/products`);
        setProducts(response.data);
      } else if (activeTab === 'emails') {
        const response = await axios.get(`${API_URL}/emails`);
        setEmails(response.data);
      } else if (activeTab === 'orders') {
        const response = await axios.get(`${API_URL}/orders`);
        setOrders(response.data);
      } else if (activeTab === 'settings') {
        const response = await axios.get(`${API_URL}/config`);
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await axios.post(`${API_URL}/products`, productData);
      fetchData();
      setShowAddProduct(false);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      await axios.put(`${API_URL}/products/${id}`, productData);
      fetchData();
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleUpdateConfig = async (configData) => {
    try {
      await axios.put(`${API_URL}/config`, configData);
      alert('Settings updated successfully');
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Error updating settings');
    }
  };

  return (
    <div className="admin-panel">
      <div className="container">
        <h1 className="page-title">Admin Panel</h1>

        <div className="admin-tabs">
          <button
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`tab ${activeTab === 'emails' ? 'active' : ''}`}
            onClick={() => setActiveTab('emails')}
          >
            Email List
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              onAdd={handleAddProduct}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              showAddProduct={showAddProduct}
              setShowAddProduct={setShowAddProduct}
            />
          )}

          {activeTab === 'orders' && <OrdersTab orders={orders} />}

          {activeTab === 'emails' && <EmailsTab emails={emails} />}

          {activeTab === 'settings' && (
            <SettingsTab config={config} onUpdate={handleUpdateConfig} />
          )}
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ products, onAdd, onUpdate, onDelete, editingProduct, setEditingProduct, showAddProduct, setShowAddProduct }) {
  return (
    <div className="products-tab">
      <div className="tab-header">
        <h2>Manage Products</h2>
        <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>
          Add New Product
        </button>
      </div>

      {showAddProduct && (
        <ProductForm
          onSubmit={onAdd}
          onCancel={() => setShowAddProduct(false)}
        />
      )}

      <div className="products-list">
        {products.map(product => (
          <div key={product.id} className="product-item">
            {editingProduct?.id === product.id ? (
              <ProductForm
                product={product}
                onSubmit={(data) => onUpdate(product.id, data)}
                onCancel={() => setEditingProduct(null)}
              />
            ) : (
              <>
                <div className="product-item-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-meta">
                    <span>Price: ${product.price}</span>
                    <span>Stock: {product.stock}</span>
                    <span>{product.isLimited ? '⭐ Limited Edition' : ''}</span>
                  </div>
                </div>
                <div className="product-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setEditingProduct(product)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => onDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(product || {
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'hoodies',
    isLimited: false,
    imageUrl: '/images/default.jpg'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Stock Quantity *</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="hoodies">Hoodies</option>
            <option value="shirts">Shirts</option>
            <option value="pants">Pants</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.isLimited}
            onChange={(e) => setFormData({...formData, isLimited: e.target.checked})}
          />
          <span>Limited Edition</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {product ? 'Update' : 'Add'} Product
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function OrdersTab({ orders }) {
  return (
    <div className="orders-tab">
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <p className="empty-message">No orders yet</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <h3>Order #{order.id.substring(0, 8)}</h3>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="order-details">
                <p>Payment Method: {order.paymentMethod}</p>
                <p>Total: ${order.amount?.toFixed(2)}</p>
                <p>Status: {order.status}</p>
                <p>Items: {order.cart?.items?.length || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmailsTab({ emails }) {
  const exportEmails = () => {
    const emailList = emails.map(e => e.email).join('\n');
    const blob = new Blob([emailList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-list.txt';
    a.click();
  };

  return (
    <div className="emails-tab">
      <div className="tab-header">
        <h2>Email Subscribers ({emails.length})</h2>
        <button className="btn btn-primary" onClick={exportEmails}>
          Export List
        </button>
      </div>
      <div className="emails-list">
        {emails.map((email, index) => (
          <div key={index} className="email-item">
            <span>{email.email}</span>
            <span className="email-date">
              {new Date(email.subscribedAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ config, onUpdate }) {
  const [formData, setFormData] = useState(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="settings-tab">
      <h2>Payment & Store Settings</h2>
      <form onSubmit={handleSubmit} className="settings-form">
        <h3>Square Payment Settings</h3>
        <div className="form-group">
          <label>Square Access Token</label>
          <input
            type="password"
            value={formData.squareAccessToken || ''}
            onChange={(e) => setFormData({...formData, squareAccessToken: e.target.value})}
            placeholder="Enter Square access token"
          />
        </div>
        <div className="form-group">
          <label>Square Location ID</label>
          <input
            type="text"
            value={formData.squareLocationId || ''}
            onChange={(e) => setFormData({...formData, squareLocationId: e.target.value})}
            placeholder="Enter Square location ID"
          />
        </div>

        <h3 className="mt-4">PayPal Settings</h3>
        <div className="form-group">
          <label>PayPal Client ID</label>
          <input
            type="text"
            value={formData.paypalClientId || ''}
            onChange={(e) => setFormData({...formData, paypalClientId: e.target.value})}
            placeholder="Enter PayPal client ID"
          />
        </div>
        <div className="form-group">
          <label>PayPal Client Secret</label>
          <input
            type="password"
            value={formData.paypalClientSecret || ''}
            onChange={(e) => setFormData({...formData, paypalClientSecret: e.target.value})}
            placeholder="Enter PayPal client secret"
          />
        </div>

        <h3 className="mt-4">Store Settings</h3>
        <div className="form-group">
          <label>Low Stock Threshold</label>
          <input
            type="number"
            value={formData.lowStockThreshold || 10}
            onChange={(e) => setFormData({...formData, lowStockThreshold: parseInt(e.target.value)})}
          />
          <small>Products with stock below this will show urgency messages</small>
        </div>

        <button type="submit" className="btn btn-primary">
          Save Settings
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;
