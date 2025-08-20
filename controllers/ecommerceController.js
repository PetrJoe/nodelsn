const db = require('../db');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const userId = req.session.userId;

    // Validate input
    const errors = [];
    if (!name) errors.push('Name is required');
    if (!description) errors.push('Description is required');
    if (!price) errors.push('Price is required');
    if (!stock) errors.push('Stock is required');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Create the product in the database
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, stock, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, stock, userId]
    );

    res.status(201).json({ message: 'Product created successfully', productId: result.insertId });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

