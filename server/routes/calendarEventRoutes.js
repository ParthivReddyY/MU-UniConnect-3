const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { 
  createCalendarEvent, 
  getUserEvents, 
  getPublicEvents, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} = require('../controllers/calendarEventController');

// Create a new calendar event (requires authentication)
router.post('/', authenticateUser, createCalendarEvent);

// Get current user's calendar events (requires authentication)
router.get('/user-events', authenticateUser, getUserEvents);

// Get public calendar events (no authentication required)
router.get('/public', getPublicEvents);

// Update a calendar event (requires authentication)
router.put('/:id', authenticateUser, updateCalendarEvent);

// Delete a calendar event (requires authentication)
router.delete('/:id', authenticateUser, deleteCalendarEvent);

module.exports = router;