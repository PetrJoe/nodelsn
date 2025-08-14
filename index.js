const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const viewRoutes = require('./routes/viewRoutes');
const ecommerceRoutes = require('./routes/ecommerce');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Configure session middleware
app.use(session({
  secret: 'my_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Use routes
app.use('/', viewRoutes);
app.use('/', authRoutes);
app.use('/', ecommerceRoutes);

// Update the dashboard route to include product management
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Add a route for product management
app.get('/products', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'public/products.html'));
});

// Add a route for cart management
app.get('/cart', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'public/cart.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));