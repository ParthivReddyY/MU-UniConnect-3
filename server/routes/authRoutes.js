const express = require('express');
const router = express.Router();
const {
  register,
  createUser,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  checkEmail
} = require('../controllers/authController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', register); // Student registration only
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/check-email', checkEmail); // New endpoint for checking if email exists

// Protected routes
router.get('/me', authenticateUser, getCurrentUser);

// Admin-only routes
router.post('/create-user', authenticateUser, isAdmin, createUser);

module.exports = router;
