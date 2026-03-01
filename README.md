# Hoodie - Premium Pop-Up Fashion Shop

A full-featured e-commerce pop-up shop for clothing with high-fashion design, admin panel, and payment integrations.

## Features

### Customer-Facing
- 🎨 **High Fashion Design** - Modern, welcoming interface with premium aesthetics
- 🛍️ **Product Catalog** - Browse exclusive clothing collections
- 🛒 **Shopping Cart** - Full cart management with real-time updates
- 📧 **Email Collection** - Newsletter subscription for exclusive offers
- ⚡ **Demand Drivers**:
  - Limited edition badges
  - Low stock alerts ("Only X left - Order now!")
  - Shipping deals (free shipping over $100, discounts on orders over $50)
- 💳 **Payment Integration** - Square and PayPal support
- 📱 **Responsive Design** - Works on all devices

### Admin Panel
- 📦 **Product Management** - Add, edit, delete products
- 💰 **Pricing Control** - Set and update product prices
- 📊 **Inventory Tracking** - Monitor stock levels in real-time
- 🎯 **Limited Edition Control** - Mark products as limited designs
- 📧 **Email List Management** - View and export subscriber emails
- 📋 **Order History** - Track all orders and payments
- ⚙️ **Payment Configuration** - Set up Square and PayPal credentials
- 🚚 **Shipping Settings** - Configure shipping deals and thresholds

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Styling**: Custom CSS with modern design
- **Data Storage**: JSON files (easy to switch to a database)
- **Payment Processing**: Square & PayPal integrations

## Installation

### Prerequisites
- Node.js 14+ and npm

### Setup

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

4. **Run the application**

   In one terminal, start the backend server:
   ```bash
   npm run dev
   ```

   In another terminal, start the frontend:
   ```bash
   npm run client
   ```

   - Backend API: http://localhost:3001
   - Frontend: http://localhost:5173

## Usage

### Customer Flow
1. Browse products on the home page
2. View limited edition items and low stock alerts
3. Add items to cart
4. Subscribe to the newsletter
5. Proceed to checkout
6. Choose payment method (Square or PayPal)
7. Complete purchase

### Admin Flow
1. Navigate to `/admin`
2. **Products Tab**: Manage product catalog
   - Add new products with name, price, description, stock
   - Mark items as limited edition
   - Update pricing and inventory
   - Delete products
3. **Orders Tab**: View order history and details
4. **Email List Tab**: View subscribers and export list
5. **Settings Tab**: Configure payment gateways and store settings
   - Enter Square API credentials
   - Enter PayPal API credentials
   - Set low stock threshold for urgency alerts

## Configuration

### Payment Integration

#### Square
1. Sign up at https://squareup.com/
2. Get your Access Token and Location ID
3. Enter them in Admin → Settings

#### PayPal
1. Sign up at https://developer.paypal.com/
2. Create an app to get Client ID and Secret
3. Enter them in Admin → Settings

### Shipping Deals
Configure in Admin → Settings or modify `data/config.json`:
```json
{
  "shippingDeals": [
    { "minOrder": 100, "discount": 0, "message": "Free shipping on orders over $100!" },
    { "minOrder": 50, "discount": 5, "message": "$5 off shipping on orders over $50!" }
  ],
  "lowStockThreshold": 10
}
```

## Demand-Driving Algorithm

The shop includes several features to drive urgency and sales:

1. **Limited Edition Badges** - Highlight exclusive products
2. **Stock Alerts** - "Only X left - Order now!" for low inventory
3. **Shipping Deals** - Incentivize larger orders with free/discounted shipping
4. **Email Collection** - Build a customer base for future promotions
5. **Real-time Inventory** - Stock updates immediately after purchase

## Data Structure

Data is stored in `/data` directory:
- `products.json` - Product catalog
- `carts.json` - Active shopping carts
- `emails.json` - Newsletter subscribers
- `orders.json` - Order history
- `config.json` - Store configuration

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart
- `GET /api/cart/:sessionId` - Get cart
- `POST /api/cart/:sessionId` - Add to cart
- `DELETE /api/cart/:sessionId/item/:productId` - Remove from cart

### Email
- `POST /api/emails` - Subscribe email
- `GET /api/emails` - Get all subscribers (admin)

### Payment
- `POST /api/payment/square` - Process Square payment
- `POST /api/payment/paypal` - Process PayPal payment

### Configuration
- `GET /api/config` - Get store configuration
- `PUT /api/config` - Update configuration

### Orders
- `GET /api/orders` - Get all orders (admin)

### Shipping
- `GET /api/shipping-deals?total=X` - Get applicable shipping deals

## Development

### Project Structure
```
Hoodie/
├── server.js              # Express backend
├── package.json           # Backend dependencies
├── data/                  # JSON data storage
├── client/                # React frontend
│   ├── src/
│   │   ├── App.jsx       # Main app component
│   │   ├── components/   # React components
│   │   │   ├── StoreFront.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── AdminPanel.jsx
│   │   └── ...
│   └── package.json      # Frontend dependencies
└── README.md
```

## Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Copy built files to server's public directory

3. Set environment variables for production

4. Configure real payment processor credentials

5. Consider switching from JSON files to a database (MongoDB, PostgreSQL, etc.)

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- User authentication and accounts
- Order tracking and notifications
- Advanced analytics dashboard
- Multi-image product galleries
- Product reviews and ratings
- Wishlist functionality
- Coupon/promo code system
- Social media integration
- SEO optimization

## License

ISC

## Author

Created for pop-up fashion retail

