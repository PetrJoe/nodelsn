const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get all products
router.get('/products', (req, res) => {
  db.query(
    'SELECT * FROM products',
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    }
  );
});

// Get a specific product
router.get('/products/:id', (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT * FROM products WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(results[0]);
    }
  );
});

// Add product to cart
router.post('/cart/add', isAuthenticated, (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.session.userId;

  // Check if the product exists and has sufficient stock
  db.query(
    'SELECT * FROM products WHERE id = ?',
    [productId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = results[0];
      if (product.stock_quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      // Check if the product is already in the cart
      db.query(
        'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
        [userId, productId],
        (err, results) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          if (results.length > 0) {
            // Update the quantity if the product is already in the cart
            db.query(
              'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
              [quantity, userId, productId],
              (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ error: 'Internal server error' });
                }
                res.json({ message: 'Product quantity updated in cart' });
              }
            );
          } else {
            // Add the product to the cart
            db.query(
              'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
              [userId, productId, quantity],
              (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ error: 'Internal server error' });
                }
                res.json({ message: 'Product added to cart' });
              }
            );
          }
        }
      );
    }
  );
});

// Get cart items
router.get('/cart', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  db.query(
    `SELECT cart_items.*, products.name, products.price, products.image_url
     FROM cart_items
     JOIN products ON cart_items.product_id = products.id
     WHERE cart_items.user_id = ?`,
    [userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    }
  );
});

// Update cart item quantity
router.put('/cart/update', isAuthenticated, (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.session.userId;

  // Check if the product exists and has sufficient stock
  db.query(
    'SELECT * FROM products WHERE id = ?',
    [productId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = results[0];
      if (product.stock_quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      // Update the cart item quantity
      db.query(
        'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          res.json({ message: 'Cart item quantity updated' });
        }
      );
    }
  );
});

// Remove item from cart
router.delete('/cart/remove/:productId', isAuthenticated, (req, res) => {
  const { productId } = req.params;
  const userId = req.session.userId;

  db.query(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ message: 'Item removed from cart' });
    }
  );
});

// Clear cart
router.delete('/cart/clear', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  db.query(
    'DELETE FROM cart_items WHERE user_id = ?',
    [userId],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ message: 'Cart cleared' });
    }
  );
});

module.exports = router;