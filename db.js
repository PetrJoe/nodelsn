const mysql = require('mysql2');
const fs = require('fs');

const caCert = fs.readFileSync('./certs/ca.pem');

const db = mysql.createConnection({
  host: '',
  port: 28290,
  user: '',
  password: '',
  database: '',
  ssl: {
    ca: caCert,
    rejectUnauthorized: true
  }
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
  console.log('Connected to MySQL DB');


  // Create new table with all required columns

    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        reset_token VARCHAR(64) DEFAULT NULL,
        reset_token_expiry DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

  // Check if the products table exists
    db.query("SHOW TABLES LIKE 'products'", (err, results) => {
    if (err) {
        console.error('Error checking for products table:', err);
        throw err;
    }

    if (results.length === 0) {
        // Table doesn't exist, create it
        const createProductsTableSQL = `
        CREATE TABLE products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            stock_quantity INT NOT NULL DEFAULT 0,
            image_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        db.query(createProductsTableSQL, (err) => {
        if (err) {
            console.error('Error creating products table:', err);
            throw err;
        }
        console.log('Products table created successfully');
        });
    } else {
        console.log('Products table already exists');
    }
    });

    // Check if the cart_items table exists
    db.query("SHOW TABLES LIKE 'cart_items'", (err, results) => {
    if (err) {
        console.error('Error checking for cart_items table:', err);
        throw err;
    }

    if (results.length === 0) {
        // Table doesn't exist, create it
        const createCartItemsTableSQL = `
        CREATE TABLE cart_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        db.query(createCartItemsTableSQL, (err) => {
        if (err) {
            console.error('Error creating cart_items table:', err);
            throw err;
        }
        console.log('Cart items table created successfully');
        });
    } else {
        console.log('Cart items table already exists');
    }
    });

    db.query(createTableSQL, (err) => {
        if (err) {
        console.error('Error creating table:', err);
        throw err;
        }
        console.log('New table created successfully with all columns');
    });
});

// Handle errors
db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

module.exports = db;



