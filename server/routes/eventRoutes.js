const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateUser, isFacultyOrAdmin } = require('../middleware/auth');

// OPTIONS route for CORS preflight requests
router.options('/bookings', (req, res) => {
  res.header('Allow', 'OPTIONS, POST, GET');
  res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204); // No content response
});

// Public routes - accessible to all users
router.get('/university', eventController.getUniversityEvents);
router.get('/details/:id', eventController.getEventDetails);

// Private routes - requires authentication
router.post('/bookings', authenticateUser, eventController.bookEvent);
router.get('/bookings/user', authenticateUser, eventController.getUserBookings);
router.patch('/bookings/:id/cancel', authenticateUser, eventController.cancelBooking);

// Faculty/Admin routes - requires role-based access
router.get('/hosted', authenticateUser, isFacultyOrAdmin, eventController.getHostedEvents);
router.post('/hosted', authenticateUser, isFacultyOrAdmin, eventController.createEvent);
router.get('/hosted/:id', authenticateUser, isFacultyOrAdmin, eventController.getHostedEventDetails);
router.put('/hosted/:id', authenticateUser, isFacultyOrAdmin, eventController.updateEvent);
router.delete('/hosted/:id', authenticateUser, isFacultyOrAdmin, eventController.deleteEvent);

module.exports = router;