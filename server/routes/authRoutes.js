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
  getCurrentUser,
  checkEmail,
  changePassword,
  requestPasswordChangeOTP,
  updateProfile,
  updateClubHead,
  searchUsers,
  getUserStats,
  verifyPassword // Added the new controller function
} = require('../controllers/authController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/check-email', checkEmail);

// User search route - protected, requires authentication
router.get('/search-users', authenticateUser, searchUsers);

// Password reset flow (OTP-based)
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Password change flow (OTP-based, for logged-in users)
router.post('/request-password-change-otp', authenticateUser, requestPasswordChangeOTP);
router.post('/change-password', authenticateUser, changePassword);
router.post('/verify-password', authenticateUser, verifyPassword); // Added the new endpoint

// Protected routes
router.get('/me', authenticateUser, getCurrentUser);

// Public routes - no authentication needed
router.get('/stats', getUserStats); // This route is public so Home page can access student count

// Public user creation route for clubs
router.post('/create-user', createUser);

// Add the update profile endpoint
router.put('/update-profile', authenticateUser, updateProfile);

// Add endpoint for updating club management relationship
// This is used after creating a club to associate it with a club account
// Making this public so it can be called after club creation
router.put('/update-club-head', updateClubHead);

module.exports = router;
