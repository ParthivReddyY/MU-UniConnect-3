const express = require('express');
const router = express.Router();
const {
  register,
  createUser,
  login,
  verifyEmail,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  requestPasswordChangeOTP,
  getCurrentUser,
  checkEmail,
  changePassword
} = require('../controllers/authController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/check-email', checkEmail);

// Password reset flow (OTP-based)
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Password change flow (OTP-based, for logged-in users)
router.post('/request-password-change-otp', authenticateUser, requestPasswordChangeOTP);
router.post('/change-password', authenticateUser, changePassword);

// Protected routes
router.get('/me', authenticateUser, getCurrentUser);

// Admin-only routes
router.post('/create-user', authenticateUser, isAdmin, createUser);

module.exports = router;
