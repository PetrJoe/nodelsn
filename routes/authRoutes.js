const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const ecommerceController = require('../controllers/ecommerceController');

// Registration
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password/:token', authController.resetPassword);

// Update profile
router.post('/update-profile', authController.updateProfile);

// Get user details
router.get('/user-details', authController.getUserDetails);

// Create product
router.post('/api/products', ecommerceController.createProduct);


module.exports = router;