const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../db');
const transporter = require('../config/mail');

const PORT = 3000;

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    (err) => {
      if (err) throw err;
      res.redirect('/login');
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) throw err;

      if (results.length === 0) return res.send('Invalid credentials');

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.userId = user.id;
        res.redirect('/dashboard');
      } else {
        res.send('Invalid credentials');
      }
    }
  );
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  db.query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
    [token, expiry, email],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) return res.send('No user with that email');

      const resetLink = `http://localhost:${PORT}/reset-password/${token}`;

      transporter.sendMail({
        from: '"Password Reset" <no-reply@example.com>',
        to: email,
        subject: 'Password Reset Link',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
      }, (err) => {
        if (err) {
          console.error(err);
          return res.send('Error sending email.');
        }

        res.send('Password reset link has been sent to your email.');
      });
    }
  );
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [hashedPassword, token],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) return res.send('Invalid or expired token.');

      res.send('Password has been reset. You can now <a href="/login">login</a>.');
    }
  );
};

exports.updateProfile = (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const { username, email, bio, location } = req.body;

  // Build the update query dynamically based on provided fields
  const updates = [];
  const values = [];

  if (username) {
    updates.push('username = ?');
    values.push(username);
  }
  if (email) {
    updates.push('email = ?');
    values.push(email);
  }

  // Only add bio and location to updates if they are provided
  if (bio !== undefined) {
    updates.push('bio = ?');
    values.push(bio || null);
  }

  if (location !== undefined) {
    updates.push('location = ?');
    values.push(location || null);
  }

  // If no fields are provided for update, redirect back to dashboard
  if (updates.length === 0) {
    return res.redirect('/dashboard');
  }

  // Add the user ID to the values array
  values.push(req.session.userId);

  // Construct the SQL query
  const updateSQL = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.query(
    updateSQL,
    values,
    (err, result) => {
      if (err) {
        console.error(err);
        return res.redirect('/dashboard?error=update_failed');
      }

      // Redirect back to dashboard with success message
      res.redirect('/dashboard?success=profile_updated');
    }
  );
};

exports.getUserDetails = (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

  db.query(
    'SELECT username, email, bio, location, created_at FROM users WHERE id = ?',
    [req.session.userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) return res.status(404).json({ error: 'User not found' });

      res.json(results[0]);
    }
  );
};