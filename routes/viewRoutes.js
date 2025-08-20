const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../db');

// Home page
router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

// Login page
router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public/auth/login.html')));

// Register page
router.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../public/auth/register.html')));

// Forgot password page
router.get('/forgot-password', (req, res) => res.sendFile(path.join(__dirname, '../public/auth/forgot-password.html')));

// Reset password page
router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;

  db.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [token],
    (err, results) => {
      if (err) throw err;
      if (results.length === 0) return res.send('Invalid or expired token.');

      res.sendFile(path.join(__dirname, '../public/reset-password.html'));
    }
  );
});

// Protected dashboard
router.get('/dashboard', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Add a route for product management
router.get('/products', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../public/products.html'));
});

// Add a route for cart management
router.get('/cart', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../public/cart.html'));
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;