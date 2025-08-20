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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));