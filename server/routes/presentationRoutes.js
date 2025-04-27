const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { isFacultyOrAdmin } = require('../middleware/roleCheck');
const presentationController = require('../controllers/presentationController');

// Protected routes
router.use(authenticateUser);

// Get all available presentation slots (for students to book)
router.get('/available', presentationController.getAvailablePresentationSlots);

// Get slots created by the logged-in faculty member
router.get('/faculty', isFacultyOrAdmin, presentationController.getFacultyPresentationSlots);

// Create a new presentation event (faculty only)
router.post('/', isFacultyOrAdmin, presentationController.createPresentationSlot);

// Book a presentation slot (student)
router.post('/:id/book', presentationController.bookPresentationSlot);

// Delete/cancel a presentation event (faculty who created it)
router.delete('/:id', isFacultyOrAdmin, presentationController.deletePresentationSlot);

// Get slots for a specific presentation (for grading)
router.get('/:id/slots', isFacultyOrAdmin, presentationController.getPresentationSlots);

// Start a presentation (change slot status to in-progress)
router.put('/slots/:slotId/start', isFacultyOrAdmin, presentationController.startPresentationSlot);

// Complete a presentation (grade and provide feedback)
router.put('/slots/:slotId/complete', isFacultyOrAdmin, presentationController.completePresentationSlot);

module.exports = router;
