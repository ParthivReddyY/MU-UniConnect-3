const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateUser } = require('../middleware/auth');
const { isFacultyOrAdmin } = require('../middleware/roleCheck');

// Public university event routes - accessible to all users
router.get('/', eventController.getUniversityEvents);
router.get('/details/:id', eventController.getEventDetails);

// Faculty/Admin routes for managing university events
router.get('/hosted', authenticateUser, isFacultyOrAdmin, eventController.getHostedEvents);
router.post('/hosted', authenticateUser, isFacultyOrAdmin, eventController.createEvent);
router.get('/hosted/:id', authenticateUser, isFacultyOrAdmin, eventController.getHostedEventDetails);
router.put('/hosted/:id', authenticateUser, isFacultyOrAdmin, eventController.updateEvent);
router.delete('/hosted/:id', authenticateUser, isFacultyOrAdmin, eventController.deleteEvent);

module.exports = router;