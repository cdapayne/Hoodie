# Hoodie Pop-Up Shop - Setup Guide

## Quick Start

### Prerequisites
- Node.js 14+ and npm installed
- Two terminal windows

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/cdapayne/Hoodie.git
   cd Hoodie
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start the backend server** (Terminal 1)
   ```bash
   npm start
   ```
   The API will be available at http://localhost:3001

5. **Start the frontend dev server** (Terminal 2)
   ```bash
   npm run client
   ```
   The application will open at http://localhost:5173

## Configuration

### Payment Integration

To enable real payment processing, you need to configure API credentials:

1. Navigate to http://localhost:5173/admin
2. Click on the "Settings" tab
3. Enter your credentials:

#### Square Setup
- Sign up at https://squareup.com/
- Go to Square Developer Dashboard
- Create an application
- Copy your Access Token and Location ID
- Enter them in the Admin Settings

#### PayPal Setup
- Sign up at https://developer.paypal.com/
- Create an app in the Developer Dashboard
- Copy your Client ID and Client Secret
- Enter them in the Admin Settings

### Store Configuration

In the Admin Settings, you can configure:
- **Low Stock Threshold**: Products below this stock level will show urgency alerts
- **Shipping Deals**: Pre-configured in `data/config.json`:
  - Free shipping on orders over $100
  - $5 off shipping on orders over $50

## Usage

### Customer Flow

1. **Browse Products**
   - Visit http://localhost:5173
   - View the product catalog with limited edition badges and stock alerts

2. **Add to Cart**
   - Click "Add to Cart" on any product
   - Cart badge updates in real-time

3. **Checkout**
   - Review cart and see shipping discounts applied
   - Enter email address
   - Choose payment method (Square or PayPal)
   - Complete purchase

4. **Newsletter**
   - Subscribe to the newsletter from the homepage
   - Email is saved for future promotions

### Admin Panel

Access at http://localhost:5173/admin

#### Products Tab
- **Add Product**: Click "Add New Product" and fill in details
- **Edit Product**: Click "Edit" on any product to update
- **Delete Product**: Remove products from inventory
- **Limited Edition**: Mark products as exclusive

#### Orders Tab
- View all completed orders
- See payment method, total, and date
- Track order history

#### Email List Tab
- View all newsletter subscribers
- Export email list to text file
- See subscription dates

#### Settings Tab
- Configure Square and PayPal API credentials
- Set low stock threshold for urgency alerts
- Manage store settings

## Features

### Demand-Driving Algorithm

The shop includes several psychological triggers to drive sales:

1. **Limited Edition Badges**
   - Red banner on exclusive products
   - Creates sense of scarcity

2. **Low Stock Alerts**
   - "Only X left - Order now!" messages
   - Orange alert banner on products
   - Threshold configurable in settings

3. **Shipping Deals**
   - Green banner showing applicable deals
   - Automatic calculation at checkout
   - Incentivizes larger orders

4. **Real-time Inventory**
   - Stock updates immediately after purchase
   - Prevents overselling

5. **Email Collection**
   - Build customer database
   - Enable future marketing campaigns

## Data Storage

Data is stored in JSON files in the `/data` directory:

- `products.json` - Product catalog
- `carts.json` - Active shopping carts (by session)
- `emails.json` - Newsletter subscribers
- `orders.json` - Order history
- `config.json` - Store and payment configuration

### Migrating to a Database

To scale to production, replace JSON file operations with database queries:

1. Choose a database (MongoDB, PostgreSQL, etc.)
2. Replace `readJsonFile`/`writeJsonFile` functions in `server.js`
3. Create database schemas matching the JSON structure
4. Update all API endpoints to use database queries

## Development

### Project Structure

```
Hoodie/
├── server.js              # Express API server
├── package.json           # Backend dependencies
├── data/                  # JSON data storage
│   ├── products.json
│   ├── carts.json
│   ├── emails.json
│   ├── orders.json
│   └── config.json
├── client/                # React frontend
│   ├── src/
│   │   ├── App.jsx       # Main app with routing
│   │   ├── App.css       # Global styles
│   │   ├── components/
│   │   │   ├── StoreFront.jsx    # Product catalog
│   │   │   ├── Cart.jsx          # Shopping cart
│   │   │   ├── Checkout.jsx      # Payment flow
│   │   │   └── AdminPanel.jsx    # Admin interface
│   │   └── main.jsx
│   └── package.json      # Frontend dependencies
└── README.md
```

### API Endpoints

#### Products
- `GET /api/products` - List all products with demand indicators
- `POST /api/products` - Add new product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

#### Cart
- `GET /api/cart/:sessionId` - Get cart by session
- `POST /api/cart/:sessionId` - Add item to cart
- `DELETE /api/cart/:sessionId/item/:productId` - Remove item

#### Checkout
- `POST /api/payment/square` - Process Square payment
- `POST /api/payment/paypal` - Process PayPal payment
- `GET /api/shipping-deals?total=X` - Get applicable deals

#### Email & Orders
- `POST /api/emails` - Subscribe email
- `GET /api/emails` - List subscribers (admin)
- `GET /api/orders` - List orders (admin)

#### Configuration
- `GET /api/config` - Get store config (sensitive data hidden)
- `PUT /api/config` - Update config (admin)

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is already in use:

**Backend:**
```bash
PORT=3002 npm start
```

**Frontend:** Edit `client/vite.config.js`:
```js
server: {
  port: 5174,
  proxy: { ... }
}
```

### CORS Errors

If you see CORS errors, ensure:
1. Backend is running on port 3001
2. Frontend proxy is configured in `client/vite.config.js`

### Data Not Persisting

Check that:
1. The `/data` directory exists
2. Files have write permissions
3. Server has been restarted after configuration changes

## Production Deployment

### Building for Production

1. **Build frontend**
   ```bash
   cd client
   npm run build
   ```
   This creates optimized files in `client/dist/`

2. **Serve frontend from backend**
   Uncomment the static file serving in `server.js`:
   ```js
   app.use(express.static(path.join(__dirname, 'client/dist')));
   ```

3. **Environment Variables**
   Create `.env` file:
   ```
   PORT=3001
   NODE_ENV=production
   ```

4. **Database Migration**
   Replace JSON storage with a proper database

5. **Payment Integration**
   Configure real Square and PayPal credentials

6. **Security**
   - Add authentication for admin panel
   - Use HTTPS
   - Sanitize user inputs
   - Add rate limiting

### Deployment Platforms

**Heroku:**
```bash
heroku create
git push heroku main
```

**DigitalOcean/AWS:**
- Use PM2 for process management
- Set up Nginx as reverse proxy
- Configure SSL certificates

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/cdapayne/Hoodie/issues)
- Review the main README.md
- Consult the inline code comments

## License

ISC
