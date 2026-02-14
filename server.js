const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CART_FILE = path.join(DATA_DIR, 'carts.json');
const EMAILS_FILE = path.join(DATA_DIR, 'emails.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
const initializeDataFiles = () => {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([
      {
        id: uuidv4(),
        name: 'Limited Edition Hoodie',
        description: 'Premium cotton blend hoodie with exclusive design',
        price: 79.99,
        stock: 5,
        imageUrl: '/images/hoodie1.jpg',
        isLimited: true,
        category: 'hoodies'
      },
      {
        id: uuidv4(),
        name: 'Classic T-Shirt',
        description: 'Comfortable everyday wear',
        price: 29.99,
        stock: 20,
        imageUrl: '/images/tshirt1.jpg',
        isLimited: false,
        category: 'shirts'
      }
    ], null, 2));
  }
  if (!fs.existsSync(CART_FILE)) {
    fs.writeFileSync(CART_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(EMAILS_FILE)) {
    fs.writeFileSync(EMAILS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({
      squareAccessToken: '',
      squareLocationId: '',
      paypalClientId: '',
      paypalClientSecret: '',
      shippingDeals: [
        { minOrder: 100, discount: 0, message: 'Free shipping on orders over $100!' },
        { minOrder: 50, discount: 5, message: '$5 off shipping on orders over $50!' }
      ],
      lowStockThreshold: 10
    }, null, 2));
  }
};

initializeDataFiles();

// Helper functions
const readJsonFile = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeJsonFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// API Routes

// Products
app.get('/api/products', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const config = readJsonFile(CONFIG_FILE);
  
  // Add demand indicators
  const enrichedProducts = products.map(product => ({
    ...product,
    isLowStock: product.stock <= config.lowStockThreshold,
    urgencyMessage: product.stock <= config.lowStockThreshold ? 
      `Only ${product.stock} left - Order now!` : null,
    isLimited: product.isLimited || false
  }));
  
  res.json(enrichedProducts);
});

app.post('/api/products', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const newProduct = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  writeJsonFile(PRODUCTS_FILE, products);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products[index] = { ...products[index], ...req.body };
  writeJsonFile(PRODUCTS_FILE, products);
  res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const filtered = products.filter(p => p.id !== req.params.id);
  
  if (filtered.length === products.length) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  writeJsonFile(PRODUCTS_FILE, filtered);
  res.json({ message: 'Product deleted' });
});

// Cart
app.get('/api/cart/:sessionId', (req, res) => {
  const carts = readJsonFile(CART_FILE);
  const cart = carts[req.params.sessionId] || { items: [] };
  res.json(cart);
});

app.post('/api/cart/:sessionId', (req, res) => {
  const carts = readJsonFile(CART_FILE);
  const { productId, quantity } = req.body;
  const products = readJsonFile(PRODUCTS_FILE);
  
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  if (product.stock < quantity) {
    return res.status(400).json({ error: 'Not enough stock' });
  }
  
  if (!carts[req.params.sessionId]) {
    carts[req.params.sessionId] = { items: [] };
  }
  
  const existingItem = carts[req.params.sessionId].items.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    carts[req.params.sessionId].items.push({
      productId,
      quantity,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl
    });
  }
  
  writeJsonFile(CART_FILE, carts);
  res.json(carts[req.params.sessionId]);
});

app.delete('/api/cart/:sessionId/item/:productId', (req, res) => {
  const carts = readJsonFile(CART_FILE);
  
  if (!carts[req.params.sessionId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  carts[req.params.sessionId].items = carts[req.params.sessionId].items.filter(
    item => item.productId !== req.params.productId
  );
  
  writeJsonFile(CART_FILE, carts);
  res.json(carts[req.params.sessionId]);
});

// Email collection
app.post('/api/emails', (req, res) => {
  const emails = readJsonFile(EMAILS_FILE);
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  if (!emails.find(e => e.email === email)) {
    emails.push({
      email,
      subscribedAt: new Date().toISOString()
    });
    writeJsonFile(EMAILS_FILE, emails);
  }
  
  res.json({ message: 'Email subscribed' });
});

app.get('/api/emails', (req, res) => {
  const emails = readJsonFile(EMAILS_FILE);
  res.json(emails);
});

// Shipping deals
app.get('/api/shipping-deals', (req, res) => {
  const config = readJsonFile(CONFIG_FILE);
  const { total } = req.query;
  
  const applicableDeals = config.shippingDeals
    .filter(deal => parseFloat(total) >= deal.minOrder)
    .sort((a, b) => b.discount - a.discount);
  
  res.json(applicableDeals[0] || null);
});

// Config (Admin)
app.get('/api/config', (req, res) => {
  const config = readJsonFile(CONFIG_FILE);
  // Don't send sensitive info to client
  res.json({
    ...config,
    squareAccessToken: config.squareAccessToken ? '***' : '',
    paypalClientSecret: config.paypalClientSecret ? '***' : ''
  });
});

app.put('/api/config', (req, res) => {
  const config = readJsonFile(CONFIG_FILE);
  const updatedConfig = { ...config, ...req.body };
  writeJsonFile(CONFIG_FILE, updatedConfig);
  res.json({ message: 'Config updated' });
});

// Payment processing (mock endpoints - would integrate with real Square/PayPal)
app.post('/api/payment/square', async (req, res) => {
  const { amount, nonce, sessionId } = req.body;
  const config = readJsonFile(CONFIG_FILE);
  
  // In production, this would use the Square API
  // For now, we'll simulate a successful payment
  
  if (!config.squareAccessToken) {
    return res.status(400).json({ error: 'Square not configured' });
  }
  
  // Simulate payment processing
  const orderId = uuidv4();
  const orders = readJsonFile(ORDERS_FILE);
  const carts = readJsonFile(CART_FILE);
  
  orders.push({
    id: orderId,
    sessionId,
    cart: carts[sessionId],
    amount,
    paymentMethod: 'square',
    status: 'completed',
    createdAt: new Date().toISOString()
  });
  
  writeJsonFile(ORDERS_FILE, orders);
  
  // Update inventory
  const products = readJsonFile(PRODUCTS_FILE);
  carts[sessionId].items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  });
  writeJsonFile(PRODUCTS_FILE, products);
  
  // Clear cart
  delete carts[sessionId];
  writeJsonFile(CART_FILE, carts);
  
  res.json({ success: true, orderId });
});

app.post('/api/payment/paypal', async (req, res) => {
  const { amount, orderId, sessionId } = req.body;
  const config = readJsonFile(CONFIG_FILE);
  
  if (!config.paypalClientId) {
    return res.status(400).json({ error: 'PayPal not configured' });
  }
  
  // In production, this would verify with PayPal API
  const orders = readJsonFile(ORDERS_FILE);
  const carts = readJsonFile(CART_FILE);
  
  orders.push({
    id: orderId,
    sessionId,
    cart: carts[sessionId],
    amount,
    paymentMethod: 'paypal',
    status: 'completed',
    createdAt: new Date().toISOString()
  });
  
  writeJsonFile(ORDERS_FILE, orders);
  
  // Update inventory
  const products = readJsonFile(PRODUCTS_FILE);
  carts[sessionId].items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  });
  writeJsonFile(PRODUCTS_FILE, products);
  
  // Clear cart
  delete carts[sessionId];
  writeJsonFile(CART_FILE, carts);
  
  res.json({ success: true, orderId });
});

// Orders (Admin)
app.get('/api/orders', (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  res.json(orders);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
