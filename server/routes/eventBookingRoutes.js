const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateUser } = require('../middleware/auth');

// OPTIONS route handling for all booking routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204); // No content response
});

// Booking-related routes
router.post('/', authenticateUser, eventController.bookEvent);
router.get('/user', authenticateUser, eventController.getUserBookings);
router.patch('/:id/cancel', authenticateUser, eventController.cancelBooking);

module.exports = router;