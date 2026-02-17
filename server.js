const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

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
const MARKETING_FILE = path.join(DATA_DIR, 'marketing.json');

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
  if (!fs.existsSync(MARKETING_FILE)) {
    fs.writeFileSync(MARKETING_FILE, JSON.stringify({
      announcements: [
        '🎉 Free Shipping on Orders Over $100',
        '⚡ New Limited Edition Drop Every Week',
        '💎 Exclusive Pop-Up Collection',
        '🔥 Limited Stock - Shop Now Before It\'s Gone',
        '✨ High Fashion, Accessible to All'
      ],
      hero: {
        eyebrow: 'Pop-Up Exclusive',
        title: 'LIMITED EDITION',
        subtitle: 'Exclusive Pop-Up Collection',
        tagline: 'High fashion, accessible to all. When it\'s gone, it\'s gone.',
        ctaText: 'Shop the Collection',
        ctaLink: '#products'
      },
      countdownTimer: {
        label: 'Pop-Up Sale Ends In',
        enabled: true
      }
    }, null, 2));
  }
};

initializeDataFiles();

// Helper functions
const readJsonFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
};

const writeJsonFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// API Routes

// File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    success: true, 
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// Multiple files upload
app.post('/api/upload-multiple', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const fileUrls = req.files.map(file => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype
  }));
  res.json({ success: true, files: fileUrls });
});

// Get all uploaded files
app.get('/api/uploads', (req, res) => {
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    return res.json({ files: [] });
  }
  const files = fs.readdirSync(uploadsDir).map(filename => ({
    filename,
    url: `/uploads/${filename}`,
    size: fs.statSync(path.join(uploadsDir, filename)).size,
    created: fs.statSync(path.join(uploadsDir, filename)).birthtime
  }));
  res.json({ files });
});

// Delete uploaded file
app.delete('/api/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'uploads', req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  fs.unlinkSync(filePath);
  res.json({ success: true, message: 'File deleted' });
});

// Marketing Content
app.get('/api/marketing', (req, res) => {
  const marketing = readJsonFile(MARKETING_FILE);
  res.json(marketing || {});
});

app.put('/api/marketing', (req, res) => {
  const marketing = readJsonFile(MARKETING_FILE) || {};
  const updated = { ...marketing, ...req.body };
  writeJsonFile(MARKETING_FILE, updated);
  res.json({ success: true, data: updated });
});

// Products
app.get('/api/products', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  if (!products) {
    return res.status(500).json({ error: 'Error loading products' });
  }
  
  const config = readJsonFile(CONFIG_FILE);
  if (!config) {
    return res.status(500).json({ error: 'Error loading configuration' });
  }
  
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

// Get single product by ID
app.get('/api/products/:id', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  if (!products) {
    return res.status(500).json({ error: 'Error loading products' });
  }
  
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// Get recent purchases for a product
app.get('/api/products/:id/recent-purchases', (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  if (!orders) {
    return res.status(500).json({ error: 'Error loading orders' });
  }
  
  // Get orders from the last 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate > twoHoursAgo;
  });
  
  // Count purchases of this specific product
  let count = 0;
  recentOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.productId === req.params.id) {
        count += item.quantity;
      }
    });
  });
  
  res.json({ count });
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
      imageUrl: product.imageUrl,
      featuredImage: product.featuredImage || product.imageUrl
    });
  }
  
  carts[req.params.sessionId].lastUpdated = new Date().toISOString();
  
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

// Update cart item quantity
app.put('/api/cart/:sessionId/item/:productId', (req, res) => {
  const carts = readJsonFile(CART_FILE);
  const { quantity } = req.body;

  if (!carts[req.params.sessionId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const products = readJsonFile(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (quantity > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} available` });
  }

  if (quantity <= 0) {
    carts[req.params.sessionId].items = carts[req.params.sessionId].items.filter(
      item => item.productId !== req.params.productId
    );
  } else {
    const item = carts[req.params.sessionId].items.find(i => i.productId === req.params.productId);
    if (item) {
      item.quantity = quantity;
    }
  }

  writeJsonFile(CART_FILE, carts);
  res.json(carts[req.params.sessionId]);
});

// Promo code validation
app.post('/api/promo/validate', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Promo code is required' });
  }

  const promoCodes = {
    'WELCOME10': { discount: 10, type: 'percent', message: '10% off your order!' },
    'LOVE15':    { discount: 15, type: 'percent', message: '15% off your order!' },
    'FREESHIP':  { discount: 0, type: 'freeshipping', message: 'Free shipping applied!' },
    'BUNDLE10':  { discount: 10, type: 'percent', message: '10% bundle discount!' },
    'SAVE5':     { discount: 5,  type: 'fixed', message: '$5 off your order!' },
    'HOODIE20':  { discount: 20, type: 'percent', message: '20% off hoodies!' },
    'SPIN10':    { discount: 10, type: 'percent', message: '10% off — lucky spin winner!' },
    'NEWCUSTOMER': { discount: 15, type: 'percent', message: '15% new customer discount!' },
    'FLASH25':   { discount: 25, type: 'percent', message: '25% flash sale discount!' },
    'SUMMER':    { discount: 20, type: 'percent', message: '20% summer sale!' },
    'COMEBACK10': { discount: 10, type: 'percent', message: '10% off — welcome back!' }
  };

  const promo = promoCodes[code.toUpperCase()];
  if (!promo) {
    return res.status(404).json({ error: 'Invalid promo code' });
  }

  res.json({ valid: true, ...promo });
});

// Email collection
app.post('/api/emails', (req, res) => {
  const emails = readJsonFile(EMAILS_FILE);
  if (!emails) {
    return res.status(500).json({ error: 'Error reading email list' });
  }
  
  const { email } = req.body;
  
  // Better email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
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

// Unsubscribe from email list
app.post('/api/emails/unsubscribe', (req, res) => {
  const emails = readJsonFile(EMAILS_FILE);
  const { email } = req.body;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  
  const filteredEmails = emails.filter(e => e.email !== email);
  
  if (filteredEmails.length === emails.length) {
    return res.status(404).json({ error: 'Email not found in our list' });
  }
  
  writeJsonFile(EMAILS_FILE, filteredEmails);
  res.json({ message: 'Successfully unsubscribed from mailing list' });
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
  const { amount, nonce, sessionId, shippingAddress } = req.body;
  const config = readJsonFile(CONFIG_FILE);
  
  if (!config.squareAccessToken) {
    return res.status(400).json({ error: 'Square not configured' });
  }
  
  const orderId = uuidv4();
  const orderNumber = 'HD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
  const orders = readJsonFile(ORDERS_FILE);
  const carts = readJsonFile(CART_FILE);
  
  orders.push({
    id: orderId,
    orderNumber,
    sessionId,
    items: carts[sessionId]?.items || [],
    amount,
    paymentMethod: 'square',
    status: 'confirmed',
    statusHistory: [
      { status: 'confirmed', date: new Date().toISOString(), note: 'Order placed' }
    ],
    shippingAddress: shippingAddress || {},
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
  
  res.json({ success: true, orderId, orderNumber });
});

app.post('/api/payment/paypal', async (req, res) => {
  const { amount, orderId, sessionId, shippingAddress } = req.body;
  const config = readJsonFile(CONFIG_FILE);
  
  if (!config.paypalClientId) {
    return res.status(400).json({ error: 'PayPal not configured' });
  }
  
  const orders = readJsonFile(ORDERS_FILE);
  const carts = readJsonFile(CART_FILE);
  const orderNumber = 'HD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
  
  orders.push({
    id: orderId,
    orderNumber,
    sessionId,
    items: carts[sessionId]?.items || [],
    amount,
    paymentMethod: 'paypal',
    status: 'confirmed',
    statusHistory: [
      { status: 'confirmed', date: new Date().toISOString(), note: 'Order placed via PayPal' }
    ],
    shippingAddress: shippingAddress || {},
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
  
  res.json({ success: true, orderId, orderNumber });
});

// Orders (Admin)
app.get('/api/orders', (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  res.json(orders);
});

// Track order by order number and email
app.get('/api/orders/track', (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  const { orderNumber, email } = req.query;
  
  if (!orderNumber || !email) {
    return res.status(400).json({ error: 'Order number and email are required' });
  }
  
  const order = orders.find(o => 
    (o.orderNumber === orderNumber || o.id === orderNumber) && 
    o.shippingAddress?.email?.toLowerCase() === email.toLowerCase()
  );
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found. Please check your order number and email.' });
  }
  
  res.json(order);
});

// Serve React app for all other routes (removed for now - will be handled by separate frontend server)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
